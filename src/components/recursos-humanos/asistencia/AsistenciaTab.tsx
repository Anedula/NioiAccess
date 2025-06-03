
"use client";

import React, { useState, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import type { DayModifiers } from 'react-day-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePersonal } from '@/contexts/PersonalContext';
import { useAsistencia } from '@/contexts/AsistenciaContext';
import { format, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import AttendanceEntryForm from './AttendanceEntryForm';
import type { Personal } from '@/lib/types';

export default function AsistenciaTab() {
  const { personalList, isLoading: isPersonalLoading } = usePersonal();
  const { asistencias, getAsistenciasPorFecha, isLoading: isAsistenciaLoading } = useAsistencia();

  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);

  const officeStaff = useMemo(() => {
    return personalList.filter(p => p.ubicacion === 'Oficina');
  }, [personalList]);

  const getDayAttendanceStatus = (day: Date, staffList: Personal[], dailyAsistencias: typeof asistencias): 'all_recorded' | 'not_all_recorded' | 'no_office_staff' => {
    if (staffList.length === 0) {
      return 'no_office_staff';
    }
    const dateString = format(day, 'yyyy-MM-dd');
    const asistenciasForDay = dailyAsistencias.filter(a => a.fecha === dateString);

    let recordedOfficeStaffCount = 0;
    for (const staff of staffList) {
      if (asistenciasForDay.some(a => a.personalId === staff.id)) {
        recordedOfficeStaffCount++;
      }
    }

    if (recordedOfficeStaffCount === staffList.length) {
      return 'all_recorded';
    }
    return 'not_all_recorded';
  };
  
  const दिनModifiers = useMemo(() => {
    const modifiers: Record<string, (date: Date) => boolean> = {
        allRecorded: (date) => getDayAttendanceStatus(date, officeStaff, asistencias) === 'all_recorded',
        notAllRecorded: (date) => getDayAttendanceStatus(date, officeStaff, asistencias) === 'not_all_recorded',
        noOfficeStaff: (date) => getDayAttendanceStatus(date, officeStaff, asistencias) === 'no_office_staff',
    };
    return modifiers;
  }, [officeStaff, asistencias]);


  const handleDayClick = (day: Date, modifiers: DayModifiers) => {
    if (modifiers.disabled || modifiers.noOfficeStaff) {
        setSelectedDay(undefined); // Clear selection if day is not actionable
        return;
    }
    setSelectedDay(day);
  };

  if (isPersonalLoading || isAsistenciaLoading) {
    return <p>Cargando datos de asistencia y personal...</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary">Calendario de Asistencia de Oficina</CardTitle>
          <CardDescription>Seleccione un día para registrar o ver la asistencia del personal de oficina.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:max-w-md mx-auto border rounded-lg p-1 sm:p-2 bg-card shadow-sm">
            <Calendar
              mode="single"
              selected={selectedDay}
              onDayClick={handleDayClick}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              locale={es}
              modifiers={दिनModifiers}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4 w-full",
                table: "w-full border-collapse",
                head_row: "flex justify-around w-full",
                head_cell: "w-12 font-medium text-muted-foreground text-xs sm:text-sm", // Responsive font size
                row: "flex w-full mt-2 justify-around",
                cell: "h-10 w-10 sm:h-12 sm:w-12 text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                day: cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-10 w-10 sm:h-12 sm:w-12 p-0 font-normal aria-selected:opacity-100 rounded-md transition-colors",
                  "focus-within:relative focus-within:z-20 hover:bg-accent hover:text-accent-foreground"
                ),
                day_selected: '!bg-primary !text-primary-foreground hover:!bg-primary/90 focus:!bg-primary',
                day_today: 'bg-accent text-accent-foreground font-bold border-2 border-primary',
                day_outside: 'text-muted-foreground opacity-30',
                day_disabled: 'text-muted-foreground opacity-30 cursor-not-allowed',
                day_modifier_allRecorded: '!bg-green-300 !text-green-900 dark:!bg-green-700 dark:!text-green-100 hover:!bg-green-400 dark:hover:!bg-green-600',
                day_modifier_notAllRecorded: '!bg-blue-200 !bg-opacity-70 !text-blue-800 dark:!bg-blue-800 dark:!bg-opacity-70 dark:!text-blue-200 hover:!bg-blue-300 dark:hover:!bg-blue-700',
                day_modifier_noOfficeStaff: 'opacity-50 cursor-not-allowed',
                caption_label: 'text-lg font-medium',
                nav_button: cn(buttonVariants({ variant: 'outline' }), 'h-8 w-8 bg-transparent p-0'),
              }}
              footer={
                <div className="flex justify-center space-x-2 sm:space-x-4 pt-3 text-xs border-t mt-2">
                  <div className="flex items-center space-x-1">
                    <div className="h-3 w-3 rounded-sm bg-green-300 dark:bg-green-700"></div>
                    <span>Completo</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="h-3 w-3 rounded-sm bg-blue-200 bg-opacity-70 dark:bg-blue-800 dark:bg-opacity-70"></div>
                    <span>Parcial/Vacío</span>
                  </div>
                </div>
              }
            />
          </div>
          <div className="flex-1 w-full">
            {selectedDay ? (
                officeStaff.length > 0 ? (
                    <AttendanceEntryForm selectedDate={selectedDay} officeStaff={officeStaff} />
                ) : (
                    <Card>
                        <CardHeader><CardTitle className="text-lg">Sin Personal de Oficina</CardTitle></CardHeader>
                        <CardContent><p>No hay personal de oficina registrado para cargar asistencia.</p></CardContent>
                    </Card>
                )
            ) : (
              <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <p className="text-lg">Seleccione un día del calendario</p>
                <p>para ver o registrar la asistencia.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
