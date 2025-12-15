import { useState, useEffect, type FormEvent } from 'react';
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
import Layout from '@/components/Layout';

const AddExpense = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<Roommate | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const userId = storage.getCurrentUser();
      const activeRoom = storage.getCurrentRoom();
      if (!userId || !activeRoom) {
        navigate('/');
        return;
      }

      try {
        const roommates = await storage.getRoommates(activeRoom);
        const user = roommates.find(r => r.id === userId);
        if (!user) {
          navigate('/');
          return;
        }
        setCurrentUser(user);
        setRoomId(activeRoom);
      } catch (error) {
        console.error(error);
        navigate('/');
      }
    };
    load();
  }, [navigate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!currentUser || !description.trim() || !amount || !category) {
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
      addedById: currentUser.id,
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

  if (!currentUser) return null;

  return (
    <Layout
      title="Add New Expense"
      actions={
        <Button onClick={() => navigate('/dashboard')} variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      }
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
              <Label htmlFor="amount">Amount ($)</Label>
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
    </Layout>
  );
};

export default AddExpense;
