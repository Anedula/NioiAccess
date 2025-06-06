
"use client";
// This page is intentionally kept simple.
// The main content for "Listado de Obras" is now rendered within
// /src/app/dashboard/oficina-tecnica/page.tsx using Tabs and the
// ListadoObrasTab component.
// This page file primarily serves to ensure that sub-routes like
// /dashboard/oficina-tecnica/obras/nueva and
// /dashboard/oficina-tecnica/obras/editar/[id]
// continue to function correctly under the Next.js App Router.

// If direct navigation to /dashboard/oficina-tecnica/obras was desired
// without the tab interface, this page would host the ListadoObrasTab component directly.
// However, current navigation directs to /dashboard/oficina-tecnica which handles tabs.

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ObrasRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main Oficina Técnica page which has tabs
    router.replace('/dashboard/oficina-tecnica');
  }, [router]);

  return (
    <div className="flex justify-center items-center h-full">
      <p>Redirigiendo a Oficina Técnica...</p>
    </div>
  );
}
