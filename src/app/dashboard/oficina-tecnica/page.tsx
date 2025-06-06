
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react'; 
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OficinaTecnicaPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="w-full shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <Building2 className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-headline text-primary">
                Oficina Técnica
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Gestión de obras y documentación técnica.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground mb-6">
            Bienvenido a la sección de Oficina Técnica. Desde aquí puede acceder a las herramientas y listados relacionados con la gestión técnica de proyectos.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCardOT title="Listado de Obras" description="Consulte, cargue y gestione las obras." href="/dashboard/oficina-tecnica/obras" />
            {/* Add more InfoCards here if other subsections are added later */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCardOT({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        <Link href={href} passHref>
          <Button>Acceder a {title}</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
