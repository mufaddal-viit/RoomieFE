import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { storage } from '@/lib/storage';
import { Expense } from '@/lib/types';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { useSession } from '@/contexts/SessionContext';

const Approvals = () => {
  const navigate = useNavigate();
  const { currentUser, roomId, loading } = useSession();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [actionLoading, setActionLoading] = useState<Record<string, 'approve' | 'reject'>>({});

  useEffect(() => {
    if (loading) return;
    if (!currentUser || !roomId) {
      navigate('/');
      return;
    }
    if (!currentUser.isManager) {
      navigate('/dashboard');
      return;
    }

    const loadExpenses = async () => {
      try {
        const roomExpenses = await storage.getExpenses(roomId);
        setExpenses(roomExpenses);
      } catch (error) {
        console.error(error);
        navigate('/');
      }
    };

    loadExpenses();
  }, [loading, currentUser, roomId, navigate]);

  const handleApprove = (expenseId: string) => {
    if (!currentUser) return;
    if (actionLoading[expenseId]) return;

    setActionLoading(prev => ({ ...prev, [expenseId]: 'approve' }));

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
      })
      .finally(() => {
        setActionLoading(prev => {
          const next = { ...prev };
          delete next[expenseId];
          return next;
        });
      });
  };

  const handleReject = (expenseId: string) => {
    if (!currentUser) return;
    if (actionLoading[expenseId]) return;

    setActionLoading(prev => ({ ...prev, [expenseId]: 'reject' }));

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
      })
      .finally(() => {
        setActionLoading(prev => {
          const next = { ...prev };
          delete next[expenseId];
          return next;
        });
      });
  };

  const pendingExpenses = expenses.filter(e => e.status === 'pending');

  if (!currentUser || !roomId || loading) return null;

  return (
    <Layout
      title="Pending Approvals"
      subtitle={`Pending items: ${pendingExpenses.length}`}
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
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold">{expense.description}</h3>
                        <Badge variant="secondary">{expense.category}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Added by: {expense.addedByName || 'Unknown'}</p>
                        <p>Date: {new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 md:items-end">
                      {(() => {
                        const currentAction = actionLoading[expense.id];
                        const isBusy = Boolean(currentAction);
                        const isApproving = currentAction === 'approve';
                        const isRejecting = currentAction === 'reject';

                        return (
                          <>
                            <div className="text-2xl font-bold text-foreground">
                              ${expense.amount.toFixed(2)}
                            </div>
                            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                              <Button
                                onClick={() => handleApprove(expense.id)}
                                size="sm"
                                className="w-full bg-success hover:bg-success/90 sm:w-auto"
                                variant="outline"
                                disabled={isBusy}
                                aria-busy={isApproving}
                              >
                                {isApproving ? (
                                  <>
                                    <Spinner className="mr-2 size-4" aria-hidden="true" />
                                    Approving...
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => handleReject(expense.id)}
                                size="sm"
                                variant="destructive"
                                className="w-full sm:w-auto"
                                disabled={isBusy}
                                aria-busy={isRejecting}
                              >
                                {isRejecting ? (
                                  <>
                                    <Spinner className="mr-2 size-4" aria-hidden="true" />
                                    Rejecting...
                                  </>
                                ) : (
                                  <>
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </div>
                          </>
                        );
                      })()}
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
