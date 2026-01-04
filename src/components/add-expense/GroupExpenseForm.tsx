import { useMemo, useState, type FormEvent } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { Roommate } from '@/lib/types';
import { SelectPills } from '@/components/ui/currency-select';
import { GroupExpenseDetails } from './GroupExpenseDetails';
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';
import { useSession } from '@/contexts/SessionContext';

type GroupExpenseFormProps = {
  roommates: Roommate[];
};

const GroupExpenseForm = ({ roommates }: GroupExpenseFormProps) => {
  const navigate = useNavigate();
  const { currentUser, roomId } = useSession();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const selectedRoommates = useMemo(
    () => roommates.filter(roommate => selectedMembers.includes(roommate.name)),
    [roommates, selectedMembers]
  );

  const getInitials = (name: string) => {
    const [first, second] = name.split(' ');
    return `${first?.[0] ?? ''}${second?.[0] ?? ''}`.toUpperCase() || '?';
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!currentUser || !roomId) {
      toast.error('Missing room or user session');
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error('Please select at least one roommate');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    const amountValue = Number(amount);
    if (!amount || Number.isNaN(amountValue) || amountValue <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!expenseDate) {
      toast.error('Please choose an expense date');
      return;
    }

    const normalizedDate = new Date(`${expenseDate}T00:00:00`).toISOString();

    storage
      .createExpense({
        roomId,
        description: description.trim(),
        amount: amountValue,
        category: 'Group',
        date: normalizedDate,
        addedById: currentUser.id,
      })
      .then(() => {
        toast.success('Group expense added successfully! Waiting for manager approval.');
        navigate('/dashboard');
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Failed to add expense';
        toast.error(message);
      });
  };

  return (
    <Card className="overflow-hidden border-muted/60 bg-gradient-to-br from-muted/30 via-background to-background">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl font-semibold">Add Group Expense</CardTitle>
        <CardDescription>
          Split one expense across selected roommates and keep the total in sync.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="group-members" className="text-sm font-medium text-foreground">
              Who should share this expense?
            </Label>
            <div className="flex items-center gap-3">
              <Label
                htmlFor="group-expense-date"
                className="text-xs font-medium text-muted-foreground whitespace-nowrap"
              >
                Expense date
              </Label>

              <div className="relative">
                <Input
                  id="group-expense-date"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="h-8 w-[150px] border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
            <SelectPills
              data={roommates.map(roommate => ({ id: roommate.id, name: roommate.name }))}
              value={selectedMembers}
              onValueChange={setSelectedMembers}
              placeholder="Search and add roommates"
              inputId="group-members"
              emptyStateText="No roommates match that name."
            />
            <p className="text-xs text-muted-foreground">
              <span>{selectedRoommates.length} selected</span>
            </p>
          </div>
          {selectedRoommates.length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Search above to add roommates.
            </p>
          ) : (
            <GroupExpenseDetails
              description={description}
              amount={amount}
              onDescriptionChange={setDescription}
              onAmountChange={setAmount}
            />
          )}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Add Expense
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GroupExpenseForm;
