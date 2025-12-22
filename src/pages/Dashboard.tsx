import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '@/lib/storage';
import { Expense } from '@/lib/types';
import { Plus, DollarSign, TrendingUp, Clock } from 'lucide-react';
import ExpenseList from '@/components/ExpenseList';
import ExpenseStats from '@/components/ExpenseStats';
import StatsCard from '@/components/StatsCard';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useSession } from '@/contexts/SessionContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, roommates, roomId, loading: sessionLoading } = useSession();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    if (!currentUser || !roomId) {
      navigate('/');
      return;
    }

    const loadExpenses = async () => {
      try {
        setLoadingExpenses(true);
        const roomExpenses = await storage.getExpenses(roomId);
        setExpenses(roomExpenses);
      } catch (error) {
        console.error(error);
        navigate('/');
      } finally {
        setLoadingExpenses(false);
      }
    };

    loadExpenses();
  }, [sessionLoading, currentUser, roomId, navigate]);

  const approvedExpenses = expenses.filter(e => e.status === 'approved');
  const totalExpense = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const perPersonShare = roommates.length > 0 ? totalExpense / roommates.length : 0;
  const pendingCount = expenses.filter(e => e.status === 'pending').length;

  if (!currentUser || sessionLoading || loadingExpenses) return null;

  return (
    <Layout
      title="Expense Tracker"
      subtitle={
        <>
          Welcome, {currentUser.name}
          {currentUser.isManager && ' (Manager)'}
        </>
      }
      isManager={!!currentUser.isManager}
      userName={currentUser.name}
      contentClassName="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Room Expense"
          value={`$${totalExpense.toFixed(2)}`}
          description="This month's approved expenses"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Your Share"
          value={`$${perPersonShare.toFixed(2)}`}
          description={`Split equally among ${roommates.length} people`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Pending Approvals"
          value={pendingCount.toString()}
          description="Waiting for manager approval"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="flex flex-wrap gap-3">
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

        <Button onClick={() => navigate('/personal')} variant="outline">
          Personal Expense
        </Button>

        <Button onClick={() => navigate('/namaz')} variant="outline">
          Update Namaz
        </Button>

        <Button onClick={() => navigate('/todos')} variant="outline">
          Personal Todos
        </Button>
      </div>

      <ExpenseStats expenses={approvedExpenses} roommates={roommates} />

      <ExpenseList expenses={expenses} />
    </Layout>
  );
};

export default Dashboard;
