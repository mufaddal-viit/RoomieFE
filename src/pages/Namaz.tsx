import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { storage } from '@/lib/storage';

const Namaz = () => {
  const navigate = useNavigate();

  return (
    <Layout
      title="Namaz Tracker"
      actions={
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      }
      userName={storage.getCurrentUser() || undefined}
      isManager={false}
      contentClassName="max-w-3xl space-y-4"
    >
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          This page will let you log daily Namaz progress and view streaks.
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Namaz;
