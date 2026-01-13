import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useSession } from '@/contexts/SessionContext';
import RoomExpenseForm from '@/components/add-expense/RoomExpenseForm';
import GroupExpenseComingSoon from '@/components/add-expense/GroupExpenseComingSoon';

const AddExpense = () => {
  const navigate = useNavigate();
  const { currentUser, roommates, roomId, loading } = useSession();
  const [mode, setMode] = useState<'room' | 'group'>('room');

  useEffect(() => {
    if (loading) return;
    if (!currentUser || !roomId) {
      navigate('/');
    }
  }, [currentUser, roomId, loading, navigate]);

  if (!currentUser || !roomId || loading) return null;

  return (
    <Layout
      title="Add New Expense"
      userName={currentUser.name}
      isManager={!!currentUser.isManager}
      contentClassName="max-w-2xl space-y-6"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant={mode === 'room' ? 'default' : 'outline'}
          onClick={() => setMode('room')}
          className="w-full"
        >
          Room Expense
        </Button>
        <Button
          type="button"
          variant={mode === 'group' ? 'default' : 'outline'}
          onClick={() => setMode('group')}
          className="w-full"
        >
          Group Expense
        </Button>
      </div>

      {mode === 'room' ? (
        <RoomExpenseForm currentUserId={currentUser.id} roomId={roomId} roommates={roommates} />
      ) : (
        <GroupExpenseComingSoon onSwitchToRoom={() => setMode('room')} />
      )}
    </Layout>
  );
};

export default AddExpense;
