import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { Expense, Roommate } from '@/lib/types';
import { ArrowLeft, TrendingDown, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button onClick={() => navigate('/dashboard')} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Expense Analytics</h1>
          <p className="text-muted-foreground">Insights to help reduce spending</p>
        </div>

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
            <CardContent>
              <div className="space-y-3">
                {sortedCategories.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No expenses yet</p>
                ) : (
                  sortedCategories.map(({ category, amount }) => {
                    const percentage = (amount / totalExpense) * 100;
                    return (
                      <div key={category}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{category}</span>
                          <span className="text-sm text-muted-foreground">
                            ₹{amount.toFixed(2)} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expenses by Person</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedPersons.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No expenses yet</p>
                ) : (
                  sortedPersons.map(({ name, amount }) => {
                    const percentage = (amount / totalExpense) * 100;
                    return (
                      <div key={name}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{name}</span>
                          <span className="text-sm text-muted-foreground">
                            ₹{amount.toFixed(2)} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Average Expense</p>
                <p className="text-2xl font-bold">₹{avgExpense.toFixed(2)}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
                <p className="text-2xl font-bold">{approvedExpenses.length}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Per Person Share</p>
                <p className="text-2xl font-bold">
                  ₹{(totalExpense / roommates.length).toFixed(2)}
                </p>
              </div>
            </div>

            {sortedCategories.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Highest spending category:</strong> {sortedCategories[0].category} (₹
                  {sortedCategories[0].amount.toFixed(2)}). Consider finding alternatives or buying in bulk
                  to reduce costs.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;
