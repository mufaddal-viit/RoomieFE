import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import Layout from '@/components/layout/Layout';
import { useSession } from '@/contexts/SessionContext';
import { api } from '@/lib/api';
import { BankSummary, ContributionPeriod } from '@/lib/types';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import SummaryTable from '@/components/SummaryTable';
import { MonthPicker } from '@/components/ui/monthpicker';
import StatsCard from '@/components/StatsCard';

const formatMoney = (value: number) => {
  const sign = value < 0 ? '-' : '';
  return `AED ${sign}${Math.abs(value).toFixed(2)}`;
};

const getMonthName = (month: number) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return monthNames[month - 1] || '';
};

const Contributions = () => {
  const navigate = useNavigate();
  const { currentUser, roomId, loading } = useSession();
  const [bankSummary, setBankSummary] = useState<BankSummary | null>(null);
  const [periods, setPeriods] = useState<ContributionPeriod[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [creatingPeriod, setCreatingPeriod] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);

  // Create Period Dialog State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [periodAmount, setPeriodAmount] = useState('');

  // Edit Payment Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editPaymentData, setEditPaymentData] = useState<{
    periodId: string;
    roommateId: string;
    roommateNameEmail: string;
    currentAmount: number;
  } | null>(null);
  const [editPaymentAmount, setEditPaymentAmount] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!currentUser || !roomId) {
      navigate('/');
      return;
    }
    if (!currentUser.isManager) {
      navigate('/dashboard');
      return;
    }

    loadData();
  }, [loading, currentUser, roomId, navigate]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [summary, periodsList] = await Promise.all([
        api.contributions.getBankSummary(roomId!),
        api.contributions.listPeriods(roomId!),
      ]);
      setBankSummary(summary);
      setPeriods(periodsList);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load bank data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreatePeriod = async () => {
    if (!periodAmount.trim() || !selectedMonth) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = Number.parseFloat(periodAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error('Amount must be a positive number');
      return;
    }

    try {
      setCreatingPeriod(true);
      await api.contributions.createPeriod({
        roomId: roomId!,
        month: selectedMonth.getMonth() + 1,
        year: selectedMonth.getFullYear(),
        amountPerPerson: amount,
      });

      toast.success('Period created successfully');
      setPeriodAmount('');
      setCreateDialogOpen(false);
      await loadData();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to create period';
      toast.error(msg);
    } finally {
      setCreatingPeriod(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (!editPaymentData || !editPaymentAmount.trim()) {
      toast.error('Please enter an amount');
      return;
    }

    const amount = Number.parseFloat(editPaymentAmount);
    if (Number.isNaN(amount) || amount < 0) {
      toast.error('Amount must be >= 0');
      return;
    }

    try {
      setUpdatingPayment(`${editPaymentData.periodId}-${editPaymentData.roommateId}`);
      await api.contributions.updatePayment({
        roomId: roomId!,
        periodId: editPaymentData.periodId,
        roommateId: editPaymentData.roommateId,
        amountPaid: amount,
      });

      toast.success('Payment updated successfully');
      setEditDialogOpen(false);
      setEditPaymentData(null);
      setEditPaymentAmount('');
      await loadData();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to update payment';
      toast.error(msg);
    } finally {
      setUpdatingPayment(null);
    }
  };

  const openEditPaymentDialog = (
    periodId: string,
    roommateId: string,
    roommateNameEmail: string,
    currentAmount: number
  ) => {
    setEditPaymentData({
      periodId,
      roommateId,
      roommateNameEmail,
      currentAmount,
    });
    setEditPaymentAmount(currentAmount.toString());
    setEditDialogOpen(true);
  };

  if (!currentUser || !roomId || loading || loadingData) {
    return (
      <Layout
        title="Room Bank"
        subtitle="Loading..."
        userName={currentUser?.name}
        isManager={!!currentUser?.isManager}
        contentClassName="space-y-6"
      >
        <div className="flex justify-center">
          <Spinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Room Bank"
      subtitle="Contribution Management"
      userName={currentUser.name}
      isManager
      contentClassName="space-y-6"
    >
      {/* Bank Summary Cards */}
      {bankSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Bank Balance"
            value={formatMoney(bankSummary.bankBalance)}
            description={bankSummary.bankBalance >= 0 ? 'Surplus' : 'Deficit'}
          />
          <StatsCard
            title="Total Contributed"
            value={formatMoney(bankSummary.totalContributed)}
            description="All payments"
          />
          <StatsCard
            title="Total Spent"
            value={formatMoney(bankSummary.totalSpent)}
            description="Approved expenses"
          />
          <StatsCard
            title="Profit / Loss"
            value={formatMoney(bankSummary.profitLoss)}
            description={bankSummary.profitLoss >= 0 ? 'In green' : 'Over budget'}
          />
        </div>
      )}

      {/* Create Period Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Contribution Period
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Contribution Period</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Month</Label>
              <MonthPicker selectedMonth={selectedMonth} onMonthSelect={setSelectedMonth} />
            </div>
            <div>
              <Label htmlFor="amount">Amount per Person (AED)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={periodAmount}
                onChange={e => setPeriodAmount(e.target.value)}
                placeholder="1000"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  setPeriodAmount('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePeriod} disabled={creatingPeriod}>
                {creatingPeriod ? <Spinner className="h-4 w-4" /> : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment</DialogTitle>
          </DialogHeader>
          {editPaymentData && (
            <div className="space-y-4">
              <div>
                <Label>Member</Label>
                <p className="text-sm text-muted-foreground">{editPaymentData.roommateNameEmail}</p>
              </div>
              <div>
                <Label>Amount Paid (AED)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editPaymentAmount}
                  onChange={e => setEditPaymentAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false);
                    setEditPaymentData(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdatePayment}
                  disabled={updatingPayment === `${editPaymentData.periodId}-${editPaymentData.roommateId}`}
                >
                  {updatingPayment === `${editPaymentData.periodId}-${editPaymentData.roommateId}` ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    'Update'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Periods List */}
      {periods.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No contribution periods yet. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {periods.map(period => {
            const periodTotal = period.contributions.reduce((sum, c) => sum + c.amountPaid, 0);
            const expectedTotal = period.amountPerPerson * (period.contributions.length || 0);
            const shortfall = expectedTotal - periodTotal;

            return (
              <Card key={period.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {getMonthName(period.month)} {period.year} — AED {period.amountPerPerson.toFixed(2)}/person
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Expected</p>
                      <p className="font-semibold">{formatMoney(expectedTotal)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Collected</p>
                      <p className="font-semibold">{formatMoney(periodTotal)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Shortfall</p>
                      <p className={`font-semibold ${shortfall > 0 ? 'text-destructive' : 'text-green-600'}`}>
                        {formatMoney(shortfall)}
                      </p>
                    </div>
                  </div>

                  <SummaryTable
                    headers={[
                      { label: 'Member' },
                      { label: 'Owed', className: 'text-right' },
                      { label: 'Paid', className: 'text-right' },
                      { label: 'Outstanding', className: 'text-right' },
                      { label: '', className: 'text-right' },
                    ]}
                    rows={period.contributions.map(c => {
                      const owed = period.amountPerPerson;
                      const paid = c.amountPaid;
                      const outstanding = Math.max(0, owed - paid);
                      const roommateNameEmail = `${c.roommate?.name || 'Unknown'} (${c.roommate?.email || 'N/A'})`;

                      return {
                        key: c.roommateId,
                        cells: [
                          { content: c.roommate?.name || 'Unknown' },
                          { content: formatMoney(owed), className: 'text-right' },
                          { content: formatMoney(paid), className: 'text-right' },
                          {
                            content: formatMoney(outstanding),
                            className: outstanding > 0 ? 'text-right text-destructive font-medium' : 'text-right',
                          },
                          {
                            content: (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditPaymentDialog(period.id, c.roommateId, roommateNameEmail, paid)}
                              >
                                Edit
                              </Button>
                            ),
                            className: 'text-right',
                          },
                        ],
                      };
                    })}
                    emptyMessage="No contributions recorded yet."
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default Contributions;
