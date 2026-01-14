import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from '@/contexts/SessionContext';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

const RoomSetup = () => {
  const navigate = useNavigate();
  const { setSession, currentUser } = useSession();
  const [joinOpen, setJoinOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const currentUserId = storage.getCurrentUser();
    const currentRoomId = storage.getCurrentRoom();
    if (!currentUserId) {
      navigate('/');
      return;
    }
    if (currentRoomId) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    const code = inviteCode.trim();
    if (!code) {
      toast.error('Enter a room invite code');
      return;
    }
    const currentUserId = storage.getCurrentUser();
    if (!currentUserId) {
      navigate('/');
      return;
    }

    try {
      setJoining(true);
      const room = await storage.joinRoom(code);
      await setSession(currentUserId, room.id);
      if (!storage.getCurrentRoom()) {
        toast.error('Could not join this room. Please try again.');
        return;
      }
      toast.success('Joined room');
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to join room';
      toast.error(message);
    } finally {
      setJoining(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const name = roomName.trim();
    if (!name) {
      toast.error('Enter a room name');
      return;
    }
    const currentUserId = storage.getCurrentUser();
    if (!currentUserId) {
      navigate('/');
      return;
    }

    try {
      setCreating(true);
      const room = await storage.createRoom(name);
      await setSession(currentUserId, room.id);
      if (!storage.getCurrentRoom()) {
        toast.error('Could not finish room setup. Please try again.');
        return;
      }
      toast.success('Room created');
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create room';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Layout
      title="Room setup"
      subtitle="You're signed in, but not part of a room yet."
      actions={null}
      contentClassName="max-w-4xl space-y-6"
      userName={currentUser?.name}
      isManager={!!currentUser?.isManager}
    >
      <Card>
        <CardHeader>
          <CardTitle>You're almost ready</CardTitle>
          <CardDescription>
            To start tracking expenses, you need to join a room or be added by a roommate.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="space-y-2">
            <p className="font-medium text-foreground">Join an existing room</p>
            <p>Use an invite code from a roommate or manager.</p>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">Create a new room</p>
            <p>Start a fresh room and invite your roommates.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 items-start">
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Join existing room</CardTitle>
            <CardDescription>Enter your invite code to get access.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between"
              aria-controls="join-room-panel"
              aria-expanded={joinOpen}
              onClick={() => {
                setJoinOpen(prev => !prev);
                setCreateOpen(false);
              }}
            >
              Join a room
              <ChevronDown
                className={`h-4 w-4 transition-transform ${joinOpen ? 'rotate-180' : ''}`}
              />
            </Button>
            <div
              id="join-room-panel"
              className={`overflow-hidden motion-safe:transition-[max-height,opacity,transform] motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none motion-reduce:translate-y-0 ${
                joinOpen ? 'max-h-64 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
              }`}
              aria-hidden={!joinOpen}
            >
              <form onSubmit={handleJoin} className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite code</Label>
                  <Input
                    id="inviteCode"
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value)}
                    placeholder="ROOM-ABC123"
                    disabled={!joinOpen || joining}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={joining}>
                  {joining ? 'Joining...' : 'Join room'}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>Create a new room</CardTitle>
            <CardDescription>Set up a new room and invite roommates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between"
              aria-controls="create-room-panel"
              aria-expanded={createOpen}
              onClick={() => {
                setCreateOpen(prev => !prev);
                setJoinOpen(false);
              }}
            >
              Create a room
              <ChevronDown
                className={`h-4 w-4 transition-transform ${createOpen ? 'rotate-180' : ''}`}
              />
            </Button>
            <div
              id="create-room-panel"
              className={`overflow-hidden motion-safe:transition-[max-height,opacity,transform] motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none motion-reduce:translate-y-0 ${
                createOpen ? 'max-h-64 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
              }`}
              aria-hidden={!createOpen}
            >
              <form onSubmit={handleCreate} className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="roomName">Room name</Label>
                  <Input
                    id="roomName"
                    value={roomName}
                    onChange={e => setRoomName(e.target.value)}
                    placeholder="Main Apartment"
                    disabled={!createOpen || creating}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? 'Creating...' : 'Create room'}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RoomSetup;
