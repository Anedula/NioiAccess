"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Building } from 'lucide-react';

export default function DashboardPage() {
  const { userRole } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="w-full shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <Building className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-headline text-primary">
                Grupo Nioi - Bienvenido
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Rol Actual: <span className="font-semibold text-accent">{userRole}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground mb-6">
            Este es el panel principal del sistema de gestión interna de Grupo Nioi.
            Utilice el menú de navegación lateral para acceder a las diferentes secciones.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard title="Listado de Obras" description="Consulte y gestione las obras." />
            <InfoCard title="Próximas Funcionalidades" description="Recursos Humanos, Caliza y Eventos estarán disponibles pronto." />
          </div>
           <div className="mt-8 p-6 border rounded-lg bg-secondary/30">
            <h3 className="text-xl font-semibold text-primary mb-2">Novedades</h3>
            <p className="text-foreground">
              Actualmente, la sección de "Listado de Obras" está completamente funcional. 
              Puede ver el listado existente y, si su rol es "Oficina Técnica", puede cargar nuevas obras.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
