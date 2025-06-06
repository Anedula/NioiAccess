"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES, validatePassword } from '@/lib/auth';
import type { Role } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, LogInIcon } from 'lucide-react';

const loginSchema = z.object({
  role: z.custom<Role>((val) => ROLES.includes(val as Role), {
    message: "Debe seleccionar un rol válido.",
  }),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: '',
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setIsLoading(true);
    if (validatePassword(data.role, data.password)) {
      login(data.role);
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${data.role}.`,
      });
    } else {
      toast({
        title: "Error de inicio de sesión",
        description: "Rol o contraseña incorrectos.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center text-center">
           <Image 
            src="https://placehold.co/100x100.png" 
            alt="Grupo Nioi Logo" 
            width={80} 
            height={80}
            className="mb-4 rounded-full"
            data-ai-hint="company logo"
          />
          <CardTitle className="text-2xl font-headline text-primary">Iniciar Sesión</CardTitle>
          <CardDescription>Seleccione su rol e ingrese su contraseña.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Seleccione un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => <Input id="password" type="password" {...field} placeholder="********" />}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Ingresando...' : <><LogInIcon className="mr-2 h-4 w-4" /> Ingresar</>}
            </Button>
            <Link href="/" passHref className="w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
