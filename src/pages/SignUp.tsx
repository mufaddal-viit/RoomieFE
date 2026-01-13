import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roomIdToJoin, setRoomIdToJoin] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    if (currentUser) {
      navigate('/dashboard');
      return;
    }
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const targetRoomId = roomIdToJoin.trim();

      await storage.createRoommate({
        name: name.trim(),
        email: email.trim(),
        password,
        ...(targetRoomId ? { roomId: targetRoomId } : {}),
      });

      const user = await storage.authenticate(email.trim(), password);
      storage.setCurrentUser(user.id);
      if (user.roomId) {
        storage.setCurrentRoom(user.roomId);
      } else if (targetRoomId) {
        storage.setCurrentRoom(targetRoomId);
      }
      toast.success('Account created');
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create account';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Shield className="h-4 w-4" />
            New to Roomie Bill Buddy
          </div>
          <h1 className="text-4xl font-bold text-foreground leading-tight">
            Create your account
          </h1>
          <p className="text-muted-foreground text-lg">
            Get started with Roomie Bill Buddy. If you have a room ID, you can join it now.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <CardTitle>Sign up</CardTitle>
            </div>
            <CardDescription>Set up your profile to join the expense tracker.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomIdToJoin">Join existing room (ID)</Label>
                <Input
                  id="roomIdToJoin"
                  value={roomIdToJoin}
                  onChange={e => setRoomIdToJoin(e.target.value)}
                  placeholder="Paste a room ID to join a room"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Create account
              </Button>
            </form>

            <p className="text-sm text-muted-foreground mt-4 text-center">
              Already registered?{' '}
              <Link to="/" className="text-primary hover:underline">
                Sign in instead
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
