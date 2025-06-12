
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Configuration des tables</h1>
          <TableForm />
        </div>

        <div className="grid gap-4">
          {tables.map((table) => (
            <Card key={table.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <TableIcon forme={table.forme} className="h-8 w-8" />
                    <div>
                      <h3 className="text-lg font-semibold">Table {table.numero}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{getShapeLabel(table.forme)}</Badge>
                        <Badge variant="secondary">{table.nombrePersonnes} personnes</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTable(table)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(table.id)}
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
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Modifier la table {editingTable.numero}</CardTitle>
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
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Aucune table configurée</p>
              <TableForm />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Configuration;
