
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TimeLeft {
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
}

export default function CalizaPage() {
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Calculate target date: 30 days from now. This runs only on the client after mount.
    const date = new Date();
    date.setDate(date.getDate() + 30);
    setTargetDate(date);
  }, []);

  useEffect(() => {
    if (!targetDate) return; // Don't start timer until targetDate is set

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference <= 0) {
        setIsFinished(true);
        setTimeLeft({ weeks: 0, days: 0, hours: 0, minutes: 0 });
        return true; // Indicates timer should stop
      }

      const totalSeconds = Math.floor(difference / 1000);
      const weeks = Math.floor(totalSeconds / (60 * 60 * 24 * 7));
      const days = Math.floor((totalSeconds % (60 * 60 * 24 * 7)) / (60 * 60 * 24));
      const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

      setTimeLeft({ weeks, days, hours, minutes });
      setIsFinished(false);
      return false; // Indicates timer should continue
    };

    // Initial calculation
    if (calculateTimeLeft()) {
      return; // Stop if already finished
    }

    // Update every minute
    const timerId = setInterval(() => {
      if (calculateTimeLeft()) {
        clearInterval(timerId);
      }
    }, 60000); 

    return () => clearInterval(timerId); // Cleanup interval on component unmount
  }, [targetDate]);

  const CountdownDisplay = () => {
    if (isFinished) {
      return <p className="text-2xl md:text-3xl font-bold text-primary text-center">¡El plazo ha finalizado!</p>;
    }
    if (!timeLeft) {
      return <p className="text-xl text-muted-foreground text-center">Calculando tiempo restante...</p>;
    }
    // Format: Semanas : Días : Horas : Minutos
    return (
      <div className="text-xl sm:text-2xl md:text-3xl font-mono text-center p-4 sm:p-6 bg-secondary/30 rounded-lg shadow-inner w-full">
        <span className="text-primary font-semibold">{String(timeLeft.weeks).padStart(2, '0')}</span> Semanas :{' '}
        <span className="text-primary font-semibold">{String(timeLeft.days).padStart(2, '0')}</span> Días :{' '}
        <span className="text-primary font-semibold">{String(timeLeft.hours).padStart(2, '0')}</span> Horas :{' '}
        <span className="text-primary font-semibold">{String(timeLeft.minutes).padStart(2, '0')}</span> Minutos
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
              <CardTitle className="text-2xl font-headline text-primary">Caliza</CardTitle>
              <CardDescription>Cuenta regresiva para el lanzamiento de la gestión de Caliza.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 py-8 md:py-12">
          <div className="flex items-center text-accent-foreground space-x-2 bg-accent p-3 rounded-md">
            <Clock className="h-6 w-6" />
            <p className="text-md sm:text-lg font-semibold">Lanzamiento de módulo en:</p>
          </div>
          <CountdownDisplay />
          <p className="text-sm text-muted-foreground text-center mt-4">
            Esta sección se encuentra en desarrollo. Pronto podrá gestionar stock, logística, pedidos y análisis de calidad de caliza.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
