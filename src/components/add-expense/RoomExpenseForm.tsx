import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { storage } from '@/lib/storage';
import type { Roommate } from '@/lib/types';
import { toast } from 'sonner';
import { expenseFields } from '@/config/expenseFormFields';

const MAX_EXPENSE_AMOUNT = 2000;

type RoomExpenseFormProps = {
  currentUserId: string;
  roomId: string;
  roommates: Roommate[];
};

const RoomExpenseForm = ({ currentUserId, roomId, roommates }: RoomExpenseFormProps) => {
  const navigate = useNavigate();
  const initialForm = useMemo(
    () =>
      expenseFields.reduce(
        (acc, field) => {
          acc[field.name] = '';
          return acc;
        },
        {} as Record<string, string>
      ),
    []
  );
  const [form, setForm] = useState<Record<string, string>>(initialForm);

  useEffect(() => {
    setForm(prev => ({ ...prev, memberId: currentUserId }));
  }, [currentUserId]);

  const { description, amount, category, memberId } = form;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const missingRequired = expenseFields.some(field => {
      const value = form[field.name];
      return value === undefined || value === null || `${value}`.trim() === '';
    });

    if (missingRequired) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountValue = Number.parseFloat(amount);
    if (Number.isNaN(amountValue)) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountValue > MAX_EXPENSE_AMOUNT) {
      toast.error(`Amount cannot exceed $${MAX_EXPENSE_AMOUNT}`);
      return;
    }

    //api call to backend 
    storage.createExpense({
      roomId,
      description: description.trim(),
      amount: amountValue,
      category,
      date: new Date().toISOString(),
      addedById: memberId,
    })
      .then(() => {
        toast.success('Expense added successfully! Waiting for manager approval.');
        navigate('/dashboard');
      })
      .catch(err => {
        const message = err instanceof Error ? err.message : 'Failed to add expense';
        toast.error(message);
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Room Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {expenseFields.map(field => {
            const value = form[field.name] ?? '';
            const options = field.getOptions ? field.getOptions(roommates, currentUserId) : field.options ?? [];

            return (
              <div key={field.name}>
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === 'select' ? (
                  <Select
                    value={value}
                    onValueChange={(val) => setForm(prev => ({ ...prev, [field.name]: val }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder || 'Select an option'} />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'textarea' ? (
                  <Textarea
                    id={field.name}
                    value={value}
                    onChange={(e) => setForm(prev => ({ ...prev, [field.name]: e.target.value }))}
                    placeholder={field.placeholder}
                    required
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type === 'number' ? 'number' : 'text'}
                    step={field.type === 'number' ? '0.01' : undefined}
                    min={field.type === 'number' ? '0' : undefined}
                    max={field.name === 'amount' ? `${MAX_EXPENSE_AMOUNT}` : undefined}
                    value={value}
                    onChange={(e) => setForm(prev => ({ ...prev, [field.name]: e.target.value }))}
                    placeholder={field.placeholder}
                    required
                  />
                )}
              </div>
            );
          })}

          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Button type="submit" className="w-full sm:flex-1">
              Add Expense
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RoomExpenseForm;
