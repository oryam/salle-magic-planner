
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { useRestaurant } from '@/context/RestaurantContext';
import TableForm from '@/components/TableForm';
import TableIcon from '@/components/TableIcon';
import { Table } from '@/types/restaurant';

const Configuration = () => {
  const { tables, deleteTable } = useRestaurant();
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette table ?')) {
      deleteTable(id);
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

  return (
    <div className="min-h-screen bg-background p-2 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold">
            Configuration des tables
          </h1>
          <TableForm />
        </div>

        <div className="grid gap-4">
          {tables.map((table) => (
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
                      onClick={() => handleDelete(table.id)}
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
              />
            </CardContent>
          </Card>
        )}

        {tables.length === 0 && (
          <Card>
            <CardContent className="p-8 sm:p-12 text-center">
              <p className="text-sm sm:text-base text-muted-foreground mb-4">Aucune table configurée</p>
              <TableForm />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Configuration;
