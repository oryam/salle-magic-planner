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

    if (nombre === 0) return null;

    if (forme === 'ronde') {
      // Disposer les chaises en cercle 
      for (let i = 0; i < nombre; i++) {
        const angle = ((2 * Math.PI) / nombre) * i + ((rotation || 0) * Math.PI / 180);
        const x = Math.cos(angle) * (baseSize / 2 + 8) + baseSize / 2 - chairSize / 2;
        const y = Math.sin(angle) * (baseSize / 2 + 8) + baseSize / 2 - chairSize / 2;
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
    } else if (forme === 'carre') {
      // Répartir en alternant côté opposé (haut/bas, gauche/droite)
      const w = baseSize;
      const h = baseSize;
      // Ordre des faces : haut -> bas -> gauche -> droite (puis recommence)
      const placements = ["top", "bottom", "left", "right"];
      for (let i = 0; i < nombre; i++) {
        const positionType = placements[i % 4];
        let chairProps: React.CSSProperties = {
          position: 'absolute',
          width: chairSize,
          height: chairSize,
          background: '#d1d5db',
          border: '2px solid #374151',
          borderRadius: '6px',
          boxShadow: '0 1px 3px rgba(60,60,60,0.08)',
          zIndex: 1,
          pointerEvents: 'none'
        };
        switch (positionType) {
          case "top":
            chairProps.left = ((w - chairSize) / (Math.ceil(nombre / 4) + 1)) * (Math.floor(i / 4) + 1);
            chairProps.top = -chairSize - 4;
            break;
          case "bottom":
            chairProps.left = ((w - chairSize) / (Math.ceil(nombre / 4) + 1)) * (Math.floor(i / 4) + 1);
            chairProps.top = h + 4;
            break;
          case "left":
            chairProps.left = -chairSize - 4;
            chairProps.top = ((h - chairSize) / (Math.ceil(nombre / 4) + 1)) * (Math.floor(i / 4) + 1);
            break;
          case "right":
            chairProps.left = w + 4;
            chairProps.top = ((h - chairSize) / (Math.ceil(nombre / 4) + 1)) * (Math.floor(i / 4) + 1);
            break;
        }
        chairs.push(<div key={`carre-${i}`} style={chairProps} />);
      }
    } else if (forme === 'rectangulaire') {
      // Répartition : 1 chaise sur chaque largeur (gauche/droite, côtés courts), le reste sur les longueurs (haut/bas, côtés longs)
      const w = baseSize * 1.5; // longueur (horizontal)
      const h = baseSize * 0.7; // largeur (vertical)

      if (nombre === 1) {
        // Une seule chaise, positionnée à gauche (largeur)
        chairs.push(
          <div
            key="width-left-0"
            style={{
              position: 'absolute',
              left: -chairSize - 4,
              top: (h - chairSize) / 2,
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
      } else if (nombre === 2) {
        // Une chaise à gauche, une à droite
        chairs.push(
          <div
            key="width-left-0"
            style={{
              position: 'absolute',
              left: -chairSize - 4,
              top: (h - chairSize) / 2,
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
        chairs.push(
          <div
            key="width-right-0"
            style={{
              position: 'absolute',
              left: w + 4,
              top: (h - chairSize) / 2,
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
      } else {
        // 1 chaise sur chaque largeur (gauche/droite), le reste réparti sur longueurs (haut/bas)
        const minChairsOnWidth = 2; // 1 à gauche, 1 à droite
        const longSideChairs = nombre - minChairsOnWidth;
        const perLongSide = Math.floor(longSideChairs / 2);
        const extra = longSideChairs % 2;

        // Gauche (largeur/côté court)
        chairs.push(
          <div
            key="width-left-0"
            style={{
              position: 'absolute',
              left: -chairSize - 4,
              top: (h - chairSize) / 2,
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
        // Droite (largeur/côté court)
        chairs.push(
          <div
            key="width-right-0"
            style={{
              position: 'absolute',
              left: w + 4,
              top: (h - chairSize) / 2,
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
        // Haut (longueur/côté long)
        for (let i = 0; i < perLongSide + (extra > 0 ? 1 : 0); i++) {
          const x = ((w - chairSize) / (perLongSide + (extra > 0 ? 1 : 0) + 1)) * (i + 1);
          chairs.push(
            <div
              key={`long-top-${i}`}
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
        // Bas (longueur/côté long)
        for (let i = 0; i < perLongSide; i++) {
          const x = ((w - chairSize) / (perLongSide + 1)) * (i + 1);
          chairs.push(
            <div
              key={`long-bottom-${i}`}
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
      }
    }
    return chairs;
  };

  // Fonction utilitaire pour bien répartir les chaises si le nombre total à gauche/droite diffère
  function perLongLongSideDivisor(perLongSide: number, extra: number) {
    return perLongSide + (extra > 0 ? 0 : 0); // simple, mais permet extension/fine tuning si besoin plus tard
  }

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
