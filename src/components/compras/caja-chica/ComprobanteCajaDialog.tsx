
"use client";

import type { CajaChica } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ComprobanteCajaDialogProps {
  caja: CajaChica | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ComprobanteCajaDialog: React.FC<ComprobanteCajaDialogProps> = ({ caja, isOpen, onOpenChange }) => {
  if (!caja) return null;

  const handlePrint = () => {
    // Timeout to allow dialog content to render before print
    setTimeout(() => {
        const printableArea = document.getElementById(`comprobante-caja-${caja.id}`);
        if (printableArea) {
            const contentToPrint = printableArea.innerHTML;
            const printWindow = window.open('', '_blank', 'height=600,width=800');
            if(printWindow) {
                printWindow.document.write('<html><head><title>Comprobante Caja Chica</title>');
                // Include tailwind/custom styles if needed, linking to globals.css is complex here
                // For simplicity, inline critical styles or use very basic styling.
                printWindow.document.write(`
                    <style>
                        body { font-family: sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .header { margin-bottom: 20px; text-align: center; }
                        .summary-item { display: flex; justify-content: space-between; padding: 5px 0; }
                        .summary-item strong { margin-left: auto; }
                        .no-print { display: none !important; }
                        h1, h2, h3 { margin-top:0; margin-bottom: 0.5rem; }
                    </style>
                `);
                printWindow.document.write('</head><body>');
                printWindow.document.write(contentToPrint);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            }
        }
    }, 250);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">Comprobante de Caja Chica</DialogTitle>
          <DialogDescription>ID Caja: {caja.id.substring(caja.id.length - 6)}</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[65vh] pr-2">
          <div id={`comprobante-caja-${caja.id}`} className="printable-area space-y-4 text-sm">
            <div className="header">
                <h2 className="text-xl font-semibold">Detalle de Caja Chica</h2>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 p-3 border rounded-md">
              <div><strong>Fecha Apertura:</strong> {format(parseISO(caja.fechaApertura), "dd/MM/yyyy", { locale: es })}</div>
              <div><strong>Abierta por:</strong> {caja.createdBy || 'N/A'}</div>
              <div><strong>Fecha Cierre:</strong> {caja.fechaCierre ? format(parseISO(caja.fechaCierre), "dd/MM/yyyy", { locale: es }) : 'N/A'}</div>
              <div><strong>Cerrada por:</strong> {caja.closedBy || 'N/A'}</div>
            </div>

            <h3 className="text-md font-semibold text-primary mt-3">Egresos Registrados</h3>
            {caja.egresos.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Detalle</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {caja.egresos.map(egreso => (
                    <TableRow key={egreso.id}>
                      <TableCell>{format(parseISO(egreso.fecha), "dd/MM/yy", { locale: es })}</TableCell>
                      <TableCell>{egreso.tipoGasto}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{egreso.detalleGasto || '-'}</TableCell>
                      <TableCell className="text-right">${egreso.monto.toLocaleString('es-AR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No se registraron egresos para esta caja.</p>
            )}
            
            <div className="mt-4 p-4 border rounded-md bg-secondary/20 space-y-1">
                <div className="summary-item"><span>Monto Inicial:</span> <strong>${caja.montoInicial.toLocaleString('es-AR')}</strong></div>
                <div className="summary-item text-destructive"><span>Total Egresos:</span> <strong>-${(caja.totalEgresos ?? 0).toLocaleString('es-AR')}</strong></div>
                <hr className="my-1"/>
                <div className="summary-item font-bold text-lg"><span>Saldo Final:</span> <strong className={(caja.saldoFinal ?? 0) >= 0 ? 'text-green-600' : 'text-destructive'}>${(caja.saldoFinal ?? 0).toLocaleString('es-AR')}</strong></div>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-4">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Imprimir Comprobante
          </Button>
          <DialogClose asChild>
            <Button variant="default">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComprobanteCajaDialog;
