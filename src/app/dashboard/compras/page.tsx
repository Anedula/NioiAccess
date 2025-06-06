
"use client";

import ProtectedPage from '@/components/auth/ProtectedPage';
import PedidosDesdeOTTab from '@/components/compras/PedidosDesdeOTTab';
import CajaChicaTab from '@/components/compras/caja-chica/CajaChicaTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Archive } from 'lucide-react'; // Using Archive for Caja Chica

export default function ComprasPage() {
  return (
    <ProtectedPage allowedRoles={['Compras']}>
      <div className="space-y-6">
        <Card className="shadow-lg w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Área de Compras</CardTitle>
            <CardDescription>Gestión de pedidos de precios y caja chica.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pedidos-ot" className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 md:w-[500px] mb-6">
                <TabsTrigger value="pedidos-ot">
                  <ShoppingCart className="mr-2 h-4 w-4" /> Pedidos desde Oficina Técnica
                </TabsTrigger>
                <TabsTrigger value="caja-chica">
                  <Archive className="mr-2 h-4 w-4" /> Caja Chica
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pedidos-ot">
                <PedidosDesdeOTTab />
              </TabsContent>
              <TabsContent value="caja-chica">
                <CajaChicaTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ProtectedPage>
  );
}
