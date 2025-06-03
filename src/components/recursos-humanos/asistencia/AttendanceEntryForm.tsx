
"use client";

import type { Personal, EstadoAsistencia, Role } from '@/lib/types';
import { ESTADOS_ASISTENCIA } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAsistencia } from '@/contexts/AsistenciaContext';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AttendanceEntryFormProps {
  selectedDate: Date;
  officeStaff: Personal[];
}

interface AttendanceState {
  [personalId: string]: EstadoAsistencia;
}

export default function AttendanceEntryForm({ selectedDate, officeStaff }: AttendanceEntryFormProps) {
  const { userRole } = useAuth();
  const { addOrUpdateAsistencia, getAsistenciaPorFechaYPersonal, isLoading: isAsistenciaLoading } = useAsistencia();
  const { toast } = useToast();
  
  const dateString = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);
  const formattedDisplayDate = useMemo(() => format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }), [selectedDate]);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceState>({});
  const [initialRecords, setInitialRecords] = useState<AttendanceState>({});

  const populateRecords = useCallback(() => {
    if (officeStaff.length > 0 && !isAsistenciaLoading) {
      const current: AttendanceState = {};
      const initial: AttendanceState = {};
      officeStaff.forEach(staff => {
        const existingAsistencia = getAsistenciaPorFechaYPersonal(staff.id, dateString);
        const status = existingAsistencia?.estado || ESTADOS_ASISTENCIA[0]; // Default to "Jornada completa"
        current[staff.id] = status;
        initial[staff.id] = status;
      });
      setAttendanceRecords(current);
      setInitialRecords(initial);
    }
  }, [officeStaff, isAsistenciaLoading, getAsistenciaPorFechaYPersonal, dateString]);

  useEffect(() => {
    populateRecords();
  }, [selectedDate, populateRecords]); // dateString is covered by selectedDate

  const handleAttendanceChange = (personalId: string, estado: EstadoAsistencia) => {
    setAttendanceRecords(prev => ({ ...prev, [personalId]: estado }));
  };

  const hasChanges = useMemo(() => {
    return JSON.stringify(attendanceRecords) !== JSON.stringify(initialRecords);
  }, [attendanceRecords, initialRecords]);

  const handleSaveAttendance = () => {
    if (!userRole || userRole !== 'Recursos Humanos') {
      toast({ title: "Error", description: "No tiene permisos para guardar la asistencia.", variant: "destructive" });
      return;
    }
    
    let changesMadeCount = 0;
    for (const staffId in attendanceRecords) {
      if (Object.prototype.hasOwnProperty.call(attendanceRecords, staffId)) {
        if (attendanceRecords[staffId] !== initialRecords[staffId]) {
          addOrUpdateAsistencia(staffId, dateString, attendanceRecords[staffId], userRole as Role);
          changesMadeCount++;
        }
      }
    }

    if (changesMadeCount > 0) {
      toast({ title: "Asistencia Guardada", description: `Se guardaron ${changesMadeCount} cambios de asistencia para el ${format(selectedDate, 'dd/MM/yyyy', { locale: es })}.` });
      setInitialRecords({ ...attendanceRecords }); // Update initial state to current saved state
    } else {
      toast({ title: "Información", description: "No hubo cambios para guardar.", variant: "default" });
    }
  };

  if (isAsistenciaLoading && Object.keys(attendanceRecords).length === 0) { // Show loading only if records are not yet populated
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-headline text-primary">Registro de Asistencia</CardTitle>
                <CardDescription>Cargando datos para: <span className="font-semibold">{formattedDisplayDate}</span></CardDescription>
            </CardHeader>
            <CardContent>
                <p>Cargando...</p>
            </CardContent>
        </Card>
    );
  }

  if (officeStaff.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary">Registro de Asistencia</CardTitle>
          <CardDescription>Fecha seleccionada: <span className="font-semibold">{formattedDisplayDate}</span></CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No hay personal de oficina registrado en la nómina.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-primary">Registro de Asistencia</CardTitle>
        <CardDescription>Fecha: <span className="font-semibold text-accent">{formattedDisplayDate}</span></CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] sm:h-[400px] pr-3">
          <div className="space-y-3">
            {officeStaff.map(staff => (
              <div key={staff.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-md bg-card hover:bg-secondary/30 transition-colors">
                <div className="mb-2 sm:mb-0 flex-grow">
                  <p className="font-medium text-foreground">{staff.nombreCompleto}</p>
                  <p className="text-xs text-muted-foreground">{staff.areaOficina || 'Área no especificada'}</p>
                </div>
                <Select
                  value={attendanceRecords[staff.id] || ''}
                  onValueChange={(value: EstadoAsistencia) => handleAttendanceChange(staff.id, value)}
                  disabled={userRole !== 'Recursos Humanos'}
                >
                  <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_ASISTENCIA.map(estado => (
                      <SelectItem key={estado} value={estado} className="text-xs sm:text-sm">
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      {userRole === 'Recursos Humanos' && (
        <CardFooter className="border-t pt-4">
          <Button 
            onClick={handleSaveAttendance} 
            disabled={!hasChanges || isAsistenciaLoading} 
            className="w-full sm:w-auto"
          >
            {isAsistenciaLoading ? "Guardando..." : "Guardar Cambios de Asistencia"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

