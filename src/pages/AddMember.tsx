import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

const AddMember = () => {
  const navigate = useNavigate();
  const [roommateId, setRoommateId] = useState('');
  const [email, setEmail] = useState('');
  const roomId = storage.getCurrentRoom();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!roomId) {
      toast.error('No active room found');
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedRoommateId = roommateId.trim();
    if (!trimmedEmail && !trimmedRoommateId) {
      toast.error('Provide an email or roommate ID');
      return;
    }

    try {
      await storage.addMember({
        email: trimmedEmail || undefined,
        roommateId: trimmedRoommateId || undefined,
      });
      toast.success('Member added');
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add member';
      toast.error(message);
    }
  };

  return (
    <Layout title="Add Member" contentClassName="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add a new roommate</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="taylor@example.com"
              />
            </div>
            <div>
              <Label htmlFor="roommateId">Roommate ID</Label>
              <Input
                id="roommateId"
                value={roommateId}
                onChange={e => setRoommateId(e.target.value)}
                placeholder="Optional if email is provided"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">
                Save
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default AddMember;
