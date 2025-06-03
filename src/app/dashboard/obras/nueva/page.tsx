import ProtectedPage from '@/components/auth/ProtectedPage';
import NuevaObraForm from '@/components/obras/NuevaObraForm';

export default function NuevaObraPage() {
  return (
    <ProtectedPage allowedRoles={['Oficina Técnica']}>
      <NuevaObraForm />
    </ProtectedPage>
  );
}
