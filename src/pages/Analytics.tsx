import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { Expense, Roommate } from '@/lib/types';
import { ArrowLeft, TrendingDown, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Layout from '@/components/Layout';

const Analytics = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);

  useEffect(() => {
    const load = async () => {
      const roomId = storage.getCurrentRoom();
      if (!roomId) {
        navigate('/');
        return;
      }
      try {
        const [roomExpenses, currentRoommates] = await Promise.all([
          storage.getExpenses(roomId),
          storage.getRoommates(roomId),
        ]);
        setExpenses(roomExpenses);
        setRoommates(currentRoommates);
      } catch (error) {
        console.error(error);
        navigate('/');
      }
    };

    load();
  }, [navigate]);

  const approvedExpenses = expenses.filter(e => e.status === 'approved');

  // Category breakdown
  const categoryTotals = approvedExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({ category, amount }));

  // Person breakdown
  const personTotals = approvedExpenses.reduce((acc, exp) => {
    const name = exp.addedByName || 'Unknown';
    acc[name] = (acc[name] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedPersons = Object.entries(personTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([name, amount]) => ({ name, amount }));

  const totalExpense = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const avgExpense = approvedExpenses.length > 0 ? totalExpense / approvedExpenses.length : 0;

  return (
    <Layout
      title="Expense Analytics"
      subtitle="Insights to help reduce spending"
      actions={
        <Button onClick={() => navigate('/dashboard')} variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      }
      userName={roommates.find(r => r.isManager)?.name ?? roommates[0]?.name}
      isManager={!!roommates.find(r => r.isManager)}
      contentClassName="max-w-6xl space-y-6"
    >
      <Alert>
        <TrendingDown className="h-4 w-4" />
        <AlertDescription>
          <strong>Cost Saving Tips:</strong> Focus on reducing expenses in your top spending categories.
          Consider bulk buying for frequently purchased items and compare prices before shopping.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedCategories.map(({ category, amount }) => (
              <div key={category} className="flex justify-between">
                <span>{category}</span>
                <span className="font-medium">${amount.toFixed(2)}</span>
              </div>
            ))}
            {sortedCategories.length === 0 && (
              <p className="text-sm text-muted-foreground">No approved expenses yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedPersons.map(({ name, amount }) => (
              <div key={name} className="flex justify-between">
                <span>{name}</span>
                <span className="font-medium">${amount.toFixed(2)}</span>
              </div>
            ))}
            {sortedPersons.length === 0 && (
              <p className="text-sm text-muted-foreground">No approved expenses yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Approved</p>
            <p className="text-2xl font-bold">${totalExpense.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Expense</p>
            <p className="text-2xl font-bold">${avgExpense.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Count</p>
            <p className="text-2xl font-bold">{approvedExpenses.length}</p>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Analytics;
