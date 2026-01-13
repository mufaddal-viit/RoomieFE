import { UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type GroupExpenseComingSoonProps = {
  onSwitchToRoom?: () => void;
};

const GroupExpenseComingSoon = ({ onSwitchToRoom }: GroupExpenseComingSoonProps) => (
  <Card className="border-dashed border-muted/60 bg-gradient-to-br from-muted/30 via-background to-background">
    <CardContent className="space-y-5 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UsersRound className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Group expenses</p>
            <p className="text-xs text-muted-foreground">
              Split once, track together with approvals.
            </p>
          </div>
        </div>
        <Badge className="border border-muted/60 bg-background/80 text-muted-foreground" variant="secondary">
          Coming soon
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-muted/60 bg-background/80 p-3">
          <p className="text-xs font-medium text-muted-foreground">Smart splits</p>
          <p className="text-sm font-semibold text-foreground">Custom weights and shares</p>
        </div>
        <div className="rounded-lg border border-muted/60 bg-background/80 p-3">
          <p className="text-xs font-medium text-muted-foreground">Manager review</p>
          <p className="text-sm font-semibold text-foreground">Approve or flag requests</p>
        </div>
      </div>

      <div className="rounded-lg border border-muted/60 bg-background/80 p-3 text-sm text-muted-foreground">
        Use Room Expense for now. Group expenses will land here next.
      </div>

      {onSwitchToRoom && (
        <Button type="button" variant="outline" onClick={onSwitchToRoom}>
          Switch to room expense
        </Button>
      )}
    </CardContent>
  </Card>
);

export default GroupExpenseComingSoon;
