
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, Users, StickyNote, Trash2 } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useReservasSala, WORKING_HOURS, SLOT_DURATION_MINUTES } from '@/contexts/ReservasSalaContext';
import { useAuth } from '@/contexts/AuthContext';
import type { ReservaSala, Role } from '@/lib/types';
import { format, parse, addMinutes, startOfMonth, isSameDay, isBefore, isEqual, parseISO, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const reservaSchema = z.object({
  responsable: z.string().min(3, "El nombre del responsable es obligatorio."),
  tema: z.string().min(3, "El tema de la reunión es obligatorio."),
  horaInicio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora de inicio inválida."),
  horaFin: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora de finalización inválida."),
}).superRefine((data, ctx) => {
  const datePlaceholder = new Date(); // Date doesn't matter, only time
  const inicio = parse(data.horaInicio, 'HH:mm', datePlaceholder);
  const fin = parse(data.horaFin, 'HH:mm', datePlaceholder);
  if (isAfter(inicio, fin) || isEqual(inicio, fin)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La hora de finalización debe ser posterior a la hora de inicio.",
      path: ["horaFin"],
    });
  }
});

type ReservaFormValues = z.infer<typeof reservaSchema>;

// Helper function to generate time slots
const generateTimeSlots = (startHour: number, endHour: number, intervalMinutes: number): string[] => {
  const slots: string[] = [];
  let currentTime = new Date();
  currentTime.setHours(startHour, 0, 0, 0);

  const endTimeLimit = new Date();
  endTimeLimit.setHours(endHour, 0, 0, 0);

  while (isBefore(currentTime, endTimeLimit)) {
    slots.push(format(currentTime, 'HH:mm'));
    currentTime = addMinutes(currentTime, intervalMinutes);
  }
  return slots;
};

const allPossibleSlots = generateTimeSlots(WORKING_HOURS.start, WORKING_HOURS.end, SLOT_DURATION_MINUTES);

export default function SalaReunionesPage() {
  const { userRole } = useAuth();
  const { reservas, addReserva, getReservasPorFecha, isSlotOverlapping, isLoading, deleteReserva } = useReservasSala();
  
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [preSelectedStartTime, setPreSelectedStartTime] = useState<string | undefined>();

  const [reservaToDeleteId, setReservaToDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ReservaFormValues>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      responsable: '',
      tema: '',
      horaInicio: '',
      horaFin: '',
    },
  });

  const selectedHoraInicio = watch("horaInicio");

  const onSubmit: SubmitHandler<ReservaFormValues> = (data) => {
    if (!selectedDate || !userRole) return;
    const fechaStr = format(selectedDate, 'yyyy-MM-dd');
    
    const success = addReserva({ ...data, fecha: fechaStr }, userRole as Role);
    if (success) {
      reset();
      setShowBookingForm(false);
      setPreSelectedStartTime(undefined);
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setShowBookingForm(false); // Hide form when changing day
    setPreSelectedStartTime(undefined);
    reset(); // Reset form fields
  };

  const handleBookSlotClick = (startTime?: string) => {
    reset(); // Clear previous form data
    if (startTime) {
      setPreSelectedStartTime(startTime);
      setValue("horaInicio", startTime);
      // Optionally pre-fill end time (e.g., startTime + 30 mins)
      const startTimeDate = parse(startTime, "HH:mm", new Date());
      const endTimeDate = addMinutes(startTimeDate, SLOT_DURATION_MINUTES);
      const endTimeStr = format(endTimeDate, "HH:mm");
      
      // Ensure pre-filled end time is valid
      const endLimit = new Date();
      endLimit.setHours(WORKING_HOURS.end, 0, 0, 0);
      if (!isAfter(endTimeDate, endLimit)) {
          setValue("horaFin", endTimeStr);
      }
    } else {
        setPreSelectedStartTime(undefined);
    }
    setShowBookingForm(true);
  };

  const reservasDelDia = useMemo(() => {
    if (!selectedDate) return [];
    return getReservasPorFecha(format(selectedDate, 'yyyy-MM-dd'));
  }, [selectedDate, getReservasPorFecha, reservas]);

  const availableStartTimes = useMemo(() => {
    if (!selectedDate) return [];
    const fechaStr = format(selectedDate, 'yyyy-MM-dd');
    return allPossibleSlots.filter(slot => {
      const slotEnd = format(addMinutes(parse(slot, 'HH:mm', new Date()), SLOT_DURATION_MINUTES), 'HH:mm');
      // A slot is available if it itself isn't booked for its minimum duration
      return !isSlotOverlapping(fechaStr, slot, slotEnd);
    });
  }, [selectedDate, isSlotOverlapping]);

  const availableEndTimes = useMemo(() => {
    if (!selectedDate || !selectedHoraInicio) return [];
    const fechaStr = format(selectedDate, 'yyyy-MM-dd');
    const startTimeDate = parse(selectedHoraInicio, 'HH:mm', new Date());
    
    const possibleEndSlots = allPossibleSlots.map(s => parse(s, 'HH:mm', new Date()))
      .filter(slotDate => isAfter(slotDate, startTimeDate)); // Must be after start time

    // An end time is valid if the entire duration [selectedHoraInicio, potentialEndTime] is free
    return possibleEndSlots.filter(potentialEndTimeDate => {
      const potentialEndTimeStr = format(potentialEndTimeDate, "HH:mm");
      return !isSlotOverlapping(fechaStr, selectedHoraInicio, potentialEndTimeStr);
    }).map(date => format(date, 'HH:mm'));

  }, [selectedDate, selectedHoraInicio, isSlotOverlapping]);
  
  const handleDeleteClick = (id: string) => {
    setReservaToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (reservaToDeleteId && userRole) {
      deleteReserva(reservaToDeleteId, userRole as Role);
    }
    setIsDeleteDialogOpen(false);
    setReservaToDeleteId(null);
  };


  const calendarModifiers = useMemo(() => {
    const bookedDays: Record<string, boolean> = {};
    reservas.forEach(reserva => {
      const day = format(parseISO(reserva.fecha + 'T00:00:00'), 'yyyy-MM-dd'); // Ensure consistent date formatting
      bookedDays[day] = true;
    });
    return {
      booked: (date: Date) => bookedDays[format(date, 'yyyy-MM-dd')] || false,
    };
  }, [reservas]);


  if (isLoading) {
    return <p>Cargando datos de la sala de reuniones...</p>;
  }

  const renderTimeSlots = () => {
    if (!selectedDate) return <p className="text-muted-foreground">Seleccione un día para ver los horarios.</p>;

    const dailyBookings = getReservasPorFecha(format(selectedDate, 'yyyy-MM-dd'));

    return (
      <ScrollArea className="h-[400px] pr-3">
        <div className="space-y-2">
          {allPossibleSlots.map(slotStartTime => {
            const slotEndTime = format(addMinutes(parse(slotStartTime, 'HH:mm', new Date()), SLOT_DURATION_MINUTES), 'HH:mm');
            const bookingInSlot = dailyBookings.find(b => 
              isBefore(parse(b.horaInicio, 'HH:mm', new Date()), parse(slotEndTime, 'HH:mm', new Date())) &&
              isAfter(parse(b.horaFin, 'HH:mm', new Date()), parse(slotStartTime, 'HH:mm', new Date()))
            );

            if (bookingInSlot) {
              return (
                <Card key={slotStartTime} className="bg-muted/50 p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm">{slotStartTime} - {bookingInSlot.horaFin}</p> {/* Show actual end time of booking */}
                      <p className="text-xs text-primary">{bookingInSlot.tema}</p>
                      <p className="text-xs text-muted-foreground">Reservado por: {bookingInSlot.responsable}</p>
                    </div>
                    {userRole === bookingInSlot.createdBy && ( // Only creator can delete
                       <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(bookingInSlot.id)} title="Eliminar Reserva">
                         <Trash2 className="h-4 w-4 text-destructive" />
                       </Button>
                    )}
                  </div>
                </Card>
              );
            } else {
              // Check if this specific 30-min slot is available to start a new booking
              const isCurrentlyBookable = !isSlotOverlapping(format(selectedDate, 'yyyy-MM-dd'), slotStartTime, slotEndTime);
              if (isCurrentlyBookable) {
                return (
                  <Button key={slotStartTime} variant="outline" className="w-full justify-start p-3 h-auto" onClick={() => handleBookSlotClick(slotStartTime)}>
                    <p className="font-semibold text-sm">{slotStartTime} - {slotEndTime}</p>
                    <p className="ml-auto text-green-600 text-xs">Disponible</p>
                  </Button>
                );
              }
              // If not bookable (e.g., part of a larger booking that started earlier, or cannot fit min duration), show as part of an occupied block or nothing
              // This logic can be improved to merge consecutive free slots
              return null; 
            }
          }).filter(Boolean)} {/* Filter out nulls from non-bookable slots */}
        </div>
      </ScrollArea>
    );
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline text-primary">Sala de Reuniones</CardTitle>
              <CardDescription>Reserve la sala para sus reuniones. Haga clic en un día para ver la disponibilidad.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:max-w-md mx-auto border rounded-lg p-1 sm:p-2 bg-card shadow-sm">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              onDayClick={handleDayClick}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              locale={es}
              modifiers={calendarModifiers}
              classNames={{
                day_booked: "font-bold text-primary relative", // Style for days with bookings
                // Add a ::after pseudo-element for a dot if CSS allows, or use a more complex day renderer
              }}
              footer={selectedDate ? <p className="text-sm text-center pt-2">Visualizando: {format(selectedDate, 'PPP', { locale: es })}</p> : <p className="text-sm text-center pt-2">Seleccione un día.</p>}
            />
            {!showBookingForm && (
                 <Button onClick={() => handleBookSlotClick()} className="w-full mt-4">Reservar Nuevo Horario</Button>
            )}
          </div>

          <div className="flex-1 w-full">
            {selectedDate && !showBookingForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Horarios para el {format(selectedDate, 'PPP', { locale: es })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderTimeSlots()}
                </CardContent>
              </Card>
            )}
            
            {showBookingForm && selectedDate && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg text-primary">Reservar Sala para el {format(selectedDate, 'PPP', { locale: es })}</CardTitle>
                  <CardDescription>Complete los detalles de la reserva.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="responsable">Responsable</Label>
                      <Controller name="responsable" control={control} render={({ field }) => <Input id="responsable" {...field} />} />
                      {errors.responsable && <p className="text-sm text-destructive">{errors.responsable.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="tema">Tema de la Reunión</Label>
                      <Controller name="tema" control={control} render={({ field }) => <Input id="tema" {...field} />} />
                      {errors.tema && <p className="text-sm text-destructive">{errors.tema.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="horaInicio">Hora Inicio</Label>
                        <Controller
                          name="horaInicio"
                          control={control}
                          defaultValue={preSelectedStartTime || ""}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value} disabled={!!preSelectedStartTime}>
                              <SelectTrigger id="horaInicio"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                              <SelectContent>
                                {availableStartTimes.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.horaInicio && <p className="text-sm text-destructive">{errors.horaInicio.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="horaFin">Hora Fin</Label>
                        <Controller
                          name="horaFin"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedHoraInicio}>
                              <SelectTrigger id="horaFin"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                              <SelectContent>
                                {availableEndTimes.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.horaFin && <p className="text-sm text-destructive">{errors.horaFin.message}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit">Confirmar Reserva</Button>
                      <Button type="button" variant="outline" onClick={() => { setShowBookingForm(false); reset(); setPreSelectedStartTime(undefined);}}>Cancelar</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la reserva de la sala.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReservaToDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar Reserva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

