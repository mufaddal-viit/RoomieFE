import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { useSession } from '@/contexts/SessionContext';
import { expenseFields } from '@/config/expenseFormFields';

const AddExpense = () => {
  const navigate = useNavigate();
  const { currentUser, roommates, roomId, loading } = useSession();
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
    if (loading) return;
    if (!currentUser || !roomId) {
      navigate('/');
      return;
    }
    setForm(prev => ({ ...prev, memberId: currentUser.id }));
  }, [currentUser, roomId, loading, navigate]);

  const { description, amount, category, memberId } = form;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const missingRequired = expenseFields.some(field => {
      const value = form[field.name];
      return value === undefined || value === null || `${value}`.trim() === '';
    });

    if (!currentUser || missingRequired) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!roomId) {
      toast.error('No active room found');
      return;
    }

    storage.createExpense({
      roomId,
      description: description.trim(),
      amount: parseFloat(amount),
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

  if (!currentUser || !roomId || loading) return null;

  return (
    <Layout
      title="Add New Expense"
      userName={currentUser.name}
      isManager={!!currentUser.isManager}
      contentClassName="max-w-2xl"
    >
      <Card>
        <CardHeader>
          <CardTitle>Add New Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {expenseFields.map(field => {
              const value = form[field.name] ?? '';
              const options = field.getOptions ? field.getOptions(roommates, currentUser?.id) : field.options ?? [];

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
                      value={value}
                      onChange={(e) => setForm(prev => ({ ...prev, [field.name]: e.target.value }))}
                      placeholder={field.placeholder}
                      required
                    />
                  )}
                </div>
              );
            })}

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
    </Layout>
  );
};

export default AddExpense;
