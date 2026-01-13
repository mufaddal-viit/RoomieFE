export type AnalyticsOverviewCard = {
  id: string;
  label: string;
  valueKey: string;
  format: 'money' | 'number' | 'percent';
};

export const analyticsOverviewCards: AnalyticsOverviewCard[] = [
  {
    id: 'totalApproved',
    label: 'Total Approved',
    valueKey: 'monthTotalExpense',
    format: 'money',
  },
  {
    id: 'averageExpense',
    label: 'Average Expense',
    valueKey: 'monthAvgExpense',
    format: 'money',
  },
  // {
  //   id: 'medianExpense',
  //   label: 'Median Expense',
  //   valueKey: 'monthMedianExpense',
  //   format: 'money',
  // },
  // {
  //   id: 'perPersonShare',
  //   label: 'Per Person Share',
  //   valueKey: 'monthPerPersonShare',
  //   format: 'money',
  // },
  // {
  //   id: 'approvedCount',
  //   label: 'Approved Count',
  //   valueKey: 'monthApprovedCount',
  //   format: 'number',
  // },
  {
    id: 'approvalRate',
    label: 'Approval Rate',
    valueKey: 'approvalRate',
    format: 'percent',
  },
];
