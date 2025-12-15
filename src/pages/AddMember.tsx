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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isManager, setIsManager] = useState(false);
  const roomId = storage.getCurrentRoom();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!roomId) {
      toast.error('No active room found');
      return;
    }

    try {
      await storage.createRoommate({
        name: name.trim(),
        email: email.trim(),
        password,
        roomId,
        isManager,
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
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Taylor Smith"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="taylor@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isManager"
                type="checkbox"
                checked={isManager}
                onChange={e => setIsManager(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="isManager">Set as manager</Label>
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
