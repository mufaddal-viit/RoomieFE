import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/contexts/SessionContext';

const Savings = () => {
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
      title="Savings"
      subtitle="Track shared savings goals"
      userName={currentUser.name}
      isManager={!!currentUser.isManager}
      contentClassName="max-w-5xl space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Shared Savings Goals</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Add savings targets, track progress, and assign contributions here.
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Savings;
