import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSession } from '@/contexts/SessionContext';
import { storage } from '@/lib/storage';
import type { Expense } from '@/lib/types';

const formatMoney = (value: number) => {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toFixed(2)}`;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const OneToOne = () => {
  const navigate = useNavigate();
  const { currentUser, loading, roomId, roommates } = useSession();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [selectedRoommateId, setSelectedRoommateId] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!currentUser || !roomId) {
      navigate('/');
      return;
    }

    const loadExpenses = async () => {
      try {
        setLoadingExpenses(true);
        const roomExpenses = await storage.getExpenses(roomId);
        setExpenses(roomExpenses);
      } catch (error) {
        console.error(error);
        navigate('/');
      } finally {
        setLoadingExpenses(false);
      }
    };

    loadExpenses();
  }, [loading, currentUser, roomId, navigate]);

  useEffect(() => {
    if (roommates.length === 0) return;
    if (!currentUser) return;
    const fallback = roommates.find(roommate => roommate.id !== currentUser.id);
    if (!selectedRoommateId && fallback) {
      setSelectedRoommateId(fallback.id);
    }
  }, [roommates, currentUser, selectedRoommateId]);

  const approvedExpenses = useMemo(
    () => expenses.filter(expense => expense.status === 'approved'),
    [expenses],
  );

  const otherRoommates = useMemo(
    () => roommates.filter(roommate => roommate.id !== currentUser?.id),
    [roommates, currentUser],
  );
  const selectedRoommate = otherRoommates.find(roommate => roommate.id === selectedRoommateId) ?? null;

  const currentUserTotal = useMemo(() => {
    if (!currentUser || !selectedRoommateId) return 0;
    return approvedExpenses
      .filter(expense => expense.addedById === currentUser.id)
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [approvedExpenses, currentUser, selectedRoommateId]);

  const selectedRoommateTotal = useMemo(() => {
    if (!selectedRoommateId) return 0;
    return approvedExpenses
      .filter(expense => expense.addedById === selectedRoommateId)
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [approvedExpenses, selectedRoommateId]);

  const sharedExpenses = useMemo(() => {
    if (!currentUser || !selectedRoommateId) return [];
    return approvedExpenses.filter(expense =>
      expense.addedById === currentUser.id || expense.addedById === selectedRoommateId,
    );
  }, [approvedExpenses, currentUser, selectedRoommateId]);

  const balance = currentUserTotal - selectedRoommateTotal;
  const comparisonMessage =
    !selectedRoommate
      ? 'Select a roommate to compare your approved expenses.'
      : balance === 0
        ? 'Both roommates have spent the same amount.'
        : balance > 0
          ? `You spent ${formatMoney(balance)} more than ${selectedRoommate.name}.`
          : `${selectedRoommate.name} spent ${formatMoney(Math.abs(balance))} more than you.`;

  if (!currentUser || loading || loadingExpenses) return null;

  return (
    <Layout
      title="One-to-One Expenses"
      subtitle="Compare your approved expenses with another roommate"
      userName={currentUser.name}
      isManager={!!currentUser.isManager}
      contentClassName="max-w-6xl space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Comparison</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="rounded-md border px-3 py-2 text-sm font-medium">
              {currentUser.name}
            </div>
          </div>
          <div className="space-y-2">
            <Select value={selectedRoommateId} onValueChange={setSelectedRoommateId}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select roommate" />
              </SelectTrigger>
              <SelectContent>
                {otherRoommates.map(roommate => (
                  <SelectItem key={roommate.id} value={roommate.id}>
                    {roommate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground md:col-span-2">{comparisonMessage}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Your Approved Spend"
          value={formatMoney(currentUserTotal)}
          description="Total you logged"
        />
        <StatsCard
          title={selectedRoommate ? `${selectedRoommate.name} Spend` : 'Roommate Spend'}
          value={formatMoney(selectedRoommateTotal)}
          description="Total they logged"
        />
        <StatsCard
          title="Balance"
          value={selectedRoommate ? formatMoney(Math.abs(balance)) : '$0.00'}
          description={selectedRoommate ? (balance >= 0 ? 'You should receive' : 'You should pay') : 'Select a roommate'}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Shared Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sharedExpenses.slice(0, 6).map(expense => (
            <div key={expense.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div>
                <p className="font-medium">{expense.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(expense.date)} | {expense.addedByName || 'Unknown'}
                </p>
              </div>
              <p className="font-medium">{formatMoney(expense.amount)}</p>
            </div>
          ))}
          {selectedRoommate && sharedExpenses.length === 0 && (
            <p className="text-sm text-muted-foreground">No approved expenses between you yet.</p>
          )}
          {!selectedRoommate && (
            <p className="text-sm text-muted-foreground">Select a roommate to see shared expenses.</p>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default OneToOne;
