
"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { usePersonal } from '@/contexts/PersonalContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Personal, Role, UbicacionPersonal, TipoContratacion, EstadoCivil, EstadoPersonal } from '@/lib/types';
import { ROLES } from '@/lib/auth';
import { TIPOS_CONTRATACION, ESTADOS_CIVILES, ESTADOS_PERSONAL } from '@/lib/types';
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const personalSchema = z.object({
  nombreCompleto: z.string().min(3, "El nombre completo es obligatorio."),
  dni: z.string().regex(/^\d{7,8}$/, "DNI inválido. Debe tener 7 u 8 dígitos."),
  fechaNacimiento: z.date({ required_error: "La fecha de nacimiento es obligatoria." }),
  ubicacionLaboral: z.custom<UbicacionPersonal>((val) => ["Obra", "Oficina"].includes(val as UbicacionPersonal), "Ubicación laboral no válida"),
  obraAsignada: z.string().optional(),
  areaOficina: z.custom<Role>((val) => ROLES.includes(val as Role)).optional(),
  tipoContratacion: z.custom<TipoContratacion>((val) => TIPOS_CONTRATACION.includes(val as TipoContratacion), "Tipo de contratación no válido."),
  estadoCivil: z.custom<EstadoCivil>((val) => ESTADOS_CIVILES.includes(val as EstadoCivil), "Estado civil no válido."),
  tieneHijos: z.boolean().default(false),
  obraSocial: z.string().min(1, "La obra social es obligatoria."),
  datosMedicosAdicionales: z.string().optional(),
  archivoExamenPreocupacional: z.any().optional(), 
  estadoPersonal: z.custom<EstadoPersonal>((val) => ESTADOS_PERSONAL.includes(val as EstadoPersonal), "Estado del personal no válido."),
  fechaBaja: z.date().optional(),
}).superRefine((data, ctx) => {
  if (data.ubicacionLaboral === "Obra" && !data.obraAsignada) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe indicar la obra asignada.", path: ["obraAsignada"] });
  }
  if (data.ubicacionLaboral === "Oficina" && !data.areaOficina) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe indicar el área de oficina.", path: ["areaOficina"] });
  }
  if (data.estadoPersonal === "Baja" && !data.fechaBaja) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe indicar la fecha de baja.", path: ["fechaBaja"] });
  }
});

export type PersonalFormValues = z.infer<typeof personalSchema>;

interface NuevoPersonalFormProps {
  personalToEdit?: Personal;
}

export default function NuevoPersonalForm({ personalToEdit }: NuevoPersonalFormProps) {
  const { addPersonal, updatePersonal } = usePersonal();
  const { userRole } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<PersonalFormValues>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      nombreCompleto: '',
      dni: '',
      ubicacionLaboral: undefined, 
      obraAsignada: '',
      areaOficina: undefined,
      tipoContratacion: TIPOS_CONTRATACION[0], // Default to first option
      estadoCivil: ESTADOS_CIVILES[0], // Default to first option
      tieneHijos: false,
      obraSocial: '',
      datosMedicosAdicionales: '',
      estadoPersonal: ESTADOS_PERSONAL[0], // Default to "Alta"
      fechaBaja: undefined,
    },
  });

  useEffect(() => {
    if (personalToEdit) {
      form.reset({
        ...personalToEdit,
        fechaNacimiento: personalToEdit.fechaNacimiento ? parseISO(personalToEdit.fechaNacimiento) : undefined,
        fechaBaja: personalToEdit.fechaBaja ? parseISO(personalToEdit.fechaBaja) : undefined,
        archivoExamenPreocupacional: undefined, 
      });
    }
  }, [personalToEdit, form]);

  const { watch } = form;
  const ubicacionSeleccionada = watch("ubicacionLaboral");
  const estadoPersonalSeleccionado = watch("estadoPersonal");

  const onSubmit = (data: PersonalFormValues) => {
    if (!userRole) {
        toast({ title: "Error", description: "Usuario no autenticado.", variant: "destructive" });
        return;
    }
    
    const personalPayload: Omit<Personal, 'id' | 'createdAt' | 'createdBy'> = {
      ...data,
      fechaNacimiento: data.fechaNacimiento.toISOString(),
      fechaBaja: data.estadoPersonal === "Baja" && data.fechaBaja ? data.fechaBaja.toISOString() : undefined,
      archivoExamenPreocupacional: data.archivoExamenPreocupacional?.[0]?.name || (personalToEdit ? personalToEdit.archivoExamenPreocupacional : undefined),
    };

    if (personalToEdit) {
      updatePersonal(personalToEdit.id, personalPayload);
      toast({ title: "Registro Actualizado", description: `Los datos de ${data.nombreCompleto} han sido actualizados.`});
    } else {
      addPersonal(personalPayload, userRole);
      toast({ title: "Personal Cargado", description: `${data.nombreCompleto} ha sido agregado a la nómina.`});
    }
    router.push('/dashboard/recursos-humanos');
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">
          {personalToEdit ? "Editar Personal" : "Cargar Nuevo Personal"}
        </CardTitle>
        <CardDescription>
          {personalToEdit ? "Modifique los datos del empleado." : "Complete los campos para agregar un nuevo empleado a la nómina."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div>
              <h3 className="text-lg font-medium text-primary mb-4">Datos Personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="nombreCompleto" render={({ field }) => ( <FormItem> <FormLabel>Nombre Completo</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="dni" render={({ field }) => ( <FormItem> <FormLabel>DNI</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="fechaNacimiento" render={({ field }) => (<FormItem className="flex flex-col"> <FormLabel>Fecha de Nacimiento</FormLabel> <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? (format(field.value, "PPP", { locale: es })) : (<span>Seleccionar fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear() - 18} disabled={(date) => date > new Date(new Date().setFullYear(new Date().getFullYear() - 18)) || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="estadoCivil" render={({ field }) => ( <FormItem> <FormLabel>Estado Civil</FormLabel> <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar estado civil" /></SelectTrigger></FormControl><SelectContent>{ESTADOS_CIVILES.map(ec => <SelectItem key={ec} value={ec}>{ec}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="tieneHijos" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 h-14 mt-auto"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">¿Tiene Hijos?</FormLabel> </FormItem> )} />
                <FormField control={form.control} name="obraSocial" render={({ field }) => ( <FormItem> <FormLabel>Obra Social</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-primary mb-4 mt-6">Datos Laborales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="ubicacionLaboral" render={({ field }) => ( <FormItem> <FormLabel>Ubicación Laboral</FormLabel> <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar ubicación" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Obra">Obra</SelectItem><SelectItem value="Oficina">Oficina</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                {ubicacionSeleccionada === "Obra" && <FormField control={form.control} name="obraAsignada" render={({ field }) => ( <FormItem> <FormLabel>Obra Asignada</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />}
                {ubicacionSeleccionada === "Oficina" && <FormField control={form.control} name="areaOficina" render={({ field }) => ( <FormItem> <FormLabel>Área de Oficina</FormLabel> <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar área" /></SelectTrigger></FormControl><SelectContent>{ROLES.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />}
                <FormField control={form.control} name="tipoContratacion" render={({ field }) => ( <FormItem> <FormLabel>Tipo de Contratación</FormLabel> <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger></FormControl><SelectContent>{TIPOS_CONTRATACION.map(tipo => (<SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem> )} />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-primary mb-4 mt-6">Estado del Personal</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="estadoPersonal" render={({ field }) => ( <FormItem> <FormLabel>Estado</FormLabel> <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger></FormControl><SelectContent>{ESTADOS_PERSONAL.map(ep => <SelectItem key={ep} value={ep}>{ep}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                {estadoPersonalSeleccionado === "Baja" && (
                    <FormField control={form.control} name="fechaBaja" render={({ field }) => (<FormItem className="flex flex-col"> <FormLabel>Fecha de Baja</FormLabel> <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? (format(field.value, "PPP", { locale: es })) : (<span>Seleccionar fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-primary mb-4 mt-6">Datos Adicionales y Archivos</h3>
              <FormField control={form.control} name="datosMedicosAdicionales" render={({ field }) => ( <FormItem> <FormLabel>Datos Médicos Adicionales</FormLabel> <FormControl><Textarea rows={3} {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <div className="mt-6">
                <FormField control={form.control} name="archivoExamenPreocupacional" render={({ field: { onChange, value, ...rest } }) => ( <FormItem> <FormLabel>Examen Preocupacional (PDF) {personalToEdit?.archivoExamenPreocupacional && `(Actual: ${personalToEdit.archivoExamenPreocupacional})`}</FormLabel> <FormControl><Input type="file" accept=".pdf" onChange={(e) => onChange(e.target.files)} {...rest} /></FormControl> <FormDescription>Cargar examen en PDF. Si no selecciona uno nuevo, se mantendrá el actual (si existe).</FormDescription><FormMessage /> </FormItem> )} />
              </div>
            </div>

            <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (personalToEdit ? "Actualizando..." : "Guardando...") : (personalToEdit ? "Actualizar Personal" : "Guardar Personal")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
