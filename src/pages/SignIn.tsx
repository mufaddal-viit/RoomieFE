import { useEffect, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage } from '@/lib/storage';
import { Roommate } from '@/lib/types';
import { toast } from 'sonner';
import { useSession } from '@/contexts/SessionContext';
import { ShineBorder } from '@/components/ui/shine-border';

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

  const handleSubmit = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const user = await storage.authenticate(email, password);
      let destination = '/dashboard';
      if (user.roomId) {
        await setSession(user.id, user.roomId);
      } else {
        storage.setCurrentUser(user.id);
        toast.warning('No room linked to this user. Please join a room.');
        await refreshSession();
        destination = '/room-setup';
      }
      toast.success(`Welcome back, ${user.name}`);
      navigate(destination);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid email or password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || loading) return;
    event.preventDefault();
    void handleSubmit();
  };

  const handleQuickSelect = async (roommate: Roommate) => {
    await setSession(roommate.id, roommate.roomId);
    toast.success(`Signed in as ${roommate.name}`);
    navigate('/dashboard');
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-background to-teal-50">
      <span
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-16 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 rounded-full bg-teal-300/25 blur-3xl"
      />
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center gap-6 px-4 py-10">
        <Card className="relative overflow-hidden border border-white/40 bg-background/80 shadow-[0_25px_60px_-35px_rgba(14,116,144,0.45)] backdrop-blur-xl">
          <ShineBorder shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']} borderWidth={3} duration={20} />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-teal-400/10"
          />
          <CardHeader className="relative z-10 space-y-3 text-center">
            <span className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500/10 px-3 py-2 text-sm font-medium text-sky-700">
              <ShieldCheck className="h-4 w-4" />
              Roomie Bill Buddy
            </span>
            <CardTitle className="font-serif text-2xl tracking-tight text-slate-900 sm:text-3xl">
              Welcome back
            </CardTitle>
            <CardDescription className="text-slate-600">
              Breeze through shared expenses with a clearer, calmer way to split bills.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            <section className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="email"
                autoCapitalize="none"
                placeholder="you@example.com"
                className="h-11 border-white/50 bg-white/70 text-slate-900 placeholder:text-slate-400"
                required
              />
            </section>
            <section className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
                placeholder="********"
                className="h-11 border-white/50 bg-white/70 text-slate-900 placeholder:text-slate-400"
                required
              />
            </section>
            <Button
              type="button"
              className="h-11 w-full bg-sky-600 text-white shadow-[0_14px_30px_-16px_rgba(2,132,199,0.7)] hover:bg-sky-500"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
            <p className="text-center text-sm text-slate-600">
              New here?{' '}
              <Link to="/signup" className="font-medium text-sky-700 hover:text-sky-900">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>

        {roommates.length > 0 && (
          <Card className="relative overflow-hidden border border-white/40 bg-background/70 backdrop-blur-lg">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-teal-400/10"
            />
            <CardHeader className="relative z-10 space-y-2">
              <span className="inline-flex items-center gap-2 text-slate-800">
                <Users className="h-5 w-5 text-sky-600" />
                <CardTitle className="text-lg">Quick sign-in</CardTitle>
              </span>
              <CardDescription className="text-slate-600">
                Choose a roommate from the default room.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3">
              {roommates.map((roommate) => (
                <Button
                  key={roommate.id}
                  variant="outline"
                  className="h-auto w-full justify-start border-sky-200/60 bg-white/60 py-3 text-slate-900 hover:border-sky-300 hover:bg-white/80"
                  onClick={() => handleQuickSelect(roommate)}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="font-medium">{roommate.name}</span>
                    {roommate.isManager && (
                      <span className="rounded bg-sky-600 px-2 py-0.5 text-xs text-white">
                        Manager
                      </span>
                    )}
                  </span>
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
};

export default SignIn;
