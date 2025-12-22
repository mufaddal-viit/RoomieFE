import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage } from '@/lib/storage';
import { Roommate } from '@/lib/types';
import { toast } from 'sonner';
import { useSession } from '@/contexts/SessionContext';

const SignIn = () => {
  const navigate = useNavigate();
  const { setSession, refreshSession } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [loading, setLoading] = useState(false);
  const defaultRoomId = import.meta.env.VITE_DEFAULT_ROOM_ID;

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    const currentRoom = storage.getCurrentRoom();
    if (currentUser && currentRoom) {
      navigate('/dashboard');
      return;
    }
    const loadRoommates = async () => {
      if (!defaultRoomId) return;
      try {
        const list = await storage.getRoommates(defaultRoomId);
        setRoommates(list);
      } catch (error) {
        console.error(error);
      }
    };
    loadRoommates();
  }, [navigate, defaultRoomId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await storage.authenticate(email, password);
      if (user.roomId) {
        await setSession(user.id, user.roomId);
      } else {
        storage.setCurrentUser(user.id);
        toast.warning('No room linked to this user. Please join a room.');
        await refreshSession();
      }
      toast.success(`Welcome back, ${user.name}`);
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid email or password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = async (roommate: Roommate) => {
    await setSession(roommate.id, roommate.roomId);
    toast.success(`Signed in as ${roommate.name}`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/60 to-primary/5">
      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <ShieldCheck className="h-4 w-4" />
            Secure roommate access
          </div>
          <h1 className="text-4xl font-bold text-foreground leading-tight">
            Sign in to manage shared expenses
          </h1>
          <p className="text-muted-foreground text-lg">
            Track spending, approvals, and analytics in one place.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              Manager approvals
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              Roommate visibility
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              Instant insights
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LogIn className="h-5 w-5 text-primary" />
                <CardTitle>Sign in</CardTitle>
              </div>
              <CardDescription>Enter your credentials to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                New here?{' '}
                <Link to="/signup" className="text-primary hover:underline">
                  Create an account
                </Link>
              </p>
            </CardContent>
          </Card>

          {roommates.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>Roommate quick sign-in</CardTitle>
                </div>
                <CardDescription>
                  Select a roommate from the default room (configure VITE_DEFAULT_ROOM_ID) to continue.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {roommates.map((roommate) => (
                  <Button
                    key={roommate.id}
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handleQuickSelect(roommate)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{roommate.name}</span>
                      {roommate.isManager && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          Manager
                        </span>
                      )}
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
