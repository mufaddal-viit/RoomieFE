import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { useSession } from '@/contexts/SessionContext';

const Personal = () => {
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
      title="Personal Expenses"
      userName={currentUser.name}
      isManager={!!currentUser.isManager}
      contentClassName="max-w-3xl space-y-4"
    >
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          This page will track your personal expenses separate from shared room costs.
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Personal;
