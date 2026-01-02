import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { Roommate } from '@/lib/types';
import { SelectPills } from '@/components/ui/currency-select';

type GroupExpenseFormProps = {
  roommates: Roommate[];
};

const GroupExpenseForm = ({ roommates }: GroupExpenseFormProps) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const selectedRoommates = useMemo(
    () => roommates.filter(roommate => selectedMembers.includes(roommate.name)),
    [roommates, selectedMembers]
  );

  const getInitials = (name: string) => {
    const [first, second] = name.split(' ');
    return `${first?.[0] ?? ''}${second?.[0] ?? ''}`.toUpperCase() || '?';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-1">
        <CardTitle>Add Group Expense</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Group expenses will let you split costs across selected roommates. Configure this flow here.
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            {/* search box to search Room's member and select them. */}
            <Label className="flex flex-wrap items-center gap-2 text-sm font-medium text-muted-foreground">
              <span>with you and</span>
              <SelectPills
                data={roommates.map(roommate => ({ id: roommate.id, name: roommate.name }))}
                value={selectedMembers}
                onValueChange={setSelectedMembers}
                placeholder="Search members"
              />
              <span>:</span>
            </Label>
          </div>
          <div className="space-y-2">
            {/* display added members here */}
            <div className="min-h-[64px] rounded-lg border border-dashed bg-muted/20 p-3">
              {/* display users:  Avatar with userName */}
              <div className="flex flex-wrap gap-3">
                {selectedRoommates.map(roommate => (
                  <div key={roommate.id} className="flex items-center gap-2 rounded-full bg-background/60 px-2 py-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {getInitials(roommate.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-foreground">{roommate.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupExpenseForm;
