import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { storage } from '@/lib/storage';
import { Roommate, Expense } from '@/lib/types';
import { ArrowLeft, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

const Approvals = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<Roommate | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const userId = storage.getCurrentUser();
      const activeRoom = storage.getCurrentRoom();
      if (!userId || !activeRoom) {
        navigate('/');
        return;
      }

      try {
        const roommates = await storage.getRoommates(activeRoom);
        const user = roommates.find(r => r.id === userId);
        if (!user || !user.isManager) {
          navigate('/dashboard');
          return;
        }

        const roomExpenses = await storage.getExpenses(activeRoom);
        setCurrentUser(user);
        setRoomId(activeRoom);
        setExpenses(roomExpenses);
      } catch (error) {
        console.error(error);
        navigate('/');
      }
    };

    load();
  }, [navigate]);

  const handleApprove = (expenseId: string) => {
    if (!currentUser) return;

    storage
      .updateExpenseStatus(expenseId, 'approved', currentUser.id)
      .then((updated) => {
        setExpenses(prev =>
          prev.map(exp => (exp.id === expenseId ? { ...exp, ...updated } : exp))
        );
        toast.success('Expense approved successfully');
      })
      .catch(err => {
        const message = err instanceof Error ? err.message : 'Failed to approve expense';
        toast.error(message);
      });
  };

  const handleReject = (expenseId: string) => {
    if (!currentUser) return;

    storage
      .updateExpenseStatus(expenseId, 'rejected', currentUser.id)
      .then((updated) => {
        setExpenses(prev =>
          prev.map(exp => (exp.id === expenseId ? { ...exp, ...updated } : exp))
        );
        toast.error('Expense rejected');
      })
      .catch(err => {
        const message = err instanceof Error ? err.message : 'Failed to reject expense';
        toast.error(message);
      });
  };

  const pendingExpenses = expenses.filter(e => e.status === 'pending');

  if (!currentUser || !roomId) return null;

  return (
    <Layout
      title="Pending Approvals"
      subtitle={`Pending items: ${pendingExpenses.length}`}
      actions={
        <Button onClick={() => navigate('/dashboard')} variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      }
      isManager={!!currentUser.isManager}
      userName={currentUser.name}
      contentClassName="max-w-4xl"
    >
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals ({pendingExpenses.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending expenses to approve
            </div>
          ) : (
            pendingExpenses.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{expense.description}</h3>
                        <Badge variant="secondary">{expense.category}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Added by: {expense.addedByName || 'Unknown'}</p>
                        <p>Date: {new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground mb-3">
                        ${expense.amount.toFixed(2)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(expense.id)}
                          size="sm"
                          className="bg-success hover:bg-success/90"
                          variant='outline'
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(expense.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Approvals;
