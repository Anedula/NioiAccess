
"use client";

import ProtectedPage from '@/components/auth/ProtectedPage';
import PedidosDesdeOTTab from '@/components/compras/PedidosDesdeOTTab';

export default function ComprasPage() {
  return (
    <ProtectedPage allowedRoles={['Compras']}>
      <PedidosDesdeOTTab />
    </ProtectedPage>
  );
}
