
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Users, Calendar } from 'lucide-react';
import { useRestaurant } from '@/context/RestaurantContext';
import ReservationForm from '@/components/ReservationForm';
import TableIcon from '@/components/TableIcon';
import { format, addDays, addMonths, addYears, startOfDay, startOfMonth, startOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';

type PeriodType = 'jour' | 'mois' | 'annee';

const Reservations = () => {
  const { getTablesWithReservations } = useRestaurant();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [period, setPeriod] = useState<PeriodType>('jour');

  const getCurrentPeriodStart = () => {
    switch (period) {
      case 'jour': return startOfDay(currentDate);
      case 'mois': return startOfMonth(currentDate);
      case 'annee': return startOfYear(currentDate);
    }
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      switch (period) {
        case 'jour':
          return direction === 'next' ? addDays(prev, 1) : addDays(prev, -1);
        case 'mois':
          return direction === 'next' ? addMonths(prev, 1) : addMonths(prev, -1);
        case 'annee':
          return direction === 'next' ? addYears(prev, 1) : addYears(prev, -1);
      }
    });
  };

  const formatPeriodDisplay = () => {
    switch (period) {
      case 'jour':
        return format(currentDate, 'EEEE dd MMMM yyyy', { locale: fr });
      case 'mois':
        return format(currentDate, 'MMMM yyyy', { locale: fr });
      case 'annee':
        return format(currentDate, 'yyyy', { locale: fr });
    }
  };

  const formatReservationDate = (date: Date) => {
    return format(date, 'EEE dd/MM HH:mm', { locale: fr });
  };

  const tablesWithReservations = getTablesWithReservations(getCurrentPeriodStart());
  
  const stats = {
    tablesLibres: tablesWithReservations.filter(t => t.statut === 'libre').length,
    tablesReservees: tablesWithReservations.filter(t => t.statut === 'reservee').length,
    totalPersonnes: tablesWithReservations
      .filter(t => t.statut === 'reservee')
      .reduce((sum, table) => sum + table.nombrePersonnes, 0)
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'reservee':
        return <Badge className="bg-green-500 text-white">Réservée</Badge>;
      case 'attente':
        return <Badge className="bg-yellow-500 text-white">En attente</Badge>;
      case 'libre':
        return <Badge variant="secondary">Libre</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tableau de bord des réservations</h1>
          <ReservationForm />
        </div>

        {/* Contrôles de période */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Select value={period} onValueChange={(value: PeriodType) => setPeriod(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jour">Jour</SelectItem>
                    <SelectItem value="mois">Mois</SelectItem>
                    <SelectItem value="annee">Année</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigatePeriod('prev')}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium min-w-48 text-center">{formatPeriodDisplay()}</span>
                  <Button variant="outline" size="sm" onClick={() => navigatePeriod('next')}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Indicateurs clés */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tables libres</p>
                  <p className="text-3xl font-bold text-green-600">{stats.tablesLibres}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tables réservées</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.tablesReservees}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre de personnes</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalPersonnes}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des tables */}
        <Card>
          <CardHeader>
            <CardTitle>État des tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tablesWithReservations.map(table => (
                <div
                  key={table.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-4">
                    <TableIcon forme={table.forme} className="h-6 w-6" />
                    <div>
                      <span className="font-medium">Table {table.numero}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {table.nombrePersonnes} personnes
                        </span>
                        {getStatusBadge(table.statut)}
                      </div>
                    </div>
                  </div>
                  
                  {table.prochaineDateReservation && (
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatReservationDate(table.prochaineDateReservation)}
                      </p>
                      {table.reservations.length > 1 && (
                        <p className="text-xs text-muted-foreground">
                          +{table.reservations.length - 1} autres réservations
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {tablesWithReservations.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucune table configurée</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reservations;
