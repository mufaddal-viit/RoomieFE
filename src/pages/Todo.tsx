import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Todo } from 'react-todo-component';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/contexts/SessionContext';

const Todos = () => {
  const navigate = useNavigate();
  const { currentUser, loading, roomId } = useSession();

  useEffect(() => {
    if (loading) return;
    if (!currentUser || !roomId) {
      navigate('/');
    }
  }, [loading, currentUser, roomId, navigate]);

  if (!currentUser || loading) return null;

  return (
    <Layout
      title="Personal Todo List"
      subtitle="Keep track of your own tasks alongside shared expenses."
      userName={currentUser.name}
      isManager={!!currentUser.isManager}
      contentClassName="max-w-4xl space-y-4"
    >
      <Card>
        <CardHeader>
          <CardTitle>Your Todos</CardTitle>
        </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Use this space to note personal chores, reminders, or follow-ups. This list is local
          to you and separate from shared expenses.
        </p>
          {/* <Todo onChange={() => {}} /> */}
      </CardContent>
    </Card>
  </Layout>
  );
};

export default Todos;




