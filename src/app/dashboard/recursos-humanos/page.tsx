
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersRound, CalendarClock } from 'lucide-react';
import NominaTab from '@/components/recursos-humanos/nomina/NominaTab';
import AsistenciaTab from '@/components/recursos-humanos/asistencia/AsistenciaTab'; // Se creará después

export default function RecursosHumanosPage() {
  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <UsersRound className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl font-headline text-primary">Recursos Humanos</CardTitle>
            <CardDescription>Gestión del personal, nóminas y asistencia de Grupo Nioi.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="nomina" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="nomina">
              <UsersRound className="mr-2 h-4 w-4" /> Nómina del Personal
            </TabsTrigger>
            <TabsTrigger value="asistencia">
              <CalendarClock className="mr-2 h-4 w-4" /> Calendario de Asistencia
            </TabsTrigger>
          </TabsList>
          <TabsContent value="nomina" className="mt-4">
            <NominaTab />
          </TabsContent>
          <TabsContent value="asistencia" className="mt-4">
            <AsistenciaTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
