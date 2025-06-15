
import React from "react";
import StatisticSummary from "./StatisticSummary";

type Props = {
  reservations: number;
  personnes: number;
  jours: number;
};

const StatisticsIndicators: React.FC<Props> = ({ reservations, personnes, jours }) => (
  <StatisticSummary reservations={reservations} personnes={personnes} jours={jours} />
);

export default StatisticsIndicators;
