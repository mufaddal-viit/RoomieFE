import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useSession } from '@/contexts/SessionContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Roommate } from '@/lib/types';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { Pencil, UserMinus, Lock } from "lucide-react";
import { AlertTriangle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
const Accounts = () => {
  const navigate = useNavigate();
  const { currentUser, roommates, roomId, loading, refreshSession } = useSession();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [leavingRoom, setLeavingRoom] = useState(false);

  useEffect(() => {
    if (loading || leavingRoom) return;
    if (!currentUser || !roomId) {
      navigate('/');
    }
  }, [loading, leavingRoom, currentUser, roomId, navigate]);

  const sortedRoommates = useMemo(() => {
    return [...roommates].sort((a, b) => {
      if (a.isManager !== b.isManager) {
        return a.isManager ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [roommates]);

  const getInitials = (name: string) => {
    const [first, second] = name.split(' ');
    return `${first?.[0] ?? ''}${second?.[0] ?? ''}`.toUpperCase() || '?';
  };

  const formatMemberSince = (createdAt?: string | Date) => {
    if (!createdAt) return 'Unknown';
    const parsed = createdAt instanceof Date ? createdAt : new Date(createdAt);
    if (Number.isNaN(parsed.getTime())) return 'Unknown';
    return parsed.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysInRoom = (createdAt?: string | Date) => {
    if (!createdAt) return null;
    const joinedAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    if (Number.isNaN(joinedAt.getTime())) return null;
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.ceil((now.getTime() - joinedAt.getTime()) / msPerDay);
    return Math.max(1, days);
  };

  const selectedUser = useMemo<Roommate | null>(() => {
    return sortedRoommates.find(roommate => roommate.id === selectedUserId) ?? null;
  }, [sortedRoommates, selectedUserId]);

  useEffect(() => {
    if (!selectedUserId && currentUser) {
      setSelectedUserId(currentUser.id);
    }
  }, [currentUser, selectedUserId]);

  const handleLeaveRoom = async () => {
    if (!roomId) return;
    const confirmed = window.confirm(
      'Leave this room? You will need an invite code to join it again.',
    );
    if (!confirmed) return;
    setLeavingRoom(true);
    storage.clearCurrentRoom();
    await refreshSession();
    toast.success('You left the room');
    navigate('/room-setup');
  };

  if (!currentUser || loading) return null;

  return (
    <Layout
      title="Accounts"
      subtitle="Manage your profile and see who shares this room."
      userName={currentUser.name}
      isManager={!!currentUser.isManager}
      contentClassName="max-w-4xl space-y-6"
    >
      <div className="grid gap-4 lg:grid-cols-[1.1fr,1.4fr]">
        <Card className="border-muted/60">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Room members</CardTitle>
              <CardDescription>{roommates.length} total members</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedRoommates.map((roommate) => {
              const isCurrent = roommate.id === currentUser.id;
              const roleLabel = roommate.isManager ? 'Manager' : 'Roommate';
              const isSelected = roommate.id === selectedUserId;
              return (
                <button
                  type="button"
                  key={roommate.id}
                  onClick={() => setSelectedUserId(roommate.id)}
                  className={`flex w-full flex-col gap-2 rounded-xl border px-4 py-3 text-left transition hover:border-primary/40 hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between ${isSelected ? 'border-primary/40 bg-primary/10' : 'border-muted/60 bg-muted/10'
                    }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center gap-3 ">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs font-semibold">
                        {getInitials(roommate.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {roommate.name}
                        {isCurrent && <span className="text-xs text-muted-foreground"> (You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {roommate.email || `${roleLabel} account`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={roommate.isManager ? 'default' : 'secondary'}>{roleLabel}</Badge>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-muted/60 bg-gradient-to-br from-muted/30 via-background to-background">
          <CardHeader>
            <CardTitle>Member details</CardTitle>
            <CardDescription>
              {selectedUser ? (() => {
                const memberSince = formatMemberSince(selectedUser.createdAt);
                const daysInRoom = getDaysInRoom(selectedUser.createdAt);
                const dayLabel = daysInRoom === 1 ? 'Day' : 'Days';
                return `Member since ${memberSince}${daysInRoom ? ` (${daysInRoom} ${dayLabel})` : ''}`;
              })() : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedUser ? (
              <div className="rounded-xl border border-dashed border-muted/60 bg-muted/10 p-6 text-sm text-muted-foreground">
                Select a member from the left to view details.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-sm font-semibold">
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-foreground">{selectedUser.name}</p>
                      {selectedUser.id === currentUser.id && (
                        <Badge variant="secondary">You</Badge>
                      )}
                      <Badge variant={selectedUser.isManager ? 'default' : 'secondary'}>
                        {selectedUser.isManager ? 'Manager' : 'Roommate'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.email || 'No email on file'}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-muted/60 bg-background/80 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Room ID</p>
                    <p className="text-sm font-semibold text-foreground">{roomId}</p>
                  </div>
                  <div className="rounded-lg border border-muted/60 bg-background/80 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Account type</p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedUser.isManager ? 'Manager access' : 'Standard access'}
                    </p>
                  </div>
                </div>

                {currentUser.isManager && selectedUser.id !== currentUser.id && (
                  <div className="rounded-xl border border-muted/60 bg-background/70 p-4 shadow-sm backdrop-blur">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold leading-none">Manager actions</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Manage this member’s access and status.
                        </p>
                      </div>

                      <Badge variant="secondary" className="gap-1">
                        <Lock className="h-3.5 w-3.5" />
                        Coming soon
                      </Badge>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled
                        className="gap-2"
                        aria-disabled="true"
                        title="Coming soon"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit member
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        disabled
                        className="gap-2"
                        aria-disabled="true"
                        title="Coming soon"
                      >
                        <UserMinus className="h-4 w-4" />
                        Remove member
                      </Button>
                    </div>

                    <div className="mt-3 rounded-lg border border-dashed border-muted/70 bg-muted/30 px-3 py-2">
                      <p className="text-xs text-muted-foreground">
                        Member management actions are not available yet.
                      </p>
                    </div>
                  </div>
                )}



                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 dark:bg-destructive text-destructive">
                      <AlertTriangle className="h-4 w-4 dark:text-white" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold leading-none text-destructive dark:text-white">
                        Room actions
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Leaving will immediately remove this room from your current session.
                      </p>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full sm:w-auto gap-2"
                    onClick={handleLeaveRoom}
                    disabled={leavingRoom}
                  >
                    <LogOut className="h-4 w-4 " />
                    {leavingRoom ? "Leaving room…" : "Leave room"}
                  </Button>
                </div>

              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Accounts;
