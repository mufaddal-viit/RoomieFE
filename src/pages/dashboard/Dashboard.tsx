import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Expense, BankSummary } from "@/lib/types";
import StatsCard from "@/components/StatsCard";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";
import Analytics from "./Analytics";
import { dashboardStats } from "@/config/dashboardStats";
import { dashboardMenuItems } from "@/config/dashboardMenuItems";
import DashboardSkeleton from "@/components/layout/DashboardSkeleton";
import { Landmark, TrendingUp, TrendingDown, Receipt } from "lucide-react";

const ExpenseList = lazy(() => import("@/components/expenses/ExpenseList"));

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    roommates,
    roomId,
    loading: sessionLoading,
  } = useSession();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bankSummary, setBankSummary] = useState<BankSummary | null>(null);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    if (!currentUser || !roomId) {
      setLoadingExpenses(false);
      const storedUserId = api.session.getCurrentUser();
      const storedRoomId = api.session.getCurrentRoom();
      if (storedUserId && !storedRoomId) {
        navigate("/room-setup");
      } else {
        navigate("/");
      }
      return;
    }

    const loadExpenses = async () => {
      try {
        setLoadingExpenses(true);
        const [roomExpenses, summary] = await Promise.all([
          api.expenses.listByRoom(roomId),
          api.contributions.getBankSummary(roomId).catch(() => null),
        ]);
        setExpenses(roomExpenses);
        setBankSummary(summary);
      } catch (error) {
        console.error(error);
        navigate("/");
      } finally {
        setLoadingExpenses(false);
      }
    };

    loadExpenses();
  }, [sessionLoading, currentUser, roomId, navigate]);

  const isLoading = sessionLoading || loadingExpenses;

  if (isLoading) {
    return (
      <Layout
        title="Roomie Bill Buddy"
        subtitle="Loading dashboard..."
        isManager={false}
        userName={currentUser?.name}
        contentClassName="space-y-6"
      >
        <DashboardSkeleton />
      </Layout>
    );
  }

  const approvedExpenses = expenses.filter((e) => e.status === "approved");
  const totalExpense = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const perPersonShare =
    roommates.length > 0 ? totalExpense / roommates.length : 0;
  const pendingCount = expenses.filter((e) => e.status === "pending").length;
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

  if (!currentUser) return null;

  return (
    <Layout
      title="Roomie Bill Buddy"
      subtitle={
        <>
          Welcome, {currentUser.name}
          {currentUser.isManager && " (Manager)"}
        </>
      }
      isManager={!!currentUser.isManager}
      userName={currentUser.name}
      contentClassName="space-y-6"
    >
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div> */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap">
        {dashboardMenuItems
          .filter((item) => !item.requiresManager || menuInput.isManager)
          .map((item) => {
            const label =
              typeof item.label === "function"
                ? item.label(menuInput)
                : item.label;
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                variant={item.variant ?? "outline"}
                className="w-full justify-start sm:justify-center xl:w-auto"
              >
                {Icon && <Icon className="h-4 w-4 mr-2" />}
                {label}
              </Button>
            );
          })}
      </div>

      {/* Bank Summary Cards */}
      {bankSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Bank Balance"
            value={`AED ${bankSummary.bankBalance.toFixed(2)}`}
            description={bankSummary.bankBalance >= 0 ? "Surplus" : "Deficit"}
            icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Total Contributed"
            value={`AED ${bankSummary.totalContributed.toFixed(2)}`}
            description="All payments received"
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Total Spent"
            value={`AED ${bankSummary.totalSpent.toFixed(2)}`}
            description="Approved expenses"
            icon={<Receipt className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Profit / Loss"
            value={`AED ${bankSummary.profitLoss.toFixed(2)}`}
            description={bankSummary.profitLoss >= 0 ? "In the green" : "Over budget"}
            icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      )}

      {/* <ExpenseStats expenses={approvedExpenses} roommates={roommates} /> */}
      <Suspense
        fallback={
          <div className="text-sm text-muted-foreground">
            Loading Analytics...
          </div>
        }
      >
        <Analytics />
      </Suspense>

      <Suspense
        fallback={
          <div className="text-sm text-muted-foreground">
            Loading expenses...
          </div>
        }
      >
        <ExpenseList expenses={expenses} />
      </Suspense>
    </Layout>
  );
};

export default Dashboard;
