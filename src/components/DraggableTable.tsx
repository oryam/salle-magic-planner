
import { useState } from 'react';
import { Table, TableShape } from '@/types/restaurant';
import { useRestaurant } from '@/context/RestaurantContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCw, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableTableProps {
  table: Table;
  statut: 'libre' | 'reservee' | 'attente';
}

const DraggableTable = ({ table, statut }: DraggableTableProps) => {
  const { updateTable, getTableStatus } = useRestaurant();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [customColor, setCustomColor] = useState(table.couleur || '');

  const getStatusColor = () => {
    if (table.couleur) return table.couleur;
    
    switch (statut) {
      case 'reservee': return '#22c55e'; // vert
      case 'attente': return '#eab308'; // jaune
      case 'libre': return '#6b7280'; // gris
      default: return '#6b7280';
    }
  };

  const getTableShape = (forme: TableShape, rotation = 0) => {
    const baseSize = 60;
    const style = {
      backgroundColor: getStatusColor(),
      border: '2px solid #374151',
      cursor: 'move',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '12px',
      transform: `rotate(${rotation}deg)`,
    };

    switch (forme) {
      case 'ronde':
        return (
          <div
            style={{
              ...style,
              width: baseSize,
              height: baseSize,
              borderRadius: '50%',
            }}
          >
            {table.numero}
          </div>
        );
      case 'carre':
        return (
          <div
            style={{
              ...style,
              width: baseSize,
              height: baseSize,
            }}
          >
            {table.numero}
          </div>
        );
      case 'rectangulaire':
        return (
          <div
            style={{
              ...style,
              width: baseSize * 1.5,
              height: baseSize * 0.7,
            }}
          >
            {table.numero}
          </div>
        );
      default:
        return null;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - (table.position?.x || 0),
      y: e.clientY - (table.position?.y || 0)
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      updateTable(table.id, {
        position: { x: Math.max(0, newX), y: Math.max(0, newY) }
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    if (table.forme === 'rectangulaire') {
      const newRotation = ((table.rotation || 0) + 90) % 360;
      updateTable(table.id, { rotation: newRotation });
    }
  };

  const handleColorChange = () => {
    updateTable(table.id, { couleur: customColor });
    setColorDialogOpen(false);
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: table.position?.x || 0,
        top: table.position?.y || 0,
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="relative group">
        {getTableShape(table.forme, table.rotation)}
        
        <div className="absolute -top-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          {table.forme === 'rectangulaire' && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleRotate();
              }}
              className="h-6 w-6 p-0"
            >
              <RotateCw className="h-3 w-3" />
            </Button>
          )}
          
          <Dialog open={colorDialogOpen} onOpenChange={setColorDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => e.stopPropagation()}
                className="h-6 w-6 p-0"
              >
                <Palette className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Personnaliser la couleur - Table {table.numero}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="color">Couleur personnalisée</Label>
                  <Input
                    id="color"
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleColorChange}>Appliquer</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      updateTable(table.id, { couleur: undefined });
                      setColorDialogOpen(false);
                    }}
                  >
                    Couleur automatique
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="absolute -bottom-6 left-0 text-xs text-muted-foreground">
          {table.nombrePersonnes}p
        </div>
      </div>
    </div>
  );
};

export default DraggableTable;
