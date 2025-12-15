import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Expense } from '@/lib/types';

interface ExpenseListProps {
  expenses: Expense[];
}

const ExpenseList = ({ expenses }: ExpenseListProps) => {
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No expenses yet. Add your first expense!
            </div>
          ) : (
            sortedExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{expense.description}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {expense.category}
                    </Badge>
                    {expense.status === 'approved' && (
                      <Badge className="bg-success text-success-foreground text-xs">
                        Approved
                      </Badge>
                    )}
                    {expense.status === 'pending' && (
                      <Badge className="bg-warning text-warning-foreground text-xs">
                        Pending
                      </Badge>
                    )}
                    {expense.status === 'rejected' && (
                      <Badge variant="destructive" className="text-xs">
                        Rejected
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Added by {expense.addedByName || 'Unknown'} on{' '}
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">${expense.amount.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseList;
