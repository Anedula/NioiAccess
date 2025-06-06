
"use client";

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Assuming Textarea is suitable for description
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/contexts/AuthContext';
import { useObras } from '@/contexts/ObrasContext';
import { usePedidosPrecios } from '@/contexts/PedidosPreciosContext';
import type { PedidoPrecioItem, PedidoPrecioUnidad, PedidoPrecioTipo, Role, Obra } from '@/lib/types';
import { PEDIDO_PRECIO_UNIDADES, PEDIDO_PRECIO_TIPOS } from '@/lib/types';

const pedidoPrecioSchemaBase = z.object({
  descripcion: z.string().min(3, "La descripción es obligatoria."),
  unidad: z.custom<PedidoPrecioUnidad>((val) => PEDIDO_PRECIO_UNIDADES.includes(val as PedidoPrecioUnidad), "Unidad no válida."),
  unidadPersonalizada: z.string().optional(),
  cantidad: z.coerce.number().positive("La cantidad debe ser positiva."),
  obraDestinoId: z.string().min(1, "Debe seleccionar una obra de destino."),
  tipo: z.custom<PedidoPrecioTipo>((val) => PEDIDO_PRECIO_TIPOS.includes(val as PedidoPrecioTipo), "Tipo no válido."),
});

const pedidoPrecioSchemaCompras = z.object({
  precioUnitarioARS: z.coerce.number().nonnegative("El precio ARS no puede ser negativo.").optional(),
  precioUnitarioUSD: z.coerce.number().nonnegative("El precio USD no puede ser negativo.").optional(),
  presupuestoPdf: z.any().optional(), // File upload
});

const combinedSchema = pedidoPrecioSchemaBase.merge(pedidoPrecioSchemaCompras).superRefine((data, ctx) => {
  if (data.unidad === 'otro' && (!data.unidadPersonalizada || data.unidadPersonalizada.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Debe especificar la unidad personalizada.",
      path: ["unidadPersonalizada"],
    });
  }
  // If one price is entered, the other should ideally also be, or a PDF budget. This is complex logic for schema.
  // For now, Compras can save with partial data. Status indicator handles overall completeness.
});

type PedidoPrecioFormValues = z.infer<typeof combinedSchema>;

interface PedidoPrecioDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  itemToEdit?: PedidoPrecioItem | null;
}

export default function PedidoPrecioDialog({ isOpen, onOpenChange, itemToEdit }: PedidoPrecioDialogProps) {
  const { userRole } = useAuth();
  const { obras } = useObras();
  const { addPedidoPrecioItem, updatePedidoPrecioItemOT, updatePedidoPrecioItemCompras } = usePedidosPrecios();
  
  const form = useForm<PedidoPrecioFormValues>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      descripcion: '',
      unidad: PEDIDO_PRECIO_UNIDADES[0],
      unidadPersonalizada: '',
      cantidad: 1,
      obraDestinoId: '',
      tipo: PEDIDO_PRECIO_TIPOS[0],
      precioUnitarioARS: undefined,
      precioUnitarioUSD: undefined,
      presupuestoPdf: undefined,
    },
  });

  const { watch, setValue } = form;
  const selectedUnidad = watch("unidad");

  useEffect(() => {
    if (itemToEdit) {
      form.reset({
        ...itemToEdit,
        cantidad: itemToEdit.cantidad ?? 1,
        precioUnitarioARS: itemToEdit.precioUnitarioARS ?? undefined,
        precioUnitarioUSD: itemToEdit.precioUnitarioUSD ?? undefined,
        presupuestoPdf: undefined, // File input should reset
      });
    } else {
      form.reset({ // Default for new item
        descripcion: '',
        unidad: PEDIDO_PRECIO_UNIDADES[0],
        unidadPersonalizada: '',
        cantidad: 1,
        obraDestinoId: '',
        tipo: PEDIDO_PRECIO_TIPOS[0],
        precioUnitarioARS: undefined,
        precioUnitarioUSD: undefined,
        presupuestoPdf: undefined,
      });
    }
  }, [itemToEdit, isOpen, form]); // Re-run on isOpen to reset form when dialog reopens

  const onSubmit = (data: PedidoPrecioFormValues) => {
    if (!userRole) return;

    const otData = {
        descripcion: data.descripcion,
        unidad: data.unidad,
        unidadPersonalizada: data.unidad === 'otro' ? data.unidadPersonalizada : undefined,
        cantidad: data.cantidad,
        obraDestinoId: data.obraDestinoId,
        tipo: data.tipo,
    };

    const comprasData = {
        precioUnitarioARS: data.precioUnitarioARS,
        precioUnitarioUSD: data.precioUnitarioUSD,
        presupuestoPdf: data.presupuestoPdf?.[0]?.name || (itemToEdit && userRole === 'Compras' ? itemToEdit.presupuestoPdf : undefined),
    };

    if (itemToEdit) { // Editing existing item
      if (userRole === 'Oficina Técnica') {
        updatePedidoPrecioItemOT(itemToEdit.id, otData);
      } else if (userRole === 'Compras') {
        // Compras might update OT fields if allowed, or just their own.
        // Current spec: Compras only updates prices/PDF.
        // If OT fields were also updatable by Compras, it would be:
        // updatePedidoPrecioItemOT(itemToEdit.id, otData); // If Compras could also edit OT parts
        updatePedidoPrecioItemCompras(itemToEdit.id, comprasData, userRole as Role);
      }
    } else { // Adding new item (only Oficina Técnica)
      if (userRole === 'Oficina Técnica') {
        addPedidoPrecioItem(otData, userRole as Role);
      }
    }
    onOpenChange(false); // Close dialog
  };

  const isOTField = (fieldName: keyof PedidoPrecioFormValues) => 
    ['descripcion', 'unidad', 'unidadPersonalizada', 'cantidad', 'obraDestinoId', 'tipo'].includes(fieldName);
  
  const isComprasField = (fieldName: keyof PedidoPrecioFormValues) =>
    ['precioUnitarioARS', 'precioUnitarioUSD', 'presupuestoPdf'].includes(fieldName);

  const readOnlyForRole = (fieldName: keyof PedidoPrecioFormValues) => {
    if (!itemToEdit) return false; // New item, OT can edit their fields
    if (userRole === 'Oficina Técnica' && isComprasField(fieldName)) return true;
    if (userRole === 'Compras' && isOTField(fieldName)) return true;
    return false;
  };
  
  const hiddenForRole = (fieldName: keyof PedidoPrecioFormValues) => {
      if (userRole === 'Oficina Técnica' && isComprasField(fieldName)) return true;
      return false;
  }


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary">{itemToEdit ? 'Editar Solicitud de Precio' : 'Nueva Solicitud de Precio'}</DialogTitle>
          <DialogDescription>
            {itemToEdit 
              ? (userRole === 'Compras' ? 'Actualice los precios y/o presupuesto.' : 'Modifique los detalles de la solicitud.')
              : 'Complete los detalles para la nueva solicitud.'
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            {/* Oficina Técnica Fields */}
            <FormField control={form.control} name="descripcion" render={({ field }) => ( <FormItem className={hiddenForRole('descripcion') ? 'hidden' : ''}> <FormLabel>Descripción del Ítem</FormLabel> <FormControl><Textarea {...field} readOnly={readOnlyForRole('descripcion')} /></FormControl> <FormMessage /> </FormItem> )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="unidad" render={({ field }) => ( <FormItem className={hiddenForRole('unidad') ? 'hidden' : ''}> <FormLabel>Unidad</FormLabel> <Select onValueChange={field.onChange} value={field.value} disabled={readOnlyForRole('unidad')}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar unidad" /></SelectTrigger></FormControl><SelectContent>{PEDIDO_PRECIO_UNIDADES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select> <FormMessage /> </FormItem> )} />
              {selectedUnidad === 'otro' && (
                <FormField control={form.control} name="unidadPersonalizada" render={({ field }) => ( <FormItem className={hiddenForRole('unidadPersonalizada') ? 'hidden' : ''}> <FormLabel>Unidad Personalizada</FormLabel> <FormControl><Input {...field} readOnly={readOnlyForRole('unidadPersonalizada')} /></FormControl> <FormMessage /> </FormItem> )} />
              )}
            </div>
            <FormField control={form.control} name="cantidad" render={({ field }) => ( <FormItem className={hiddenForRole('cantidad') ? 'hidden' : ''}> <FormLabel>Cantidad</FormLabel> <FormControl><Input type="number" {...field} readOnly={readOnlyForRole('cantidad')} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="obraDestinoId" render={({ field }) => ( <FormItem className={hiddenForRole('obraDestinoId') ? 'hidden' : ''}> <FormLabel>Obra de Destino</FormLabel> <Select onValueChange={field.onChange} value={field.value} disabled={readOnlyForRole('obraDestinoId')}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar obra" /></SelectTrigger></FormControl><SelectContent>{obras.map((obra: Obra) => (<SelectItem key={obra.id} value={obra.id}>{obra.nombre_obra}</SelectItem>))}</SelectContent></Select> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="tipo" render={({ field }) => ( <FormItem className={hiddenForRole('tipo') ? 'hidden' : ''}> <FormLabel>Tipo</FormLabel> <Select onValueChange={field.onChange} value={field.value} disabled={readOnlyForRole('tipo')}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger></FormControl><SelectContent>{PEDIDO_PRECIO_TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select> <FormMessage /> </FormItem> )} />

            {/* Compras Fields - Visible to Compras, or if itemToEdit and Compras is editing */}
            {!hiddenForRole('precioUnitarioARS') && (
                <>
                    <div className="border-t my-6 pt-4">
                        <h3 className="text-lg font-medium text-primary mb-2">Información de Compras</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="precioUnitarioARS" render={({ field }) => ( <FormItem> <FormLabel>Precio Unitario (ARS)</FormLabel> <FormControl><Input type="number" step="0.01" {...field} readOnly={readOnlyForRole('precioUnitarioARS')} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="precioUnitarioUSD" render={({ field }) => ( <FormItem> <FormLabel>Precio Unitario (USD)</FormLabel> <FormControl><Input type="number" step="0.01" {...field} readOnly={readOnlyForRole('precioUnitarioUSD')} /></FormControl> <FormMessage /> </FormItem> )} />
                    </div>
                    <FormField control={form.control} name="presupuestoPdf" render={({ field: { onChange, value, ...rest }}) => ( <FormItem> <FormLabel>Presupuesto PDF {itemToEdit?.presupuestoPdf && userRole === 'Compras' && `(Actual: ${itemToEdit.presupuestoPdf})`}</FormLabel> <FormControl><Input type="file" accept=".pdf" onChange={(e) => onChange(e.target.files)} {...rest} disabled={readOnlyForRole('presupuestoPdf')} /></FormControl> <FormDescription>Cargar presupuesto en PDF. Si no selecciona uno nuevo, se mantendrá el actual (si existe).</FormDescription> <FormMessage /> </FormItem> )} />
                </>
            )}
            
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Guardando..." : (itemToEdit ? "Actualizar Solicitud" : "Añadir Solicitud")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

