import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Users, Calendar, Edit, Trash2 } from 'lucide-react';
import { useRestaurant } from '@/context/RestaurantContext';
import ReservationForm from '@/components/ReservationForm';
import TableIcon from '@/components/TableIcon';
import { format, addDays, addMonths, addYears, addWeeks, startOfDay, startOfMonth, startOfYear, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react'; // s'assure d'importer le bon icône
import ReservationCalendarView from '@/components/ReservationCalendarView';
import SalleSelector from '@/components/SalleSelector';
import { Search } from 'lucide-react'; // Ajout pour l'icône Loupe

type PeriodType = 'jour' | 'semaine' | 'mois' | 'annee';

const ALL_SALLES_VALUE = "all";

const Reservations = () => {
  const { getTablesWithReservations, salles, updateReservation, deleteReservation } = useRestaurant();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [period, setPeriod] = useState<PeriodType>('jour');
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [editingReservation, setEditingReservation] = useState<any>(null);
  const [calendarView, setCalendarView] = useState(false);
  const [newReservationDate, setNewReservationDate] = useState<Date | null>(null);
  const [newReservationTableId, setNewReservationTableId] = useState<string | null>(null);

  const [selectedSalleId, setSelectedSalleId] = useState<string>(ALL_SALLES_VALUE); // valeur "all" = toutes les salles
  const [searchTerm, setSearchTerm] = useState<string>(""); // état recherche

  const getCurrentPeriodStart = () => {
    switch (period) {
      case 'jour': return startOfDay(currentDate);
      case 'semaine': return startOfWeek(currentDate, { weekStartsOn: 1 });
      case 'mois': return startOfMonth(currentDate);
      case 'annee': return startOfYear(currentDate);
    }
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      switch (period) {
        case 'jour':
          return direction === 'next' ? addDays(prev, 1) : addDays(prev, -1);
        case 'semaine':
          return direction === 'next' ? addWeeks(prev, 1) : addWeeks(prev, -1);
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
      case 'semaine':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `Semaine du ${format(weekStart, 'dd/MM', { locale: fr })} au ${format(weekEnd, 'dd/MM/yyyy', { locale: fr })}`;
      case 'mois':
        return format(currentDate, 'MMMM yyyy', { locale: fr });
      case 'annee':
        return format(currentDate, 'yyyy', { locale: fr });
    }
  };

  const formatReservationDate = (date: Date) => {
    return format(date, 'EEE dd/MM HH:mm', { locale: fr });
  };

  // tables filtrées par salle sélectionnée
  const tablesWithReservations = getTablesWithReservations(getCurrentPeriodStart(), period, selectedSalleId === ALL_SALLES_VALUE ? "" : selectedSalleId);

  // Filtrage des tables/réservations selon la recherche
  const filteredTablesWithReservations = tablesWithReservations.map(table => {
    // si pas de recherche, retour direct
    if (!searchTerm.trim()) return table;

    // filtre les réservations de la table selon le nom client (insensible à la casse)
    const filteredReservations = table.reservations.filter(res =>
      res.nomClient?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // on ne garde la table que si elle a des réservations correspondantes ou s'il n'y a pas de recherche
    return { ...table, reservations: filteredReservations };
  }).filter(table => table.reservations.length > 0 || !searchTerm.trim());
  
  const stats = {
    tablesLibres: tablesWithReservations.filter(t => t.reservations.length === 0).length,
    nombreReservations: tablesWithReservations.reduce((sum, table) => sum + table.reservations.length, 0),
    totalPersonnes: tablesWithReservations
      .reduce((sum, table) => sum + table.reservations.reduce((tableSum, res) => tableSum + res.nombrePersonnes, 0), 0)
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

  const handleEditReservation = (reservation: any) => {
    setEditingReservation(reservation);
  };

  const handleSaveReservation = () => {
    if (editingReservation) {
      updateReservation(editingReservation.id, {
        date: new Date(editingReservation.date),
        heure: editingReservation.heure,
        nombrePersonnes: parseInt(editingReservation.nombrePersonnes),
        nomClient: editingReservation.nomClient
      });
      setEditingReservation(null);
    }
  };

  const handleDeleteReservation = (reservationId: string) => {
    deleteReservation(reservationId);
    setEditingReservation(null);
  };

  const handleReservationClick = (reservation: any) => {
    setEditingReservation(reservation);
  };

  const handleOpenReservationForm = (date: Date) => {
    setNewReservationDate(date);
  };

  const handleOpenReservationFormForTable = (tableId: string) => {
    setNewReservationTableId(tableId);
    setNewReservationDate(null); // ne pas pré-sélectionner de date
  };

  const handleCloseReservationForm = () => {
    setNewReservationDate(null);
    setNewReservationTableId(null);
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h1 className="text-lg sm:text-3xl font-bold">Tableau de bord des réservations</h1>
          <ReservationForm
            currentDate={currentDate}
            period={period}
            newReservationDate={newReservationDate}
            newReservationTableId={newReservationTableId}
            onDialogClose={handleCloseReservationForm}
            salleId={selectedSalleId === ALL_SALLES_VALUE ? undefined : selectedSalleId}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <SalleSelector
            salles={salles}
            selectedSalleId={selectedSalleId}
            onSalleChange={setSelectedSalleId}
            className="w-56"
            showAllOption // active l'option "Tout voir"
          />
          {/* Recherche nom client */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Rechercher un client"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-2 border border-input rounded-md w-full text-sm bg-background"
              />
            </div>
          </div>
        </div>
        
        {/* Contrôles de période */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center space-x-2 sm:space-x-4 w-full">
                <Select value={period} onValueChange={(value: PeriodType) => setPeriod(value)}>
                  <SelectTrigger className="w-24 sm:w-32 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jour">Jour</SelectItem>
                    <SelectItem value="semaine">Semaine</SelectItem>
                    <SelectItem value="mois">Mois</SelectItem>
                    <SelectItem value="annee">Année</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Button variant="outline" size="sm" className="px-2 py-1 sm:px-3 sm:py-2" onClick={() => navigatePeriod('prev')}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium min-w-32 sm:min-w-48 text-center text-xs sm:text-base">{formatPeriodDisplay()}</span>
                  <Button variant="outline" size="sm" className="px-2 py-1 sm:px-3 sm:py-2" onClick={() => navigatePeriod('next')}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                {/* Nouveau bouton "vue calendrier" */}
                <Button
                  type="button"
                  variant={calendarView ? "default" : "outline"}
                  size="icon"
                  aria-label="Vue calendrier"
                  className="ml-2"
                  onClick={() => setCalendarView(v => !v)}
                >
                  <CalendarIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Indicateurs clés */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Tables libres</p>
                  <p className="text-xl sm:text-3xl font-bold text-green-600">{stats.tablesLibres}</p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Réservations</p>
                  <p className="text-xl sm:text-3xl font-bold text-blue-600">{stats.nombreReservations}</p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Nombre de personnes</p>
                  <p className="text-xl sm:text-3xl font-bold text-purple-600">{stats.totalPersonnes}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vue Liste ou Vue Calendrier */}
        {calendarView ? (
          <ReservationCalendarView
            tablesWithReservations={filteredTablesWithReservations}
            period={period}
            currentDate={currentDate}
            onReservationClick={handleReservationClick}
            onAddReservation={handleOpenReservationForm}
          />
        ) : (
          <>
            {/* Liste des tables */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">État des tables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {filteredTablesWithReservations.map(table => (
                    <div
                      key={table.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 gap-2 sm:gap-0"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <TableIcon forme={table.forme} className="h-5 w-5 sm:h-6 sm:w-6" />
                        <button
                          type="button"
                          className="font-medium text-sm sm:text-base text-primary hover:underline focus:outline-none"
                          onClick={() => handleOpenReservationFormForTable(table.id)}
                          aria-label={`Ajouter une réservation sur table ${table.numero}`}
                        >
                          Table {table.numero}
                        </button>
                        <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                          <span className="text-xs sm:text-sm text-muted-foreground">{table.nombrePersonnes} personnes</span>
                          {getStatusBadge(table.statut)}
                        </div>
                      </div>
                      
                      {table.prochaineDateReservation && (
                        <div className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <button 
                                className="text-xs sm:text-sm font-medium hover:underline"
                                onClick={() => setSelectedTable(table)}
                              >
                                {formatReservationDate(table.prochaineDateReservation)}
                              </button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="text-base sm:text-lg">
                                  Réservations - Table {table.numero}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-3 max-h-96 overflow-y-auto">
                                {table.reservations.map(reservation => (
                                  <div key={reservation.id} className="flex items-center justify-between p-2 sm:p-3 border rounded">
                                    <div>
                                      <p className="font-medium text-sm sm:text-base">{reservation.nomClient}</p>
                                      <p className="text-xs sm:text-sm text-muted-foreground">
                                        {formatReservationDate(reservation.date)} - {reservation.nombrePersonnes} personnes
                                      </p>
                                    </div>
                                    <div className="flex space-x-1 sm:space-x-2">
                                      <Button size="sm" variant="outline" className="p-2 sm:p-3" onClick={() => handleEditReservation(reservation)}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" className="p-2 sm:p-3" onClick={() => handleDeleteReservation(reservation.id)}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                          {table.reservations.length > 1 && (
                            <p className="text-xs text-muted-foreground">
                              +{table.reservations.length - 1} autres réservations
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredTablesWithReservations.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-xs sm:text-base">
                        {searchTerm
                          ? "Aucune réservation trouvée"
                          : "Aucune table configurée"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Dialog d'édition de réservation */}
        <Dialog open={!!editingReservation} onOpenChange={() => setEditingReservation(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Modifier la réservation</DialogTitle>
            </DialogHeader>
            {editingReservation && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="nomClient" className="text-xs sm:text-sm">Nom du client</Label>
                  <Input
                    id="nomClient"
                    value={editingReservation.nomClient}
                    onChange={(e) => setEditingReservation({...editingReservation, nomClient: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="date" className="text-xs sm:text-sm">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={format(new Date(editingReservation.date), 'yyyy-MM-dd')}
                    onChange={(e) => setEditingReservation({...editingReservation, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="heure" className="text-xs sm:text-sm">Heure</Label>
                  <Input
                    id="heure"
                    type="time"
                    value={editingReservation.heure}
                    onChange={(e) => setEditingReservation({...editingReservation, heure: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="nombrePersonnes" className="text-xs sm:text-sm">Nombre de personnes</Label>
                  <Input
                    id="nombrePersonnes"
                    type="number"
                    value={editingReservation.nombrePersonnes}
                    onChange={(e) => setEditingReservation({...editingReservation, nombrePersonnes: e.target.value})}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button className="text-xs sm:text-sm" onClick={handleSaveReservation}>Sauvegarder</Button>
                  <Button variant="outline" className="text-xs sm:text-sm" onClick={() => setEditingReservation(null)}>Annuler</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Reservations;
