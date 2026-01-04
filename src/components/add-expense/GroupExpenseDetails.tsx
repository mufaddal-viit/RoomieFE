import { DollarSign, NotebookPen } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type GroupExpenseDetailsProps = {
  description: string;
  amount: string;
  onDescriptionChange: (value: string) => void;
  onAmountChange: (value: string) => void;
};

export const GroupExpenseDetails = ({
  description,
  amount,
  onDescriptionChange,
  onAmountChange,
}: GroupExpenseDetailsProps) => {
  return (
    <div className="rounded-xl border border-muted/60 bg-background/70 p-4 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Expense details</h4>
          <p className="text-xs text-muted-foreground">
            Add a short description and the total amount to split.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col justify-center gap-4 sm:grid-cols-[1.6fr,1fr]">
        <div className="space-y-2">
          <Label htmlFor="group-expense-description" className="text-xs font-medium text-muted-foreground">
            Description
          </Label>
          <div className="relative">
            <NotebookPen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="group-expense-description"
              type="text"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Enter a description"
              className="h-11 rounded-xl border-muted/60 bg-background/80 pl-10 text-sm shadow-none focus-visible:ring-primary/30"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="group-expense-amount" className="text-xs font-medium text-muted-foreground">
            Total amount
          </Label>
          <div className="relative">
            <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="group-expense-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0.00"
              className="h-11 rounded-xl border-muted/60 bg-background/80 pl-9 text-sm shadow-none focus-visible:ring-primary/30"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
