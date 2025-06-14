
import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Salle } from "@/types/restaurant";

interface SalleSelectorProps {
  salles: Salle[];
  selectedSalleId: string;
  onSalleChange: (id: string) => void;
  className?: string;
  showAllOption?: boolean; // nouvelle prop optionnelle
}

const SalleSelector: React.FC<SalleSelectorProps> = ({
  salles,
  selectedSalleId,
  onSalleChange,
  className,
  showAllOption = false,
}) => (
  <Select value={selectedSalleId} onValueChange={onSalleChange}>
    <SelectTrigger className={className}>
      <SelectValue placeholder="Sélectionner une salle" />
    </SelectTrigger>
    <SelectContent>
      {showAllOption && (
        <SelectItem value="">
          Tout voir
        </SelectItem>
      )}
      {salles.map((salle) => (
        <SelectItem key={salle.id} value={salle.id}>{salle.nom}</SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default SalleSelector;

