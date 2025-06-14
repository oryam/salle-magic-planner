
import React, { useRef } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ImportExport = () => {
  const {
    salles,
    tables,
    reservations,
    importSalles,
    importTables,
    importReservations,
  } = useRestaurant();

  const salleInputRef = useRef<HTMLInputElement>(null);
  const tableInputRef = useRef<HTMLInputElement>(null);
  const reservationInputRef = useRef<HTMLInputElement>(null);

  // Helper: Télécharger en JSON
  const downloadJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handlers d'import
  const handleImport = (
    ref: React.RefObject<HTMLInputElement>,
    importFunc: (items: any[]) => void
  ) => {
    if (ref.current?.files && ref.current.files.length > 0) {
      const file = ref.current.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          importFunc(Array.isArray(data) ? data : []);
        } catch {
          alert("Format du fichier invalide !");
        }
      };
      reader.readAsText(file);
      ref.current.value = "";
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-4">Import / Export</h1>

      {/* Salles */}
      <Card className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Salles</span>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => downloadJSON(salles, "salles.json")}
            >
              Exporter
            </Button>
            <Button
              variant="outline"
              onClick={() => salleInputRef.current?.click()}
            >
              Importer
            </Button>
            <input
              type="file"
              accept=".json"
              ref={salleInputRef}
              className="hidden"
              onChange={() =>
                handleImport(salleInputRef, importSalles!)
              }
            />
          </div>
        </div>
      </Card>

      {/* Tables */}
      <Card className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Tables</span>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => downloadJSON(tables, "tables.json")}
            >
              Exporter
            </Button>
            <Button
              variant="outline"
              onClick={() => tableInputRef.current?.click()}
            >
              Importer
            </Button>
            <input
              type="file"
              accept=".json"
              ref={tableInputRef}
              className="hidden"
              onChange={() =>
                handleImport(tableInputRef, importTables!)
              }
            />
          </div>
        </div>
      </Card>

      {/* Réservations */}
      <Card className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Réservations</span>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() =>
                downloadJSON(reservations, "reservations.json")
              }
            >
              Exporter
            </Button>
            <Button
              variant="outline"
              onClick={() => reservationInputRef.current?.click()}
            >
              Importer
            </Button>
            <input
              type="file"
              accept=".json"
              ref={reservationInputRef}
              className="hidden"
              onChange={() =>
                handleImport(reservationInputRef, importReservations!)
              }
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ImportExport;
