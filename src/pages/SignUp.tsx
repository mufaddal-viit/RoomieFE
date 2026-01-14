import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [showRoomOptions, setShowRoomOptions] = useState(false);
  const [roomIdToJoin, setRoomIdToJoin] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
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

    const joinRoomId = roomIdToJoin.trim();
    const createRoomName = newRoomName.trim();

    if (showRoomOptions) {
      if (!joinRoomId && !createRoomName) {
        toast.error('Choose to join an existing room or create a new one');
        return;
      }
      if (joinRoomId && createRoomName) {
        toast.error('Choose either join or create, not both');
        return;
      }
    }

    try {
      setLoading(true);
      let targetRoomId = '';
      if (showRoomOptions && createRoomName) {
        const newRoom = await storage.createRoom(createRoomName);
        targetRoomId = newRoom.id;
      } else if (showRoomOptions && joinRoomId) {
        targetRoomId = joinRoomId;
      }

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
      const destination = targetRoomId || user.roomId ? '/dashboard' : '/room-setup';
      toast.success('Account created');
      navigate(destination);
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
            Get started with Roomie Bill Buddy. You can join or create a room when you sign up.
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="roomOptions"
                  checked={showRoomOptions}
                  aria-controls="room-options-panel"
                  aria-expanded={showRoomOptions}
                  onCheckedChange={checked => {
                    const isChecked = checked === true;
                    setShowRoomOptions(isChecked);
                    if (!isChecked) {
                      setRoomIdToJoin('');
                      setNewRoomName('');
                    }
                  }}
                />
                <Label htmlFor="roomOptions">I want to join or create a room now</Label>
              </div>

              <div
                id="room-options-panel"
                className={`overflow-hidden motion-safe:transition-[max-height,opacity,transform] motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none motion-reduce:translate-y-0 ${
                  showRoomOptions
                    ? 'max-h-[520px] opacity-100 translate-y-0'
                    : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
                }`}
                aria-hidden={!showRoomOptions}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-border/60 bg-muted/30 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomIdToJoin">Join existing room (ID)</Label>
                    <Input
                      id="roomIdToJoin"
                      value={roomIdToJoin}
                      onChange={e => setRoomIdToJoin(e.target.value)}
                      placeholder="Enter Room ID"
                      disabled={!showRoomOptions}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newRoomName">Create a new room</Label>
                    <Input
                      id="newRoomName"
                      value={newRoomName}
                      onChange={e => setNewRoomName(e.target.value)}
                      placeholder="Room Name"
                      disabled={!showRoomOptions}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground md:col-span-2">
                    Choose one option to continue.
                  </p>
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
