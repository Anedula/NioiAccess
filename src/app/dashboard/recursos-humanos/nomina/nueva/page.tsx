
import ProtectedPage from '@/components/auth/ProtectedPage';
import NuevoPersonalForm from '@/components/recursos-humanos/nomina/NuevoPersonalForm';

export default function NuevaPersonalPage() {
  return (
    <ProtectedPage allowedRoles={['Recursos Humanos']}>
      <NuevoPersonalForm />
    </ProtectedPage>
  );
}
