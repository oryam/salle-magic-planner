import React, { useRef } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

// --- Helpers CSV ---
function formatDateFr(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
function parseDateFr(str: string) {
  // attend "DD/MM/YYYY"
  if (!str) return null;
  const [day, month, year] = str.split("/");
  if (!day || !month || !year) return null;
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  if (isNaN(d.getTime())) return null;
  return d;
}

function arrayToCsv<T>(arr: T[], columns: (keyof T)[]): string {
  // Fonction d'échappement selon la norme CSV (RFC4180)
  // - Mettre entre quotes uniquement si contain: virgule, guillemet, CR ou LF
  // - Doubler chaque guillemet interne
  const escape = (v: any) => {
    if (v === undefined || v === null) return "";
    if (v instanceof Date) return formatDateFr(v);

    const s = String(v);
    if (/[",\r\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  // Les headers sans guillemets, sans transformation
  const header = columns.join(",");
  const rows = arr.map(obj =>
    columns.map(col => escape(obj[col])).join(",")
  );
  return [header, ...rows].join("\r\n");
}

// CSV simple parser
function csvToArray<T>(csv: string, columns: string[]): T[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const res: T[] = [];
  for (let i = 1; i < lines.length; i++) {
    let line = lines[i];
    if (line.trim() === "") continue;
    const values: string[] = [];
    let cur = "", inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '"' && (j === 0 || line[j - 1] !== "\\")) {
        inQuotes = !inQuotes;
      } else if (line[j] === "," && !inQuotes) {
        values.push(cur.replace(/^"|"$/g, "").replace(/""/g, '"'));
        cur = "";
      } else {
        cur += line[j];
      }
    }
    values.push(cur.replace(/^"|"$/g, "").replace(/""/g, '"'));
    const obj: any = {};
    for (let k = 0; k < columns.length; k++) {
      obj[columns[k]] = values[k] ?? null;
    }
    res.push(obj);
  }
  return res;
}

// Champs CSV : les plus courants et typés pour garder la compatibilité
const SallesColumns = ["id", "nom"];
const TablesColumns = [
  "id", "numero", "forme", "nombrePersonnes", "salleId", "position.x", "position.y", "rotation"
];
const ReservationsColumns = [
  "id", "tableId", "date", "heure", "nombrePersonnes", "nomClient"
];

// Pour les objets position/petits découpages
function tableToRow(table: any) {
  return {
    ...table,
    "position.x": table.position?.x ?? "",
    "position.y": table.position?.y ?? "",
    rotation: table.rotation ?? "",
  };
}

function rowToTable(row: any) {
  return {
    id: row.id,
    numero: Number(row.numero),
    forme: row.forme,
    nombrePersonnes: Number(row.nombrePersonnes),
    salleId: row.salleId,
    position: { x: Number(row["position.x"]), y: Number(row["position.y"]) },
    rotation: row.rotation ? Number(row.rotation) : undefined,
  };
}

function reservationRowToObj(row: any) {
  return {
    ...row,
    nombrePersonnes: Number(row.nombrePersonnes),
    date: parseDateFr(row.date),
    id: row.id,
    tableId: row.tableId,
    heure: row.heure,
    nomClient: row.nomClient,
  };
}

const ImportExport = () => {
  const {
    salles,
    tables,
    reservations,
    importSalles,
    importTables,
    importReservations,
    resetAllData,
  } = useRestaurant();

  const salleInputRef = useRef<HTMLInputElement>(null);
  const tableInputRef = useRef<HTMLInputElement>(null);
  const reservationInputRef = useRef<HTMLInputElement>(null);

  // Télécharger en CSV, avec BOM UTF-8 & bonne gestion date et accents
  const downloadCSV = (data: any[], columns: string[], filename: string, rowMapFn?: (d: any) => any) => {
    const mapped = rowMapFn ? data.map(rowMapFn) : data;
    const csv = arrayToCsv(mapped, columns);
    // BOM UTF-8 au début pour Excel & co, accent et caractères spéciaux OK
    const csvWithBom = "\uFEFF" + csv;
    const blob = new Blob([csvWithBom], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import CSV
  const handleImportCsv = (
    ref: React.RefObject<HTMLInputElement>,
    columns: string[],
    importFunc: (items: any[]) => void,
    rowMapFn?: (row: any) => any,
  ) => {
    if (ref.current?.files && ref.current.files.length > 0) {
      const file = ref.current.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          let array = csvToArray<any>(csv, columns);
          if (rowMapFn) {
            array = array.map(rowMapFn);
          }
          importFunc(array);
        } catch (e) {
          alert("Format du fichier CSV invalide !");
        }
      };
      reader.readAsText(file, "utf-8");
      ref.current.value = "";
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-4">Import / Export (format CSV)</h1>
      {/* Bouton Réinitialiser */}
      <div className="flex justify-end mb-3">
        <Button
          variant="destructive"
          onClick={() => {
            if (
              window.confirm(
                "Voulez-vous vraiment effacer toutes les données et réinitialiser avec l'exemple initial ?"
              )
            ) {
              resetAllData();
            }
          }}
        >
          Réinitialiser tout
        </Button>
      </div>

      {/* Salles */}
      <Card className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Salles</span>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => downloadCSV(salles, SallesColumns, "salles.csv")}
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
              accept=".csv"
              ref={salleInputRef}
              className="hidden"
              onChange={() =>
                handleImportCsv(salleInputRef, SallesColumns, importSalles)
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
              onClick={() => downloadCSV(tables, TablesColumns, "tables.csv", tableToRow)}
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
              accept=".csv"
              ref={tableInputRef}
              className="hidden"
              onChange={() =>
                handleImportCsv(tableInputRef, TablesColumns, importTables, rowToTable)
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
                downloadCSV(reservations, ReservationsColumns, "reservations.csv", (r) => ({
                  ...r,
                  date: formatDateFr(r.date), // format date export
                }))
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
              accept=".csv"
              ref={reservationInputRef}
              className="hidden"
              onChange={() =>
                handleImportCsv(
                  reservationInputRef,
                  ReservationsColumns,
                  importReservations,
                  reservationRowToObj // gère format date FR
                )
              }
            />
          </div>
        </div>
      </Card>

      {/* --- TABLEAUX DE DONNÉES --- */}
      <div className="space-y-8 mt-8">
        {/* Tableau Salles */}
        <Card>
          <div className="px-4 pt-4 pb-2 font-semibold">Aperçu des salles</div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {SallesColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {salles.map((salle) => (
                  <TableRow key={salle.id}>
                    {SallesColumns.map((col) => (
                      <TableCell key={col}>
                        {salle[col as keyof typeof salle]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {salles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={SallesColumns.length} className="text-center text-muted-foreground">
                      Aucune salle
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
        {/* Tableau Tables */}
        <Card>
          <div className="px-4 pt-4 pb-2 font-semibold">Aperçu des tables</div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {TablesColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((table) => {
                  const t = tableToRow(table);
                  return (
                    <TableRow key={table.id}>
                      {TablesColumns.map((col) => (
                        <TableCell key={col}>
                          {t[col]}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
                {tables.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={TablesColumns.length} className="text-center text-muted-foreground">
                      Aucune table
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
        {/* Tableau Réservations */}
        <Card>
          <div className="px-4 pt-4 pb-2 font-semibold">Aperçu des réservations</div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {ReservationsColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((r) => (
                  <TableRow key={r.id}>
                    {ReservationsColumns.map((col) => (
                      <TableCell key={col}>
                        {col === "date"
                          ? formatDateFr(r.date)
                          : (r as any)[col]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {reservations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={ReservationsColumns.length} className="text-center text-muted-foreground">
                      Aucune réservation
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ImportExport;
