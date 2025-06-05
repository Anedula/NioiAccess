
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain, Timer } from 'lucide-react'; // Changed Clock to Timer for semantics
import { useEffect, useState } from 'react';

interface TimeElapsed {
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
}

export default function CalizaPage() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<TimeElapsed | null>(null);

  useEffect(() => {
    // Calculate start date: 2 months and 5 days ago. This runs only on the client after mount.
    const date = new Date();
    date.setMonth(date.getMonth() - 2);
    date.setDate(date.getDate() - 5);
    setStartDate(date);
  }, []);

  useEffect(() => {
    if (!startDate) return; // Don't start timer until startDate is set

    const calculateTimeElapsed = () => {
      const now = new Date().getTime();
      const difference = now - startDate.getTime();

      // Should not be negative if startDate is in the past, but good practice to handle
      if (difference < 0) {
        setTimeElapsed({ weeks: 0, days: 0, hours: 0, minutes: 0 });
        return;
      }

      const totalSeconds = Math.floor(difference / 1000);
      const weeks = Math.floor(totalSeconds / (60 * 60 * 24 * 7));
      const days = Math.floor((totalSeconds % (60 * 60 * 24 * 7)) / (60 * 60 * 24));
      const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

      setTimeElapsed({ weeks, days, hours, minutes });
    };

    // Initial calculation
    calculateTimeElapsed();

    // Update every minute
    const timerId = setInterval(calculateTimeElapsed, 60000); 

    return () => clearInterval(timerId); // Cleanup interval on component unmount
  }, [startDate]);

  const ElapsedTimeDisplay = () => {
    if (!timeElapsed) {
      return <p className="text-xl text-muted-foreground text-center">Calculando tiempo transcurrido...</p>;
    }
    // Format: Semanas : Días : Horas : Minutos
    return (
      <div className="text-xl sm:text-2xl md:text-3xl font-mono text-center p-4 sm:p-6 bg-secondary/30 rounded-lg shadow-inner w-full">
        <span className="text-primary font-semibold">{String(timeElapsed.weeks).padStart(2, '0')}</span> Semanas :{' '}
        <span className="text-primary font-semibold">{String(timeElapsed.days).padStart(2, '0')}</span> Días :{' '}
        <span className="text-primary font-semibold">{String(timeElapsed.hours).padStart(2, '0')}</span> Horas :{' '}
        <span className="text-primary font-semibold">{String(timeElapsed.minutes).padStart(2, '0')}</span> Minutos
      </div>
    );
  };

  return (
    <div className="flex justify-center items-start pt-6 md:pt-10">
      <Card className="shadow-lg w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Mountain className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline text-primary">Caliza - Monitor de Actividad</CardTitle>
              <CardDescription>Tiempo transcurrido desde la última apertura del módulo de Caliza.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 py-8 md:py-12">
          <div className="flex items-center text-accent-foreground space-x-2 bg-accent p-3 rounded-md">
            <Timer className="h-6 w-6" /> {/* Changed icon */}
            <p className="text-md sm:text-lg font-semibold">DIAS SIN ABRIR</p>
          </div>
          <ElapsedTimeDisplay />
          <p className="text-sm text-muted-foreground text-center mt-4">
            Esta sección se encuentra en desarrollo. Pronto podrá gestionar stock, logística, pedidos y análisis de calidad de caliza.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
