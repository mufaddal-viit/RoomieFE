import { useEffect, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';
import { ShineBorder } from '@/components/ui/shine-border';
import { SlideSubmitButton } from '@/components/ui/slide-submit-button';

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
    }
  }, [navigate]);

  const handleSubmit = async () => {
    if (loading) return;

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

    const joinRoomInviteCode = roomIdToJoin.trim();
    const newRoomNameTrimmed = newRoomName.trim();

    if (showRoomOptions) {
      if (!joinRoomInviteCode && !newRoomNameTrimmed) {
        toast.error('Choose to join an existing room or create a new one');
        return;
      }

      if (joinRoomInviteCode && newRoomNameTrimmed) {
        toast.error('Choose either join or create, not both');
        return;
      }
    }

    try {
      setLoading(true);

      let roomPayload: { roomId?: string; inviteCode?: string } = {};

      if (showRoomOptions && newRoomNameTrimmed) {
        // CREATE ROOM FLOW
        const newRoom = await storage.createRoom(newRoomNameTrimmed);
        roomPayload.roomId = newRoom.id; // pass actual room.id for creation
      } else if (showRoomOptions && joinRoomInviteCode) {
        // JOIN ROOM FLOW
        roomPayload.inviteCode = joinRoomInviteCode; // pass invite code for joining
      }

      // CREATE ROOMMATE
      await storage.createRoommate({
        name: name.trim(),
        email: email.trim(),
        password,
        ...roomPayload,
      });

      // Authenticate user after creation
      const user = await storage.authenticate(email.trim(), password);
      storage.setCurrentUser(user.id);

      // Determine effective room
      const effectiveRoomId = user.roomId ?? roomPayload.roomId;
      if (effectiveRoomId) {
        storage.setCurrentRoom(effectiveRoomId);
      }

      const destination = effectiveRoomId ? '/dashboard' : '/room-setup';

      toast.success('Account created');
      navigate(destination);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create account';
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-background to-teal-50 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-700">
      <span
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 rounded-full bg-teal-300/25 blur-3xl"
      />
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-12 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-6 motion-safe:duration-700">
        <section className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.05fr,1fr]">
          <section className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-sm font-medium text-sky-700">
              <Shield className="h-4 w-4" />
              New to Roomie Bill Buddy
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
              Start your calmest roommate budget yet.
            </h1>
            <p className="text-lg text-slate-600">
              Create an account, then decide whether to join an existing room or start a new
              one.
            </p>
          </section>

          <Card className="relative overflow-hidden border border-white/40 bg-background/80 shadow-[0_25px_60px_-35px_rgba(14,116,144,0.45)] backdrop-blur-xl">
            <ShineBorder shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']} borderWidth={3} />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-teal-400/10"
            />
            <CardHeader className="relative z-10 space-y-3 text-center">
              <span className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500/10 px-3 py-2 text-sm font-medium text-sky-700">
                <UserPlus className="h-4 w-4" />
                Sign up
              </span>
              <CardTitle className="font-serif text-2xl tracking-tight text-slate-900 sm:text-3xl">
                Create your account
              </CardTitle>
              <CardDescription className="text-slate-600">
                Set up your profile to join the expense tracker.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <section className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">
                  Full name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="name"
                  placeholder="Alex Johnson"
                  className="h-11 border-white/50 bg-white/70 text-slate-900 placeholder:text-slate-400"
                  required
                />
              </section>
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

              <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    autoComplete="new-password"
                    placeholder="********"
                    className="h-11 border-white/50 bg-white/70 text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </section>
                <section className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700">
                    Confirm password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoComplete="new-password"
                    placeholder="********"
                    className="h-11 border-white/50 bg-white/70 text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </section>
              </section>

              <section className="flex items-center space-x-2">
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
                <Label htmlFor="roomOptions" className="text-slate-700">
                  I want to join or create a room now
                </Label>
              </section>

              <section
                id="room-options-panel"
                className={`overflow-hidden motion-safe:transition-[max-height,opacity,transform] motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none motion-reduce:translate-y-0 ${showRoomOptions
                  ? 'max-h-[520px] opacity-100 translate-y-0'
                  : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
                  }`}
                aria-hidden={!showRoomOptions}
              >
                <section className="grid grid-cols-1 gap-4 rounded-lg border border-sky-100/70 bg-sky-50/50 p-4 md:grid-cols-2">
                  <section className="space-y-2">
                    <Label htmlFor="roomIdToJoin" className="text-slate-700">
                      Join existing room (ID)
                    </Label>
                    <Input
                      id="roomIdToJoin"
                      value={roomIdToJoin}
                      onChange={e => setRoomIdToJoin(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter Room ID"
                      className="h-11 border-white/50 bg-white/70 text-slate-900 placeholder:text-slate-400"
                      disabled={!showRoomOptions}
                    />
                  </section>
                  <section className="space-y-2">
                    <Label htmlFor="newRoomName" className="text-slate-700">
                      Create a new room
                    </Label>
                    <Input
                      id="newRoomName"
                      value={newRoomName}
                      onChange={e => setNewRoomName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Room name"
                      className="h-11 border-white/50 bg-white/70 text-slate-900 placeholder:text-slate-400"
                      disabled={!showRoomOptions}
                    />
                  </section>
                  <p className="text-xs text-slate-500 md:col-span-2">
                    Choose one option to continue.
                  </p>
                </section>
              </section>
              <SlideSubmitButton
                onComplete={handleSubmit}
                loading={loading}
                label="Slide to create account"
                loadingLabel="Creating account..."
              />

              <p className="text-center text-sm text-slate-600">
                Already registered?{' '}
                <Link to="/" className="font-medium text-sky-700 hover:text-sky-900">
                  Sign in instead
                </Link>
              </p>
            </CardContent>
          </Card>
        </section>
      </section>
    </main>
  );
};

export default SignUp;
