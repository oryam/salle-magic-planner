
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const StatisticSummary = ({
  reservations,
  personnes,
  jours,
}: {
  reservations: number;
  personnes: number;
  jours: number;
}) => (
  <div className="flex gap-4 mb-5 flex-wrap">
    <Card className="flex-1 min-w-[120px] bg-muted">
      <CardContent className="py-3 flex flex-col items-center">
        <div className="text-3xl font-bold">{reservations}</div>
        <div className="text-xs text-muted-foreground">Réservations</div>
      </CardContent>
    </Card>
    <Card className="flex-1 min-w-[120px] bg-muted">
      <CardContent className="py-3 flex flex-col items-center">
        <div className="text-3xl font-bold">{personnes}</div>
        <div className="text-xs text-muted-foreground">Personnes</div>
      </CardContent>
    </Card>
    <Card className="flex-1 min-w-[120px] bg-muted">
      <CardContent className="py-3 flex flex-col items-center">
        <div className="text-3xl font-bold">{jours}</div>
        <div className="text-xs text-muted-foreground">Jours couverts</div>
      </CardContent>
    </Card>
  </div>
);

export default StatisticSummary;
