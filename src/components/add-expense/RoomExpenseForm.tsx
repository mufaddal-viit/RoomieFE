import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { storage } from '@/lib/storage';
import type { Roommate } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { expenseFields } from '@/config/expenseFormFields';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm(prev => ({ ...prev, memberId: currentUserId }));
  }, [currentUserId]);

  const { description, amount, category, memberId } = form;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!currentUserId || !storage.getAuthToken()) {
      toast.error('You must be signed in to submit an expense');
      return;
    }

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

    const parsedDate = form.date ? new Date(form.date) : null;
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      toast.error('Please select a valid date');
      return;
    }

    setIsSubmitting(true);
    try {
      //api call to backend 
      await storage.createExpense({
        roomId,
        description: description.trim(),
        amount: amountValue,
        category,
        date: parsedDate.toISOString(),
        addedById: currentUserId,
      });
      toast.success('Expense added successfully! Waiting for manager approval.');
      setForm({ ...initialForm, memberId: currentUserId });
      // navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add expense';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
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
            const isMemberField = field.name === 'memberId';
            const parsedDate = field.type === 'calendar' && value ? new Date(value) : undefined;
            const selectedDate =
              parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : undefined;

            return (
              <div key={field.name}>
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === 'calendar' ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id={field.name}
                        type="button"
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !selectedDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : field.placeholder || 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) =>
                          setForm(prev => ({ ...prev, [field.name]: date ? date.toISOString() : '' }))
                        }
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                ) : field.type === 'select' ? (
                  <Select
                    value={value}
                    onValueChange={(val) => setForm(prev => ({ ...prev, [field.name]: val }))}
                    disabled={isMemberField}
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
            <Button type="submit" className="w-full sm:flex-1" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner className="size-4" aria-hidden="true" />
                  Adding...
                </span>
              ) : (
                'Add Expense'
              )}
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
