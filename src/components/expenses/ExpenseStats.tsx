import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Expense, Roommate } from '@/lib/types';

interface ExpenseStatsProps {
  expenses: Expense[];
  roommates: Roommate[];
}

const ExpenseStats = ({ expenses, roommates }: ExpenseStatsProps) => {
  const personTotals = expenses.reduce((acc, exp) => {
    const name = exp.addedByName || 'Unknown';
    acc[name] = (acc[name] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPersonShare = roommates.length > 0 ? totalExpense / roommates.length : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Individual Contributions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roommates.map((roommate) => {
            const spent = personTotals[roommate.name] || 0;
            const balance = spent - perPersonShare;

            return (
              <div key={roommate.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{roommate.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Spent: ${spent.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  {balance > 0 ? (
                    <p className="text-sm text-success font-medium">
                      Will receive: ${balance.toFixed(2)}
                    </p>
                  ) : balance < 0 ? (
                    <p className="text-sm text-destructive font-medium">
                      Needs to pay: ${Math.abs(balance).toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Settled</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseStats;
