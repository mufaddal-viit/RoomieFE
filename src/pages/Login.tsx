import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage } from '@/lib/storage';
import { Users } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [roommates, setRoommates] = useState(storage.getRoommates());
  const [isSetup, setIsSetup] = useState(false);
  const [names, setNames] = useState<string[]>(Array(8).fill(''));

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    if (currentUser && roommates.length > 0) {
      navigate('/dashboard');
    }
  }, [navigate, roommates]);

  const handleSetup = () => {
    const validNames = names.filter(name => name.trim() !== '');
    if (validNames.length < 2) {
      alert('Please add at least 2 roommates');
      return;
    }
    storage.initializeRoommates(validNames);
    setRoommates(storage.getRoommates());
    setIsSetup(false);
  };

  const handleLogin = (roommateId: string) => {
    storage.setCurrentUser(roommateId);
    navigate('/dashboard');
  };

  if (roommates.length === 0 || isSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle>Setup Roommates</CardTitle>
            </div>
            <CardDescription>
              Enter the names of all roommates. The first person will be the manager.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {names.map((name, index) => (
                <div key={index}>
                  <Label htmlFor={`name-${index}`}>
                    Roommate {index + 1} {index === 0 && '(Manager)'}
                  </Label>
                  <Input
                    id={`name-${index}`}
                    value={name}
                    onChange={(e) => {
                      const newNames = [...names];
                      newNames[index] = e.target.value;
                      setNames(newNames);
                    }}
                    placeholder={`Enter name ${index + 1}`}
                  />
                </div>
              ))}
            </div>
            <Button onClick={handleSetup} className="w-full">
              Save Roommates
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle>Roommate Expense Tracker</CardTitle>
          </div>
          <CardDescription>Select your name to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {roommates.map((roommate) => (
            <Button
              key={roommate.id}
              onClick={() => handleLogin(roommate.id)}
              variant="outline"
              className="w-full justify-start h-auto py-3"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{roommate.name}</span>
                {roommate.isManager && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                    Manager
                  </span>
                )}
              </div>
            </Button>
          ))}
          <Button
            onClick={() => setIsSetup(true)}
            variant="ghost"
            className="w-full mt-4"
          >
            Edit Roommates
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
