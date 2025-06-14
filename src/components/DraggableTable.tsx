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
  reservations?: any[];
  currentDate?: Date;
}

const DraggableTable = ({ table, statut, reservations = [], currentDate = new Date() }: DraggableTableProps) => {
  const { updateTable, getTableStatus } = useRestaurant();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [customColor, setCustomColor] = useState(table.couleur || '');

  // Obtenir les réservations pour la date courante
  const getTodayReservations = () => {
    const targetDate = new Date(currentDate);
    targetDate.setHours(0, 0, 0, 0);
    
    return reservations.filter(res => {
      const resDate = new Date(res.date);
      resDate.setHours(0, 0, 0, 0);
      return resDate.getTime() === targetDate.getTime();
    });
  };

  const todayReservations = getTodayReservations();
  const todayReservation = todayReservations[0]; // Première réservation du jour

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
      touchAction: 'none',
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

  // Fonction pour obtenir les coordonnées depuis un événement (souris ou tactile)
  const getEventCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      // Événement tactile
      return {
        clientX: e.touches[0]?.clientX || 0,
        clientY: e.touches[0]?.clientY || 0
      };
    } else {
      // Événement souris
      return {
        clientX: e.clientX,
        clientY: e.clientY
      };
    }
  };

  // Gestionnaires pour les événements de souris
  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getEventCoordinates(e);
    setIsDragging(true);
    setDragStart({
      x: coords.clientX - (table.position?.x || 0),
      y: coords.clientY - (table.position?.y || 0)
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const coords = getEventCoordinates(e);
      const newX = coords.clientX - dragStart.x;
      const newY = coords.clientY - dragStart.y;
      
      updateTable(table.id, {
        position: { x: Math.max(0, newX), y: Math.max(0, newY) }
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Gestionnaires pour les événements tactiles
  const handleTouchStart = (e: React.TouchEvent) => {
    const coords = getEventCoordinates(e);
    setIsDragging(true);
    setDragStart({
      x: coords.clientX - (table.position?.x || 0),
      y: coords.clientY - (table.position?.y || 0)
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault(); // Empêche le scroll de la page
      const coords = getEventCoordinates(e);
      const newX = coords.clientX - dragStart.x;
      const newY = coords.clientY - dragStart.y;
      
      updateTable(table.id, {
        position: { x: Math.max(0, newX), y: Math.max(0, newY) }
      });
    }
  };

  const handleTouchEnd = () => {
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

  // Nouvelle fonction pour générer les chaises autour de la table
  const renderChairs = (forme: TableShape, nombre: number, rotation = 0) => {
    const chairs = [];
    const baseSize = 60; // diamètre ou côté de base
    const chairSize = 16;
    const radius = baseSize / 2 + 8; // espace entre la table et les chaises

    if (nombre === 0) return null;

    if (forme === 'ronde') {
      // Disposer les chaises en cercle 
      for (let i = 0; i < nombre; i++) {
        const angle = ((2 * Math.PI) / nombre) * i + ((rotation || 0) * Math.PI / 180);
        const x = Math.cos(angle) * radius + baseSize / 2 - chairSize / 2;
        const y = Math.sin(angle) * radius + baseSize / 2 - chairSize / 2;
        chairs.push(
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: chairSize,
              height: chairSize,
              background: '#d1d5db', // gris clair
              border: '2px solid #374151',
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(60,60,60,0.08)',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          />
        );
      }
    } else if (forme === 'carre' || forme === 'rectangulaire') {
      // Répartir sur les 4 côtés (même nombre de chaises par côté si possible)
      const w = forme === 'carre' ? baseSize : baseSize * 1.5;
      const h = forme === 'carre' ? baseSize : baseSize * 0.7;
      const chairsPerSide = [0, 0, 0, 0];
      let reste = nombre;
      // D'abord, assigner autant que possible équitablement
      for (let i = 0; i < 4; i++) {
        chairsPerSide[i] = Math.floor(nombre / 4);
      }
      // Puis distribuer le reste
      for (let i = 0; i < nombre % 4; i++) {
        chairsPerSide[i]++;
      }
      // Haut
      for (let i = 0; i < chairsPerSide[0]; i++) {
        const x = ((w - chairSize) / (chairsPerSide[0] + 1)) * (i + 1);
        chairs.push(
          <div
            key={`top-${i}`}
            style={{
              position: 'absolute',
              left: x,
              top: -chairSize - 4,
              width: chairSize,
              height: chairSize,
              background: '#d1d5db',
              border: '2px solid #374151',
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(60,60,60,0.08)',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          />
        );
      }
      // Bas
      for (let i = 0; i < chairsPerSide[2]; i++) {
        const x = ((w - chairSize) / (chairsPerSide[2] + 1)) * (i + 1);
        chairs.push(
          <div
            key={`bottom-${i}`}
            style={{
              position: 'absolute',
              left: x,
              top: h + 4,
              width: chairSize,
              height: chairSize,
              background: '#d1d5db',
              border: '2px solid #374151',
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(60,60,60,0.08)',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          />
        );
      }
      // Gauche
      for (let i = 0; i < chairsPerSide[3]; i++) {
        const y = ((h - chairSize) / (chairsPerSide[3] + 1)) * (i + 1);
        chairs.push(
          <div
            key={`left-${i}`}
            style={{
              position: 'absolute',
              left: -chairSize - 4,
              top: y,
              width: chairSize,
              height: chairSize,
              background: '#d1d5db',
              border: '2px solid #374151',
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(60,60,60,0.08)',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          />
        );
      }
      // Droite
      for (let i = 0; i < chairsPerSide[1]; i++) {
        const y = ((h - chairSize) / (chairsPerSide[1] + 1)) * (i + 1);
        chairs.push(
          <div
            key={`right-${i}`}
            style={{
              position: 'absolute',
              left: w + 4,
              top: y,
              width: chairSize,
              height: chairSize,
              background: '#d1d5db',
              border: '2px solid #374151',
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(60,60,60,0.08)',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          />
        );
      }
    }
    return chairs;
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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative group"
        style={{ 
          width:
            table.forme === 'ronde'
              ? 60
              : table.forme === 'carre'
                ? 60
                : 90,
          height:
            table.forme === 'ronde'
              ? 60
              : table.forme === 'carre'
                ? 60
                : 42
        }}
      >
        {/* Chaises autour de la table */}
        {renderChairs(table.forme, table.nombrePersonnes, table.rotation || 0)}
        {/* Table */}
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

        {/* Informations de réservation actualisées */}
        {statut === 'reservee' && todayReservation && (
          <div className="absolute -bottom-12 left-0 text-xs bg-white text-black px-1 py-0.5 rounded shadow-sm border max-w-20 text-center">
            <div className="font-semibold">{todayReservation.nombrePersonnes}p</div>
            {todayReservation.nomClient && (
              <div className="truncate">{todayReservation.nomClient}</div>
            )}
            {todayReservations.length > 1 && (
              <div className="text-xs text-muted-foreground">
                +{todayReservations.length - 1} autres
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DraggableTable;
