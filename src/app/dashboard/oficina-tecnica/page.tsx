
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, ListChecks, ShoppingCart } from 'lucide-react';
import ListadoObrasTab from '@/components/oficina-tecnica/ListadoObrasTab';
import PedidosPreciosTab from '@/components/oficina-tecnica/pedidos-precios/PedidosPreciosTab';

export default function OficinaTecnicaPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline text-primary">Oficina Técnica</CardTitle>
              <CardDescription>Gestión de obras, documentación técnica y pedidos de precios.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="listado-obras" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 md:w-[500px] mb-6">
              <TabsTrigger value="listado-obras">
                <ListChecks className="mr-2 h-4 w-4" /> Listado de Obras
              </TabsTrigger>
              <TabsTrigger value="pedidos-precios">
                <ShoppingCart className="mr-2 h-4 w-4" /> Pedido de Precios a Compras
              </TabsTrigger>
            </TabsList>
            <TabsContent value="listado-obras">
              <ListadoObrasTab />
            </TabsContent>
            <TabsContent value="pedidos-precios">
              <PedidosPreciosTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
