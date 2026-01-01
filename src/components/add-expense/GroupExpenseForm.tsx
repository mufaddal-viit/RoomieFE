import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

const GroupExpenseForm = () => (
  <Card className="overflow-hidden">
    <CardHeader className="space-y-1">
      <CardTitle>Add Group Expense</CardTitle>
    </CardHeader>
    <CardContent className="text-sm text-muted-foreground">
      Group expenses will let you split costs across selected roommates. Configure this flow here.
      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          {/* search box to search Room's member and select them. */}
          <div className="flex  items-center gap-2 text-xs font-semibold  tracking-wide text-muted-foreground">
            <span>with you and: </span>
              <Input
                type="search"
                placeholder="Search Members"
                className="h-7 border-2 bg-transparent p-1 text-xs shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
        </div>
        <div className="space-y-2">
          {/* display added members here */}
          <div className="min-h-[64px] rounded-lg border border-dashed bg-muted/20 p-3">
            {/* display users:  Avatar with userName */}
            <div className="flex flex-wrap gap-2" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default GroupExpenseForm;
