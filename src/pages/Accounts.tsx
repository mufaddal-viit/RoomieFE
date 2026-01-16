import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useSession } from '@/contexts/SessionContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Room, Roommate } from '@/lib/types';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Calendar,
  Check,
  Copy,
  Hash,
  Lock,
  LogOut,
  Pencil,
  UserMinus,
  UserRound,
  Users,
} from 'lucide-react';

const Accounts = () => {
  const navigate = useNavigate();
  const { currentUser, roommates, roomId, loading, refreshSession } = useSession();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [leavingRoom, setLeavingRoom] = useState(false);
  const [roomDetails, setRoomDetails] = useState<Room | null>(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

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

  const parseDateValue = (value?: string | Date) => {
    if (!value) return null;
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  };

  const formatDate = (value?: string | Date) => {
    const parsed = parseDateValue(value);
    if (!parsed) return 'Unknown';
    return parsed.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysInRoom = (createdAt?: string | Date) => {
    const joinedAt = parseDateValue(createdAt);
    if (!joinedAt) return null;
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.ceil((now.getTime() - joinedAt.getTime()) / msPerDay);
    return Math.max(1, days);
  };

  const selectedUser = useMemo<Roommate | null>(() => {
    return sortedRoommates.find((roommate) => roommate.id === selectedUserId) ?? null;
  }, [sortedRoommates, selectedUserId]);

  useEffect(() => {
    if (!selectedUserId && currentUser) {
      setSelectedUserId(currentUser.id);
    }
  }, [currentUser, selectedUserId]);

  useEffect(() => {
    if (!roomId) {
      setRoomDetails(null);
      return;
    }

    let isMounted = true;
    setRoomDetails(null);
    setRoomLoading(true);
    storage
      .getRoom(roomId)
      .then((room) => {
        if (isMounted) {
          setRoomDetails(room);
        }
      })
      .catch((error) => {
        console.error('Failed to load room details', error);
        if (isMounted) {
          setRoomDetails(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setRoomLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  useEffect(() => {
    if (!inviteCopied) return;
    const timer = window.setTimeout(() => {
      setInviteCopied(false);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [inviteCopied]);

  const roomCreator = useMemo(() => {
    const withDates = roommates
      .map((roommate) => ({
        roommate,
        createdAt: parseDateValue(roommate.createdAt),
      }))
      .filter((entry) => entry.createdAt !== null);

    const pickEarliest = (
      entries: Array<{ roommate: Roommate; createdAt: Date | null }>,
    ): Roommate | null => {
      if (entries.length === 0) return null;
      const sorted = [...entries].sort((a, b) => {
        return (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0);
      });
      return sorted[0]?.roommate ?? null;
    };

    const managerCreator = pickEarliest(withDates.filter((entry) => entry.roommate.isManager));
    if (managerCreator) return managerCreator;
    const earliestCreator = pickEarliest(withDates);
    if (earliestCreator) return earliestCreator;
    return sortedRoommates.find((roommate) => roommate.isManager) ?? currentUser ?? null;
  }, [roommates, sortedRoommates, currentUser]);

  const handleCopyInviteCode = async () => {
    const code = roomDetails?.inviteCode;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setInviteCopied(true);
      toast.success('Invite code copied');
    } catch (error) {
      console.error('Failed to copy invite code', error);
      toast.error('Unable to copy invite code');
    }
  };

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

  const memberSummary = selectedUser
    ? (() => {
      const memberSince = formatDate(selectedUser.createdAt);
      const daysInRoom = getDaysInRoom(selectedUser.createdAt);
      const dayLabel = daysInRoom === 1 ? 'Day' : 'Days';
      return `Member since ${memberSince}${daysInRoom ? ` (${daysInRoom} ${dayLabel})` : ''}`;
    })()
    : 'Select a member to view more details.';

  return (
    <Layout
      title="Accounts"
      subtitle="Manage the room, review members, and keep your account up to date."
      userName={currentUser.name}
      isManager={!!currentUser.isManager}
      contentClassName="max-w-5xl space-y-6"
    >
      <TooltipProvider>
        <div className="grid gap-4 lg:grid-cols-[1.1fr,1.4fr]">
          <Card className="border-muted/60 shadow-sm">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  Room members
                </CardTitle>
                <CardDescription>{roommates.length} total members</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[620px] pr-3">
                <div className="space-y-3">
                  {sortedRoommates.map((roommate) => {
                    const isCurrent = roommate.id === currentUser.id;
                    const roleLabel = roommate.isManager ? 'Manager' : 'Roommate';
                    const isSelected = roommate.id === selectedUserId;
                    return (
                      <button
                        type="button"
                        key={roommate.id}
                        onClick={() => setSelectedUserId(roommate.id)}
                        className={`flex w-full flex-col gap-2 rounded-xl border px-4 py-3 text-left transition hover:border-primary/40 hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between ${isSelected
                          ? 'border-primary/40 bg-primary/10'
                          : 'border-muted/60 bg-muted/10'
                          }`}
                        aria-pressed={isSelected}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs font-semibold">
                              {getInitials(roommate.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {roommate.name}
                              {isCurrent && (
                                <span className="text-xs text-muted-foreground"> (You)</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {roommate.email || `${roleLabel} account`}
                            </p>
                          </div>
                        </div>
                        {/* <Badge variant={roommate.isManager ? 'default' : 'secondary'}>
                          {roleLabel}
                        </Badge> */}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-muted/60 bg-gradient-to-br from-muted/40 via-background to-background shadow-sm">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Room overview</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {roomLoading && !roomDetails ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-muted/60 dark:bg-gray-800 p-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        Created
                      </div>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {formatDate(roomDetails?.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-muted/60 dark:bg-gray-800 p-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <UserRound className="h-3.5 w-3.5" />
                        Created by
                      </div>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {roomCreator?.name ?? 'Unknown'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-muted/60 dark:bg-gray-800 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-medium text-muted-foreground">Invite code</div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 hover:text-red-900"
                              onClick={handleCopyInviteCode}
                              disabled={!roomDetails?.inviteCode}
                            >
                              {inviteCopied ? (
                                <Check className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                              <span className="sr-only">Copy invite code</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {inviteCopied ? 'Copied' : 'Copy to clipboard'}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="mt-1 font-mono text-sm font-semibold text-foreground">
                        {roomDetails?.inviteCode ?? 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-muted/60 bg-gradient-to-br from-muted/20 via-background to-background">
              <CardHeader>
                <CardTitle>Member details</CardTitle>
                <CardDescription>{memberSummary}</CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedUser ? (
                  <div className="rounded-xl border border-dashed border-muted/60 bg-muted/10 p-6 text-sm text-muted-foreground">
                    Select a member from the list to view details.
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
                          <p className="text-lg font-semibold text-foreground">
                            {selectedUser.name}
                          </p>
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

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-muted/60 bg-background/80 p-3">
                        <p className="text-xs font-medium text-muted-foreground">Member since</p>
                        <p className="text-sm font-semibold text-foreground">
                          {formatDate(selectedUser.createdAt)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-muted/60 bg-background/80 p-3">
                        <p className="text-xs font-medium text-muted-foreground">Days in room</p>
                        <p className="text-sm font-semibold text-foreground">
                          {getDaysInRoom(selectedUser.createdAt) ?? 'N/A'}
                        </p>
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
                              Manage this member's access and status.
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
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                          <AlertTriangle className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold leading-none text-destructive">
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
                        className="w-full gap-2 sm:w-auto"
                        onClick={handleLeaveRoom}
                        disabled={leavingRoom}
                      >
                        <LogOut className="h-4 w-4" />
                        {leavingRoom ? 'Leaving room...' : 'Leave room'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </TooltipProvider>
    </Layout>
  );
};

export default Accounts;
