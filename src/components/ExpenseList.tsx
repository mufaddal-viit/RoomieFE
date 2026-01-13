import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Expense } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

interface ExpenseListProps {
  expenses: Expense[];
}

const ExpenseList = ({ expenses }: ExpenseListProps) => {
  const navigate = useNavigate();

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Recent Expenses</CardTitle>
          <Button
            variant='ghost'
            className="self-start text-sm font-medium text-primary hover:underline sm:self-auto"
            onClick={() => navigate('/expenses')}
          >
            View All
          </Button>
        </div>
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
                className="flex flex-col gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
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
                <div className="text-left sm:text-right">
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
