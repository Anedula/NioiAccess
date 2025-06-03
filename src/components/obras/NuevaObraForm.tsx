
"use client";

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useObras } from '@/contexts/ObrasContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Obra, EstadoObra, UnidadValidez } from '@/lib/types';
import { ESTADOS_OBRA, UNIDADES_VALIDEZ } from '@/lib/types';
import { cn } from "@/lib/utils";
import { CalendarIcon, UploadCloud } from "lucide-react";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const currentYear = new Date().getFullYear();

const obraSchema = z.object({
  nombre_obra: z.string().min(1, "El nombre de la obra es obligatorio."),
  ubicacion: z.string().min(1, "La ubicación es obligatoria."),
  comitente: z.string().min(1, "El comitente es obligatorio."),
  es_ute: z.boolean().default(false),
  empresa_ute: z.string().optional(),
  fecha_invitacion: z.date({ required_error: "La fecha de invitación es obligatoria." }),
  fecha_presentacion: z.date({ required_error: "La fecha de presentación es obligatoria." }),
  monto_oferta: z.coerce.number().positive("El monto debe ser positivo."),
  moneda: z.string().min(1, "La moneda es obligatoria."),
  precio_dolar: z.coerce.number().optional(),
  porcentaje_anticipo: z.coerce.number().min(0).max(100).optional(),
  plazo_validez: z.coerce.number().int().positive("El plazo debe ser positivo."),
  unidad_validez: z.custom<UnidadValidez>((val) => UNIDADES_VALIDEZ.includes(val as UnidadValidez), "Unidad de validez no válida."),
  formula_polinomica: z.boolean().default(false),
  duracion_obra: z.coerce.number().int().positive("La duración debe ser positiva."),
  unidad_duracion: z.string().min(1, "La unidad de duración es obligatoria (ej: meses)."),
  estado_obra: z.custom<EstadoObra>((val) => ESTADOS_OBRA.includes(val as EstadoObra), "Estado de obra no válido."),
  empresa_adjudicada: z.string().optional(),
  observaciones: z.string().optional(),
  anio_licitacion: z.coerce.number().int().min(2023, "El año debe ser 2023 o posterior.").max(currentYear + 5, `El año no puede ser mayor a ${currentYear + 5}`),
  fecha_inicio_obra: z.date().optional(),
  fecha_finalizacion_obra: z.date().optional(),
  archivo_oferta_pdf: z.any().optional(), 
  archivo_descripcion_pdf: z.any().optional(), 
  fecha_recepcion_provisoria: z.date().optional(),
  fecha_recepcion_definitiva: z.date().optional(),
}).superRefine((data, ctx) => {
  if (data.es_ute && !data.empresa_ute) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe indicar la empresa UTE.", path: ["empresa_ute"] });
  }
  if (data.estado_obra === "Adjudicada a otra Empresa" && !data.empresa_adjudicada) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe indicar la empresa adjudicada.", path: ["empresa_adjudicada"] });
  }
  if (data.estado_obra === "En Ejecución" && !data.fecha_inicio_obra) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe indicar la fecha de inicio de obra.", path: ["fecha_inicio_obra"] });
  }
  if (data.estado_obra === "Finalizada" && !data.fecha_recepcion_provisoria) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe indicar la fecha de recepción provisoria.", path: ["fecha_recepcion_provisoria"] });
  }
   if (data.estado_obra === "Finalizada" && !data.fecha_recepcion_definitiva) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe indicar la fecha de recepción definitiva.", path: ["fecha_recepcion_definitiva"] });
  }
});

type ObraFormValues = z.infer<typeof obraSchema>;

export default function NuevaObraForm() {
  const { addObra } = useObras();
  const { userRole } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ObraFormValues>({
    resolver: zodResolver(obraSchema),
    defaultValues: {
      es_ute: false,
      formula_polinomica: false,
      moneda: "ARS",
      anio_licitacion: new Date().getFullYear(),
      unidad_validez: "días",
    },
  });

  const { watch } = form;
  const esUte = watch("es_ute");
  const estadoObra = watch("estado_obra");

  const onSubmit = (data: ObraFormValues) => {
    if (!userRole) {
        toast({ title: "Error", description: "Usuario no autenticado.", variant: "destructive" });
        return;
    }
    
    const obraPayload: Omit<Obra, 'id' | 'createdAt' | 'createdBy'> = {
      ...data,
      fecha_invitacion: data.fecha_invitacion.toISOString(),
      fecha_presentacion: data.fecha_presentacion.toISOString(),
      fecha_inicio_obra: data.fecha_inicio_obra?.toISOString(),
      fecha_finalizacion_obra: data.fecha_finalizacion_obra?.toISOString(),
      archivo_oferta_pdf: data.archivo_oferta_pdf?.[0]?.name, 
      archivo_descripcion_pdf: data.archivo_descripcion_pdf?.[0]?.name, 
      fecha_recepcion_provisoria: data.fecha_recepcion_provisoria?.toISOString(),
      fecha_recepcion_definitiva: data.fecha_recepcion_definitiva?.toISOString(),
    };

    addObra(obraPayload, userRole);
    toast({ title: "Obra Cargada", description: `${data.nombre_obra} ha sido cargada exitosamente.`});
    router.push('/dashboard/obras');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Cargar Nueva Obra</CardTitle>
        <CardDescription>Complete los campos para registrar una nueva obra. Solo visible para Oficina Técnica.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div>
              <h3 className="text-lg font-medium text-primary mb-4">Datos de la Obra</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="nombre_obra" render={({ field }) => ( <FormItem> <FormLabel>Nombre de la Obra</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="ubicacion" render={({ field }) => ( <FormItem> <FormLabel>Ubicación</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="comitente" render={({ field }) => ( <FormItem> <FormLabel>Comitente</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="anio_licitacion" render={({ field }) => ( <FormItem> <FormLabel>Año de Licitación</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="duracion_obra" render={({ field }) => ( <FormItem> <FormLabel>Duración Obra</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="unidad_duracion" render={({ field }) => ( <FormItem> <FormLabel>Unidad Duración</FormLabel> <FormControl><Input {...field} placeholder="ej: meses" /></FormControl> <FormMessage /> </FormItem> )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-center">
                <FormField control={form.control} name="es_ute" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 h-14"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Es UTE?</FormLabel> </FormItem> )} />
                {esUte && <FormField control={form.control} name="empresa_ute" render={({ field }) => ( <FormItem> <FormLabel>Empresa UTE</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-primary mb-4 mt-6">Datos Económicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="monto_oferta" render={({ field }) => ( <FormItem> <FormLabel>Monto Oferta</FormLabel> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="moneda" render={({ field }) => ( <FormItem> <FormLabel>Moneda</FormLabel> <FormControl><Input {...field} placeholder="ARS, USD..." /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="precio_dolar" render={({ field }) => ( <FormItem> <FormLabel>Precio Dólar (Opcional)</FormLabel> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="porcentaje_anticipo" render={({ field }) => ( <FormItem> <FormLabel>% Anticipo (Opcional)</FormLabel> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="plazo_validez" render={({ field }) => ( <FormItem> <FormLabel>Plazo Validez Oferta</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="unidad_validez" render={({ field }) => ( <FormItem> <FormLabel>Unidad Plazo</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar unidad" /></SelectTrigger></FormControl><SelectContent>{UNIDADES_VALIDEZ.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              </div>
              <div className="mt-6">
                <FormField control={form.control} name="formula_polinomica" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 h-14 max-w-xs"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Fórmula Polinómica?</FormLabel> </FormItem> )} />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-primary mb-4 mt-6">Estado, Fechas y Observaciones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="fecha_invitacion" render={({ field }) => (<FormItem className="flex flex-col"> <FormLabel>Fecha Invitación</FormLabel> <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? (format(field.value, "PPP", { locale: es })) : (<span>Seleccionar fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="fecha_presentacion" render={({ field }) => (<FormItem className="flex flex-col"> <FormLabel>Fecha Presentación</FormLabel> <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? (format(field.value, "PPP", { locale: es })) : (<span>Seleccionar fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
              </div>
              
              <div className="mt-6">
                <FormField control={form.control} name="estado_obra" render={({ field }) => ( <FormItem> <FormLabel>Estado de la Obra</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger></FormControl><SelectContent>{ESTADOS_OBRA.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              </div>
              {estadoObra === "Adjudicada a otra Empresa" && <div className="mt-6"><FormField control={form.control} name="empresa_adjudicada" render={({ field }) => ( <FormItem> <FormLabel>Empresa Adjudicada</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} /></div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {estadoObra === "En Ejecución" && <FormField control={form.control} name="fecha_inicio_obra" render={({ field }) => (<FormItem className="flex flex-col"> <FormLabel>Fecha Inicio Obra</FormLabel> <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? (format(field.value, "PPP", { locale: es })) : (<span>Seleccionar fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />}
                <FormField control={form.control} name="fecha_finalizacion_obra" render={({ field }) => (<FormItem className="flex flex-col"> <FormLabel>Fecha Finalización Obra (Estimada/Real)</FormLabel> <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? (format(field.value, "PPP", { locale: es })) : (<span>Seleccionar fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
              </div>

              {estadoObra === "Finalizada" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <FormField control={form.control} name="fecha_recepcion_provisoria" render={({ field }) => (<FormItem className="flex flex-col"> <FormLabel>Fecha Recepción Provisoria</FormLabel> <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? (format(field.value, "PPP", { locale: es })) : (<span>Seleccionar fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="fecha_recepcion_definitiva" render={({ field }) => (<FormItem className="flex flex-col"> <FormLabel>Fecha Recepción Definitiva</FormLabel> <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? (format(field.value, "PPP", { locale: es })) : (<span>Seleccionar fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                  </div>
              )}
              
              <div className="mt-6">
                <FormField control={form.control} name="observaciones" render={({ field }) => ( <FormItem> <FormLabel>Observaciones</FormLabel> <FormControl><Textarea rows={4} {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-primary mb-4 mt-6">Archivos Adjuntos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="archivo_oferta_pdf" render={({ field: { onChange, value, ...rest } }) => ( <FormItem> <FormLabel>Archivo Oferta PDF</FormLabel> <FormControl><Input type="file" accept=".pdf" onChange={(e) => onChange(e.target.files)} {...rest} /></FormControl> <FormDescription>Cargar oferta en formato PDF.</FormDescription><FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="archivo_descripcion_pdf" render={({ field: { onChange, value, ...rest } }) => ( <FormItem> <FormLabel>Archivo Descripción PDF</FormLabel> <FormControl><Input type="file" accept=".pdf" onChange={(e) => onChange(e.target.files)} {...rest} /></FormControl> <FormDescription>Cargar descripción en formato PDF.</FormDescription><FormMessage /> </FormItem> )} />
              </div>
            </div>

            <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Guardando..." : "Guardar Obra"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
