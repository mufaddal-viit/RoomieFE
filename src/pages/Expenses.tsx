import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { MonthPicker } from '@/components/ui/monthpicker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { storage } from '@/lib/storage';
import type { Expense } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useSession } from '@/contexts/SessionContext';
import { Calendar as CalendarIcon, DollarSign, Sigma, TabletSmartphone } from 'lucide-react';

const formatMoney = (value: number) => {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toFixed(2)}`;
};

const parseExpenseDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value: string) => {
  const date = parseExpenseDate(value);
  return date ? date.toLocaleDateString() : value;
};

const getMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const Expenses = () => {
  const navigate = useNavigate();
  const { currentUser, loading, roomId, roommates } = useSession();
  const currentMonthDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);
  const currentMonthKey = useMemo(() => getMonthKey(currentMonthDate), [currentMonthDate]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [roommateFilter, setRoommateFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [descriptionFilter, setDescriptionFilter] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState<Date>(currentMonthDate);

  const handleMonthSelect = (value: Date) => {
    setMonthFilter(value);
  };

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

  const approvedExpenses = useMemo(
    () => expenses.filter(expense => expense.status === 'approved'),
    [expenses],
  );

  const roommateOptions = useMemo(() => {
    const names = [
      ...roommates.map(roommate => roommate.name),
      ...approvedExpenses.map(expense => expense.addedByName || 'Unknown'),
    ];
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [roommates, approvedExpenses]);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set(approvedExpenses.map(expense => expense.category))).sort((a, b) => a.localeCompare(b));
  }, [approvedExpenses]);

  const filteredExpenses = useMemo(() => {
    const normalizedDescription = descriptionFilter.trim().toLowerCase();
    const normalizedAmount = amountFilter.trim();
    return approvedExpenses.filter(expense => {
      const matchesRoommate =
        roommateFilter === 'all' || (expense.addedByName || 'Unknown') === roommateFilter;
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
      const matchesDescription =
        normalizedDescription.length === 0 ||
        expense.description.toLowerCase().includes(normalizedDescription);
      const matchesAmount =
        normalizedAmount.length === 0 || expense.amount.toFixed(2).includes(normalizedAmount);
      const expenseDate = parseExpenseDate(expense.date);
      const matchesMonth = expenseDate ? getMonthKey(expenseDate) === getMonthKey(monthFilter) : false;
      return matchesRoommate && matchesCategory && matchesDescription && matchesAmount && matchesMonth;
    });
  }, [approvedExpenses, roommateFilter, categoryFilter, descriptionFilter, amountFilter, monthFilter]);

  const filteredTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (!currentUser || loading || loadingExpenses) return null;

  return (
    <Layout
      title="All Expenses"
      subtitle="Full expense history"
      userName={currentUser.name}
      isManager={!!currentUser.isManager}
      contentClassName="max-w-6xl space-y-6"
    >
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Expense Table</CardTitle>
          {/* <p className="text-sm text-muted-foreground">
            Showing {filteredExpenses.length} of {approvedExpenses.length} approved expenses
          </p> */}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Month</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'h-9 w-[220px] justify-start text-left font-normal',
                      !monthFilter && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {monthFilter
                      ? monthFilter.toLocaleString('en-US', { month: 'short', year: 'numeric' })
                      : 'Pick a month'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <MonthPicker onMonthSelect={handleMonthSelect} selectedMonth={monthFilter} />
                </PopoverContent>
              </Popover>
            </div>
            {/* <p className="text-xs text-muted-foreground">
              {getMonthKey(monthFilter) === currentMonthKey
                ? 'Defaulting to the current month'
                : 'Filtering by selected month'}
            </p> */}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-auto py-3">
                  <div className="space-y-2">
                    <span>Date</span>
                    {/* <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-full min-w-[150px] justify-start text-left font-normal"
                        >
                          All dates
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="h-9 w-[220px]" />
                      </PopoverContent>
                    </Popover> */}
                  </div>
                </TableHead>
                <TableHead className="h-auto py-3">
                  <div className="space-y-2">
                    {/* <span>Description</span> */}
                    <Input
                      value={descriptionFilter}
                      onChange={(event) => setDescriptionFilter(event.target.value)}
                      placeholder="Descriptions"
                      className="h-8 min-w-[200px]"
                    />
                  </div>
                </TableHead>
                <TableHead className="h-auto py-3">
                  <div className="space-y-2">
                    {/* <span>Category</span> */}
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="h-8 min-w-[160px]">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categoryOptions.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TableHead>
                <TableHead className="h-auto py-3">
                  <div className="space-y-2">
                    {/* <span>Roommate</span> */}
                    <Select value={roommateFilter} onValueChange={setRoommateFilter}>
                      <SelectTrigger className="h-8 min-w-[160px]">
                        <SelectValue placeholder="Roommates" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Roommates</SelectItem>
                        {roommateOptions.map(name => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TableHead>
                <TableHead className="h-auto py-3 text-left">
                  <div className="space-y-2">
                    {/* <span>Amount</span> */}
                    <Input
                      value={amountFilter}
                      onChange={(event) => setAmountFilter(event.target.value)}
                      placeholder="Amount"
                      className="h-8 min-w-[140px] text-left"
                    />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map(expense => (
                <TableRow key={expense.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.addedByName || 'Unknown'}</TableCell>
                  <TableCell className="text-left font-medium">
                    {formatMoney(expense.amount)}
                  </TableCell>
                </TableRow>
              ))}
              {filteredExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No expenses match the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="text-left">
                  <div className="flex items-center gap-2">
                    <Sigma size={15} />
                    <span>Total</span>
                  </div>
                </TableCell>

                <TableCell className="text-left font-medium">
                  {formatMoney(filteredTotal)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Expenses;
