import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { Roommate, Expense } from '@/lib/types';
import { LogOut, Plus, DollarSign, TrendingUp, Clock } from 'lucide-react';
import ExpenseList from '@/components/ExpenseList';
import ExpenseStats from '@/components/ExpenseStats';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<Roommate | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);

  useEffect(() => {
    const userId = storage.getCurrentUser();
    if (!userId) {
      navigate('/');
      return;
    }

    const allRoommates = storage.getRoommates();
    const user = allRoommates.find(r => r.id === userId);
    if (!user) {
      navigate('/');
      return;
    }

    setCurrentUser(user);
    setRoommates(allRoommates);
    setExpenses(storage.getExpenses());
  }, [navigate]);

  const handleLogout = () => {
    storage.clearCurrentUser();
    navigate('/');
  };

  const approvedExpenses = expenses.filter(e => e.status === 'approved');
  const totalExpense = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const perPersonShare = totalExpense / roommates.length;
  const pendingCount = expenses.filter(e => e.status === 'pending').length;

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Expense Tracker</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {currentUser.name}
              {currentUser.isManager && ' (Manager)'}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalExpense.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                This month's approved expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Share</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{perPersonShare.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Split equally among {roommates.length} people
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                Waiting for manager approval
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => navigate('/add-expense')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
          {currentUser.isManager && (
            <Button onClick={() => navigate('/approvals')} variant="secondary">
              Manage Approvals ({pendingCount})
            </Button>
          )}
          <Button onClick={() => navigate('/analytics')} variant="outline">
            View Analytics
          </Button>
        </div>

        <ExpenseStats expenses={approvedExpenses} roommates={roommates} />

        <ExpenseList expenses={expenses} />
      </main>
    </div>
  );
};

export default Dashboard;
