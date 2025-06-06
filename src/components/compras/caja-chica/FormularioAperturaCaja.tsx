
"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCajaChica } from '@/contexts/CajaChicaContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import type { Role } from '@/lib/types';

const aperturaSchema = z.object({
  fechaApertura: z.date({ required_error: "La fecha de apertura es obligatoria." }),
  montoInicial: z.coerce.number().positive("El monto inicial debe ser un número positivo."),
});

type AperturaFormValues = z.infer<typeof aperturaSchema>;

export default function FormularioAperturaCaja() {
  const { abrirCaja, cajaChicaActiva } = useCajaChica();
  const { userRole } = useAuth();

  const form = useForm<AperturaFormValues>({
    resolver: zodResolver(aperturaSchema),
    defaultValues: {
      fechaApertura: new Date(),
      montoInicial: '' as unknown as number, // Initialize with empty string
    },
  });

  const onSubmit = (data: AperturaFormValues) => {
    if (!userRole) {
      // This case should ideally be handled by ProtectedPage at a higher level
      console.error("Usuario no autenticado intentando abrir caja.");
      return;
    }
    abrirCaja(data.fechaApertura, data.montoInicial, userRole as Role);
    form.reset({ fechaApertura: new Date(), montoInicial: '' as unknown as number });
  };

  if (cajaChicaActiva) {
    return null; // Don't show form if a caja is already active
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-headline text-primary">Abrir Nueva Caja Chica</CardTitle>
        <CardDescription>Complete los datos para iniciar una nueva caja chica.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fechaApertura"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Apertura</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="montoInicial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto Inicial (ARS)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 5000"
                      {...field}
                      value={field.value === undefined || field.value === null ? '' : field.value} // Ensure defined value
                      onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} // Handle empty string for coercion
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Abriendo..." : "Abrir Caja Chica"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
