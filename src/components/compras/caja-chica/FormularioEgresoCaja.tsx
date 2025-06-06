
"use client";
// This component is primarily used within EgresoDialog.tsx

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { TIPOS_GASTO_CAJA_CHICA, type TipoGastoCajaChica, type EgresoCajaChica } from '@/lib/types';

export const egresoSchema = z.object({
  fecha: z.date({ required_error: "La fecha del egreso es obligatoria." }),
  tipoGasto: z.custom<TipoGastoCajaChica>((val) => TIPOS_GASTO_CAJA_CHICA.includes(val as TipoGastoCajaChica), "Tipo de gasto no válido."),
  detalleGasto: z.string().optional(),
  monto: z.coerce.number().positive("El monto del egreso debe ser positivo."),
});

export type EgresoFormValues = z.infer<typeof egresoSchema>;

interface FormularioEgresoCajaProps {
  onSubmitEgreso: (data: EgresoFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  defaultValues?: Partial<EgresoFormValues>; // For editing
}

export default function FormularioEgresoCaja({ onSubmitEgreso, onCancel, isSubmitting, defaultValues }: FormularioEgresoCajaProps) {
  const form = useForm<EgresoFormValues>({
    resolver: zodResolver(egresoSchema),
    defaultValues: defaultValues || {
      fecha: new Date(),
      tipoGasto: TIPOS_GASTO_CAJA_CHICA[0],
      detalleGasto: '',
      monto: undefined,
    },
  });
  
  React.useEffect(() => {
    if (defaultValues) {
        form.reset({
            ...defaultValues,
            fecha: defaultValues.fecha ? (typeof defaultValues.fecha === 'string' ? new Date(defaultValues.fecha) : defaultValues.fecha) : new Date(),
        });
    } else {
        form.reset({
            fecha: new Date(),
            tipoGasto: TIPOS_GASTO_CAJA_CHICA[0],
            detalleGasto: '',
            monto: undefined,
        });
    }
  }, [defaultValues, form.reset, form]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitEgreso)} className="space-y-4">
        <FormField
          control={form.control}
          name="fecha"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha del Egreso</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tipoGasto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Gasto</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger></FormControl>
                <SelectContent>
                  {TIPOS_GASTO_CAJA_CHICA.map(tipo => <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="detalleGasto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detalle del Gasto (Opcional)</FormLabel>
              <FormControl><Textarea placeholder="Descripción breve del gasto..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="monto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto del Egreso (ARS)</FormLabel>
              <FormControl><Input type="number" placeholder="Ej: 300" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : (defaultValues?.fecha ? "Actualizar Egreso" : "Agregar Egreso")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
