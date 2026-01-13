import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { MonthPicker } from '@/components/ui/monthpicker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import SummaryTable from '@/components/SummaryTable';
import { storage } from '@/lib/storage';
import { Expense } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useSession } from '@/contexts/SessionContext';
import { Calendar as CalendarIcon } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { analyticsOverviewCards } from '@/config/analyticsOverviewCards';

const formatMoney = (value: number) => {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toFixed(2)}`;
};

const parseExpenseDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const sumExpenses = (items: Expense[]) => items.reduce((sum, exp) => sum + exp.amount, 0);

const formatOverviewValue = (format: string, value: number | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'N/A';
  switch (format) {
    case 'money':
      return formatMoney(value);
    case 'percent':
      return `${value.toFixed(1)}%`;
    default:
      return `${value}`;
  }
};



const Analytics = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { currentUser, roommates, roomId, loading } = useSession();
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const currentMonthDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);
  const [selectedMonth, setSelectedMonth] = useState<Date>(currentMonthDate);

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

  const approvedExpenses = expenses.filter(e => e.status === 'approved');
  const pendingExpenses = expenses.filter(e => e.status === 'pending');
  const rejectedExpenses = expenses.filter(e => e.status === 'rejected');

  const monthExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const date = parseExpenseDate(expense.date);
      return date ? getMonthKey(date) === getMonthKey(selectedMonth) : false;
    });
  }, [expenses, selectedMonth]);

  const monthApprovedExpenses = useMemo(
    () => monthExpenses.filter(expense => expense.status === 'approved'),
    [monthExpenses],
  );

  // Category breakdown
  const categoryTotals = monthApprovedExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({ category, amount }));

  // Person breakdown
  const personTotals = approvedExpenses.reduce((acc, exp) => {
    const name = exp.addedByName || 'Unknown';
    acc[name] = (acc[name] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedPersons = Object.entries(personTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([name, amount]) => ({ name, amount }));

  const contributorStats = useMemo(() => {
    const totals = monthApprovedExpenses.reduce((acc, exp) => {
      const name = exp.addedByName || 'Unknown';
      if (!acc[name]) {
        acc[name] = { name, purchases: 0, total: 0 };
      }
      acc[name].purchases += 1;
      acc[name].total += exp.amount;
      return acc;
    }, {} as Record<string, { name: string; purchases: number; total: number }>);

    return Object.values(totals).sort((a, b) => b.total - a.total);
  }, [monthApprovedExpenses]);

  const categoryRows = sortedCategories.map(({ category, amount }) => ({
    key: category,
    cells: [
      { content: category },
      { content: formatMoney(amount), className: 'text-right font-medium' },
    ],
  }));

  const contributorRows = contributorStats.map((contributor) => ({
    key: contributor.name,
    cells: [
      { content: contributor.name },
      { content: contributor.purchases, className: 'text-right' },
      { content: formatMoney(contributor.total), className: 'text-right font-medium' },
    ],
  }));

  const totalExpense = sumExpenses(approvedExpenses);
  const pendingTotal = sumExpenses(pendingExpenses);
  const rejectedTotal = sumExpenses(rejectedExpenses);
  const monthTotalExpense = sumExpenses(monthApprovedExpenses);
  const monthAvgExpense =
    monthApprovedExpenses.length > 0 ? monthTotalExpense / monthApprovedExpenses.length : 0;
  const monthPerPersonShare = roommates.length > 0 ? monthTotalExpense / roommates.length : 0;

  const monthApprovedAmounts = monthApprovedExpenses.map(expense => expense.amount).sort((a, b) => a - b);

  const now = new Date();
  const last7Start = new Date(now);
  last7Start.setDate(now.getDate() - 7);
  const last30Start = new Date(now);
  last30Start.setDate(now.getDate() - 30);
  const prev30Start = new Date(now);
  prev30Start.setDate(now.getDate() - 60);

  const last7Total = sumExpenses(
    approvedExpenses.filter(expense => {
      const date = parseExpenseDate(expense.date);
      return date ? date >= last7Start : false;
    }),
  );
  const last30Total = sumExpenses(
    approvedExpenses.filter(expense => {
      const date = parseExpenseDate(expense.date);
      return date ? date >= last30Start : false;
    }),
  );
  const prev30Total = sumExpenses(
    approvedExpenses.filter(expense => {
      const date = parseExpenseDate(expense.date);
      return date ? date >= prev30Start && date < last30Start : false;
    }),
  );

  const avgDaily7 = last7Total / 7;
  const projectedMonthly = avgDaily7 * 30;
  const last30Delta = last30Total - prev30Total;
  const last30DeltaPercent = prev30Total > 0 ? (last30Delta / prev30Total) * 100 : null;

  const approvalRate = monthExpenses.length > 0 ? (monthApprovedExpenses.length / monthExpenses.length) * 100 : 0;
  const topCategory = sortedCategories[0];
  const topContributor = sortedPersons[0];

  const categoryCounts = approvedExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostFrequentCategory = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0];

  const largestExpense = approvedExpenses.reduce<Expense | null>((max, exp) => {
    if (!max || exp.amount > max.amount) return exp;
    return max;
  }, null);

  const latestApprovedExpense = approvedExpenses.reduce<{ expense: Expense; date: Date } | null>((latest, exp) => {
    const date = parseExpenseDate(exp.date);
    if (!date) return latest;
    if (!latest || date > latest.date) return { expense: exp, date };
    return latest;
  }, null);

  const monthlyBuckets = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const label = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    return { key, label, total: 0 };
  });

  const monthlyLookup = new Map(monthlyBuckets.map(bucket => [bucket.key, bucket]));
  approvedExpenses.forEach(expense => {
    const date = parseExpenseDate(expense.date);
    if (!date) return;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = monthlyLookup.get(key);
    if (bucket) bucket.total += expense.amount;
  });

  const monthlyTrend = monthlyBuckets.map(bucket => ({
    month: bucket.label,
    total: Number(bucket.total.toFixed(2)),
  }));

  const categoryShareBase = sortedCategories.slice(0, 5);
  const otherCategoriesTotal = sortedCategories.slice(5).reduce((sum, item) => sum + item.amount, 0);
  const categoryShareData =
    otherCategoriesTotal > 0
      ? [...categoryShareBase, { category: 'Other', amount: otherCategoriesTotal }]
      : categoryShareBase;

  const overviewValues: Record<string, number> = {
    monthTotalExpense,
    monthAvgExpense,
    // monthMedianExpense,
    monthPerPersonShare,
    monthApprovedCount: monthApprovedExpenses.length,
    approvalRate,
  };

  if (!currentUser || loading || loadingExpenses) return null;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">Month</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn('h-9 w-[220px] justify-start text-left font-normal')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedMonth.toLocaleString('en-US', { month: 'short', year: 'numeric' })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <MonthPicker onMonthSelect={setSelectedMonth} selectedMonth={selectedMonth} />
            </PopoverContent>
          </Popover>
        </div>
        {/* <p className="text-xs text-muted-foreground">
          Filtering overview, categories, and contributors by the selected month.
        </p> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {analyticsOverviewCards.map((card) => (
            <div key={card.id}>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold">
                {formatOverviewValue(card.format, overviewValues[card.valueKey])}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <SummaryTable
              headers={[
                { label: 'Category' },
                { label: 'Total Spent', className: 'text-right' },
              ]}
              rows={categoryRows}
              emptyMessage="No approved expenses for this month."
            />
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="space-y-2">
            <CardTitle>Contributors</CardTitle>
            {/* <p className="text-sm text-muted-foreground">
              Purchases and totals for the selected month.
            </p> */}
          </CardHeader>
          <CardContent>
            <SummaryTable
              headers={[
                { label: 'Name' },
                { label: 'Purchases Made', className: 'text-right' },
                { label: 'Total Spent', className: 'text-right' },
              ]}
              rows={contributorRows}
              emptyMessage="No approved expenses for this month."
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Monthly Spend Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {approvedExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No approved expenses yet.</p>
            ) : (
              <ChartContainer
                config={{
                  total: { label: 'Total', color: 'hsl(var(--chart-1))' },
                }}
                className="h-60 w-full"
              >
                <LineChart data={monthlyTrend} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="var(--color-total)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Category Share</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryShareData.map(({ category, amount }) => {
              const percent = monthTotalExpense > 0 ? (amount / monthTotalExpense) * 100 : 0;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{category}</span>
                    <span className="font-medium">
                      {formatMoney(amount)} | {percent.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={percent} />
                </div>
              );
            })}
            {categoryShareData.length === 0 && (
              <p className="text-sm text-muted-foreground">No approved expenses for this month.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Spending Pace</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Last 7 Days</p>
              <p className="text-2xl font-bold">{formatMoney(last7Total)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Daily (7d)</p>
              <p className="text-2xl font-bold">{formatMoney(avgDaily7)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Projected 30d</p>
              <p className="text-2xl font-bold">{formatMoney(projectedMonthly)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">30d vs Prior 30d</p>
              <p
                className={`text-2xl font-bold ${
                  last30Delta === 0
                    ? ''
                    : last30Delta > 0
                      ? 'text-destructive'
                      : 'text-success'
                }`}
              >
                {last30Delta === 0 ? formatMoney(0) : `${last30Delta > 0 ? '+' : ''}${formatMoney(last30Delta)}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {last30DeltaPercent === null
                  ? 'No prior 30-day data'
                  : `${last30DeltaPercent > 0 ? '+' : ''}${last30DeltaPercent.toFixed(1)}% change`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-muted-foreground">Largest Expense</span>
              <span className="text-right font-medium">
                {largestExpense
                  ? `${largestExpense.description} (${formatMoney(largestExpense.amount)})`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-muted-foreground">Top Category</span>
              <span className="text-right font-medium">
                {topCategory ? `${topCategory.category} (${formatMoney(topCategory.amount)})` : 'N/A'}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-muted-foreground">Most Frequent Category</span>
              <span className="text-right font-medium">{mostFrequentCategory || 'N/A'}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-muted-foreground">Top Contributor</span>
              <span className="text-right font-medium">
                {topContributor ? `${topContributor.name} (${formatMoney(topContributor.amount)})` : 'N/A'}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-muted-foreground">Latest Approved</span>
              <span className="text-right font-medium">
                {latestApprovedExpense
                  ? `${latestApprovedExpense.expense.description} (${latestApprovedExpense.date.toLocaleDateString()})`
                  : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Approved</span>
            <span className="font-medium">
              {approvedExpenses.length} | {formatMoney(totalExpense)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Pending</span>
            <span className="font-medium">
              {pendingExpenses.length} | {formatMoney(pendingTotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Rejected</span>
            <span className="font-medium">
              {rejectedExpenses.length} | {formatMoney(rejectedTotal)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
