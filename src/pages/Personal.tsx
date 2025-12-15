import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';

const Personal = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Personal Expenses"
        actions={
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        }
      />

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            This page will track your personal expenses separate from shared room costs.
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Personal;
