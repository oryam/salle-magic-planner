
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useRestaurant } from '@/context/RestaurantContext';
import TableForm from '@/components/TableForm';
import TableIcon from '@/components/TableIcon';
import { Table } from '@/types/restaurant';
import SalleSelector from '@/components/SalleSelector';

const Configuration = () => {
  const { tables, salles, addSalle, deleteSalle, deleteTable } = useRestaurant();
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [selectedSalleId, setSelectedSalleId] = useState<string>(salles[0]?.id || "");

  const handleDeleteTable = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette table ?')) {
      deleteTable(id);
    }
  };

  const handleDeleteSalle = (id: string) => {
    if (confirm('Supprimer cette salle et toutes ses tables ?')) {
      deleteSalle(id);
      setSelectedSalleId((prev) => (prev === id ? salles[0]?.id || "" : prev));
    }
  };

  const [nouvelleSalle, setNouvelleSalle] = useState("");
  const handleAjouterSalle = () => {
    if (nouvelleSalle.trim()) {
      addSalle(nouvelleSalle.trim());
      setNouvelleSalle("");
    }
  };

  const getShapeLabel = (forme: string) => {
    switch (forme) {
      case 'ronde': return 'Ronde';
      case 'carre': return 'Carrée';
      case 'rectangulaire': return 'Rectangulaire';
      default: return forme;
    }
  };

  const tablesForSalle = tables.filter(t => t.salleId === selectedSalleId);

  return (
    <div className="min-h-screen bg-background p-2 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header CRUD des salles et bouton Ajouter Table */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold">
            Configuration des tables
          </h1>
        </div>

        {/* Contrôles salles et ajout */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center mb-4">
          {/* Bloc gestion des salles à gauche */}
          <div className="flex gap-2 items-center">
            <SalleSelector
              salles={salles}
              selectedSalleId={selectedSalleId}
              onSalleChange={setSelectedSalleId}
              className="w-44 sm:w-56"
            />
            <input
              type="text"
              value={nouvelleSalle}
              onChange={e => setNouvelleSalle(e.target.value)}
              placeholder="Nouvelle salle"
              className="border border-gray-300 rounded px-2 h-10"
            />
            <Button variant="outline" onClick={handleAjouterSalle}>
              <Plus className="w-4 h-4 mr-2" />Ajouter
            </Button>
            {salles.length > 1 && (
              <Button variant="destructive" onClick={() => handleDeleteSalle(selectedSalleId)}>
                <Trash2 className="w-4 h-4 mr-2" /> Supprimer la salle
              </Button>
            )}
          </div>
          {/* Bouton Ajouter Table à droite */}
          <div className="flex-1 flex justify-end w-full sm:w-auto">
            <TableForm salleId={selectedSalleId} />
          </div>
        </div>

        <div className="grid gap-4">
          {tablesForSalle.map((table) => (
            <Card key={table.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <TableIcon forme={table.forme} className="h-7 w-7 sm:h-8 sm:w-8" />
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">
                        Table {table.numero}
                      </h3>
                      <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs sm:text-sm">{getShapeLabel(table.forme)}</Badge>
                        <Badge variant="secondary" className="text-xs sm:text-sm">{table.nombrePersonnes} personnes</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1 sm:space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTable(table)}
                      className="text-xs sm:text-sm"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTable(table.id)}
                      className="text-xs sm:text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {editingTable && (
          <Card className="mt-4 sm:mt-6">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                Modifier la table {editingTable.numero}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TableForm
                table={editingTable}
                isEdit={true}
                onClose={() => setEditingTable(null)}
                salleId={editingTable.salleId}
              />
            </CardContent>
          </Card>
        )}

        {tablesForSalle.length === 0 && (
          <Card>
            <CardContent className="p-8 sm:p-12 text-center">
              <p className="text-sm sm:text-base text-muted-foreground mb-4">Aucune table configurée dans cette salle</p>
              <TableForm salleId={selectedSalleId} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Configuration;
