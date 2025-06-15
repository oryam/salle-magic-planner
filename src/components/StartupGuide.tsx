
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const LOCALSTORAGE_KEY = "hideStartupGuide";

const features = [
  {
    title: "Configuration du restaurant",
    description: "Définissez vos salles et tables pour correspondre à l'agencement réel de votre établissement.",
  },
  {
    title: "Gestion visuelle des tables (‘Salle’)",
    description: "Disposez et organisez vos tables dans la salle pour visualiser et préparer l’espace.",
  },
  {
    title: "Réservations",
    description: "Ajoutez, modifiez ou supprimez des réservations ; consultez-les jour par jour.",
  },
  {
    title: "Statistiques",
    description: "Accédez à des graphiques sur la fréquentation et occupez-vous de vos analyses de performance.",
  },
  {
    title: "Import/Export",
    description: "Sauvegardez ou importez toutes vos données de configuration et de réservation au format CSV.",
  },
];

interface StartupGuideProps {
  open: boolean;
  onClose: () => void;
}

export const StartupGuide: React.FC<StartupGuideProps> = ({ open, onClose }) => {
  const [checked, setChecked] = useState(false);

  // Charge la préférence initiale (quand le guide s'ouvre)
  useEffect(() => {
    const stored = localStorage.getItem(LOCALSTORAGE_KEY);
    setChecked(stored === "1");
  }, [open]);

  const handleCheckboxChange = (value: boolean) => {
    setChecked(value);
    if (value) {
      localStorage.setItem(LOCALSTORAGE_KEY, "1");
    } else {
      localStorage.removeItem(LOCALSTORAGE_KEY);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogTitle>Bienvenue sur le gestionnaire de restaurant 👋</DialogTitle>
        <DialogDescription>
          <div className="space-y-2 mb-2">
            <p>
              Cette application vous permet de gérer simplement les réservations, la disposition des tables, ainsi que la configuration de votre restaurant.
            </p>
            <ul className="list-disc list-inside space-y-1">
              {features.map((feat, i) => (
                <li key={i}>
                  <span className="font-semibold">{feat.title} :</span>{" "}
                  <span>{feat.description}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Checkbox
              id="hideGuide"
              checked={checked}
              onCheckedChange={(v) => handleCheckboxChange(Boolean(v))}
            />
            <label htmlFor="hideGuide" className="text-sm cursor-pointer select-none">
              Ne plus afficher ce guide
            </label>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Commencer</Button>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
