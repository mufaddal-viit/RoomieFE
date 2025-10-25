import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { storage } from '@/lib/storage';
import { Roommate, Expense } from '@/lib/types';
import { ArrowLeft, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const Approvals = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<Roommate | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const userId = storage.getCurrentUser();
    if (!userId) {
      navigate('/');
      return;
    }

    const allRoommates = storage.getRoommates();
    const user = allRoommates.find(r => r.id === userId);
    if (!user || !user.isManager) {
      navigate('/dashboard');
      return;
    }

    setCurrentUser(user);
    setExpenses(storage.getExpenses());
  }, [navigate]);

  const handleApprove = (expenseId: string) => {
    if (!currentUser) return;

    const updatedExpenses = expenses.map(exp =>
      exp.id === expenseId
        ? {
            ...exp,
            status: 'approved' as const,
            approvedBy: currentUser.id,
            approvedByName: currentUser.name,
            approvedAt: new Date().toISOString(),
          }
        : exp
    );

    storage.setExpenses(updatedExpenses);
    setExpenses(updatedExpenses);
    toast.success('Expense approved successfully');
  };

  const handleReject = (expenseId: string) => {
    if (!currentUser) return;

    const updatedExpenses = expenses.map(exp =>
      exp.id === expenseId
        ? {
            ...exp,
            status: 'rejected' as const,
            approvedBy: currentUser.id,
            approvedByName: currentUser.name,
            approvedAt: new Date().toISOString(),
          }
        : exp
    );

    storage.setExpenses(updatedExpenses);
    setExpenses(updatedExpenses);
    toast.error('Expense rejected');
  };

  const pendingExpenses = expenses.filter(e => e.status === 'pending');

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button onClick={() => navigate('/dashboard')} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
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
                          <p>Added by: {expense.addedByName}</p>
                          <p>Date: {new Date(expense.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground mb-3">
                          ₹{expense.amount.toFixed(2)}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(expense.id)}
                            size="sm"
                            className="bg-success hover:bg-success/90"
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
      </main>
    </div>
  );
};

export default Approvals;
