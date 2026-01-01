import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '@/lib/storage';
import { Expense } from '@/lib/types';
import ExpenseList from '@/components/ExpenseList';
import StatsCard from '@/components/StatsCard';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useSession } from '@/contexts/SessionContext';
import Analytics from './Analytics';
import { dashboardStats } from '@/config/dashboardStats';
import { dashboardMenuItems } from '@/config/dashboardMenuItems';

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
  const statsInput = {
    totalExpense,
    perPersonShare,
    pendingCount,
    roommatesCount: roommates.length,
  };
  const menuInput = {
    pendingCount,
    isManager: !!currentUser?.isManager,
  };

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
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value(statsInput)}
              description={stat.description(statsInput)}
              icon={<Icon className="h-4 w-4 text-muted-foreground" />}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        {dashboardMenuItems
          .filter(item => !item.requiresManager || menuInput.isManager)
          .map((item) => {
            const label = typeof item.label === 'function' ? item.label(menuInput) : item.label;
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                variant={item.variant ?? 'outline'}
              >
                {Icon && <Icon className="h-4 w-4 mr-2" />}
                {label}
              </Button>
            );
          })}
      </div>

      {/* <ExpenseStats expenses={approvedExpenses} roommates={roommates} /> */}
      <Analytics />

      <ExpenseList expenses={expenses} />
    </Layout>
  );
};

export default Dashboard;
