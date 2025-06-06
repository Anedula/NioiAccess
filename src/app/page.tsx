import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center text-center">
          <Image 
            src="https://placehold.co/150x150.png" 
            alt="Grupo Nioi Logo" 
            width={120} 
            height={120}
            className="mb-6 rounded-full"
            data-ai-hint="engineer helmet"
          />
          <CardTitle className="text-3xl font-headline text-primary">
            Bienvenido a Grupo Nioi
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Sistema de Gestión Interna
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Link href="/login" passHref className="w-full">
            <Button size="lg" className="w-full text-base py-6">
              <LogIn className="mr-2 h-5 w-5" />
              Iniciar sesión
            </Button>
          </Link>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Grupo Nioi. Todos los derechos reservados.</p>
        </CardFooter>
      </Card>
    </div>
  );
}

// Re-import needed ShadCN components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";