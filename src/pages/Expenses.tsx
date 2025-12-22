import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useSession } from '@/contexts/SessionContext';

const Expenses = () => {
  const navigate = useNavigate();
  const { currentUser, loading, roomId } = useSession();

  useEffect(() => {
    if (loading) return;
    if (!currentUser || !roomId) {
      navigate('/');
    }
  }, [loading, currentUser, roomId, navigate]);

  if (!currentUser || loading) return null;

  return (
    <Layout
      title="All Expenses"
      subtitle="Full expense history"
      userName={currentUser.name}
      isManager={!!currentUser.isManager}
      contentClassName="max-w-5xl space-y-4" children={''}    >
      {/* Intentionally left empty; hook up full expense view here. */}
    </Layout>
  );
};

export default Expenses;
