import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useSession } from '@/contexts/SessionContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Roommate } from '@/lib/types';

const Accounts = () => {
  const navigate = useNavigate();
  const { currentUser, roommates, roomId, loading } = useSession();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!currentUser || !roomId) {
      navigate('/');
    }
  }, [loading, currentUser, roomId, navigate]);

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
                  className={`flex w-full flex-col gap-2 rounded-xl border px-4 py-3 text-left transition hover:border-primary/40 hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between ${
                    isSelected ? 'border-primary/40 bg-primary/10' : 'border-muted/60 bg-muted/10'
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
                  <div className="rounded-lg border border-muted/60 bg-background/80 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Manager actions</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button type="button" variant="outline" disabled>
                        Edit member
                      </Button>
                      <Button type="button" variant="outline" disabled>
                        Remove member
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Member management actions are coming soon.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Accounts;
