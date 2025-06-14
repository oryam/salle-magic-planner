
import React, { useRef } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Import, Export } from 'lucide-react';
import { toast } from 'sonner';

const ImportExport = () => {
  const { 
    salles, tables, reservations,
    importSalles, importTables, importReservations 
  } = useRestaurant();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentImporter = useRef<(data: any) => void>(() => {});

  const exportData = (data: any, fileName: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${fileName} exporté avec succès.`);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const data = JSON.parse(content);
            currentImporter.current(data);
            toast.success(`Fichier importé avec succès.`);
          }
        } catch (error) {
          console.error("Erreur d'importation :", error);
          toast.error("Erreur d'importation", { description: "Le fichier JSON est peut-être invalide." });
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    if(event.target) {
      event.target.value = '';
    }
  };

  const triggerImport = (importer: (data: any) => void) => {
    currentImporter.current = importer;
    fileInputRef.current?.click();
  };
  
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Import / Export</h1>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".json"
      />
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Salles</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => triggerImport(importSalles)} variant="outline">
              <Import className="mr-2 h-4 w-4" /> Importer
            </Button>
            <Button onClick={() => exportData(salles, 'salles.json')}>
              <Export className="mr-2 h-4 w-4" /> Exporter
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tables</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => triggerImport(importTables)} variant="outline">
              <Import className="mr-2 h-4 w-4" /> Importer
            </Button>
            <Button onClick={() => exportData(tables, 'tables.json')}>
              <Export className="mr-2 h-4 w-4" /> Exporter
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Réservations</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => triggerImport(importReservations)} variant="outline">
              <Import className="mr-2 h-4 w-4" /> Importer
            </Button>
            <Button onClick={() => exportData(reservations, 'reservations.json')}>
              <Export className="mr-2 h-4 w-4" /> Exporter
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportExport;
