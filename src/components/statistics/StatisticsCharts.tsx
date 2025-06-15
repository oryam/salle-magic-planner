
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ReservationLineChart from "./ReservationLineChart";
import StatisticsChart from "./StatisticsChart";

type StatChartDatum = {
  date: Date;
  reservations: number;
  personnes: number;
};

const StatisticsCharts = ({ data }: { data: StatChartDatum[] }) => (
  <>
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Historique du nombre de réservations</CardTitle>
      </CardHeader>
      <CardContent>
        <ReservationLineChart data={data} />
      </CardContent>
    </Card>
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Historique du nombre de personnes</CardTitle>
      </CardHeader>
      <CardContent>
        <StatisticsChart data={data} />
      </CardContent>
    </Card>
  </>
);

export default StatisticsCharts;
