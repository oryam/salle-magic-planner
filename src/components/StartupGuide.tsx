
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const LOCALSTORAGE_KEY = "hideStartupGuide";

const features = [
  {
    title: "Configuration du restaurant",
    description:
      "Définissez vos salles et tables pour correspondre à l'agencement réel de votre établissement."
  },
  {
    title: "Gestion visuelle des tables (‘Salle’)",
    description:
      "Disposez et organisez vos tables dans la salle pour visualiser et préparer l’espace."
  },
  {
    title: "Réservations",
    description:
      "Ajoutez, modifiez ou supprimez des réservations ; consultez-les jour par jour."
  },
  {
    title: "Statistiques",
    description:
      "Accédez à des graphiques sur la fréquentation et occupez-vous de vos analyses de performance."
  },
  {
    title: "Import/Export",
    description:
      "Sauvegardez ou importez toutes vos données de configuration et de réservation au format CSV."
  }
];

interface StartupGuideProps {
  open: boolean;
  onClose: () => void;
}

export const StartupGuide: React.FC<StartupGuideProps> = ({ open, onClose }) => {
  const [checked, setChecked] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(LOCALSTORAGE_KEY);
    setChecked(stored === "1");
    setStep(0);
  }, [open]);

  const handleCheckboxChange = (value: boolean) => {
    setChecked(value);
    if (value) {
      localStorage.setItem(LOCALSTORAGE_KEY, "1");
    } else {
      localStorage.removeItem(LOCALSTORAGE_KEY);
    }
  };

  const handleNext = () => {
    if (step < features.length - 1) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogTitle>Bienvenue sur le gestionnaire de restaurant 👋</DialogTitle>
        <DialogDescription>
          <div className="space-y-2 mb-3 min-h-28">
            {step === 0 && (
              <p>
                Cette application vous permet de gérer simplement les réservations, la disposition des tables, ainsi que la configuration de votre restaurant.
              </p>
            )}
            <div>
              <div className="font-semibold text-base mb-1">
                {features[step].title}
              </div>
              <div className="text-sm">{features[step].description}</div>
            </div>
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
          {/* Ligne de navigation étape précédente/suivante */}
          <div className="flex items-center justify-center pt-4 gap-0">
            <Button
              variant="secondary"
              className="rounded-full p-2"
              onClick={handlePrevious}
              disabled={step === 0}
              aria-label="Étape précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="inline-block px-4 text-xs text-muted-foreground">
              Étape {step + 1} / {features.length}
            </span>
            {step < features.length - 1 ? (
              <Button
                variant="secondary"
                className="rounded-full p-2"
                onClick={handleNext}
                aria-label="Étape suivante"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="rounded-full px-4"
                onClick={onClose}
                aria-label="Fermer le guide"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
