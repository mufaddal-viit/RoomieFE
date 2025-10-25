import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { storage } from '@/lib/storage';
import { EXPENSE_CATEGORIES, Roommate } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const AddExpense = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<Roommate | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const userId = storage.getCurrentUser();
    if (!userId) {
      navigate('/');
      return;
    }

    const allRoommates = storage.getRoommates();
    const user = allRoommates.find(r => r.id === userId);
    if (!user) {
      navigate('/');
      return;
    }

    setCurrentUser(user);
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !description.trim() || !amount || !category) {
      toast.error('Please fill in all fields');
      return;
    }

    const expenses = storage.getExpenses();
    const newExpense = {
      id: `expense-${Date.now()}`,
      description: description.trim(),
      amount: parseFloat(amount),
      category,
      addedBy: currentUser.id,
      addedByName: currentUser.name,
      date: new Date().toISOString(),
      status: 'pending' as const,
    };

    storage.setExpenses([...expenses, newExpense]);
    toast.success('Expense added successfully! Waiting for manager approval.');
    navigate('/dashboard');
  };

  if (!currentUser) return null;

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

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What was purchased?"
                  required
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
      </main>
    </div>
  );
};

export default AddExpense;
