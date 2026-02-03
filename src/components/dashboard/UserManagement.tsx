import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AccountantProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export function UserManagement() {
  const [accountants, setAccountants] = useState<AccountantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAccountant, setNewAccountant] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAccountants();
    }
  }, [user]);

  const fetchAccountants = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('created_by_admin', user?.id)
        .eq('role', 'accountant')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccountants(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAccountant = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`https://gjytsmbrqvsbpxncrniz.supabase.co/functions/v1/create-accountant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newAccountant.email,
          password: newAccountant.password,
          fullName: newAccountant.fullName,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Failed with status ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Accountant created and confirmed successfully! They can now sign in immediately.",
      });

      setNewAccountant({ email: '', password: '', fullName: '' });
      setIsDialogOpen(false);
      fetchAccountants();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteAccountant = async (accountantId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`https://gjytsmbrqvsbpxncrniz.supabase.co/functions/v1/delete-accountant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountantId: accountantId, // ✅ FIXED (was id before)
        }),
      });

      const result = await response.json();
      console.log("Delete accountant response:", result); // 👀 log backend response

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Failed with status ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Accountant deleted successfully",
      });

      fetchAccountants();
    } catch (error: any) {
      console.error("Delete accountant error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">User Management</h2>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Accountant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Accountant</DialogTitle>
            </DialogHeader>
            <form onSubmit={createAccountant} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter full name"
                  value={newAccountant.fullName}
                  onChange={(e) => setNewAccountant({ ...newAccountant, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newAccountant.email}
                  onChange={(e) => setNewAccountant({ ...newAccountant, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={newAccountant.password}
                  onChange={(e) => setNewAccountant({ ...newAccountant, password: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={creating} className="flex-1">
                  {creating ? 'Creating...' : 'Create Accountant'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {accountants.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Accountants Created</h3>
            <p className="text-muted-foreground mb-4">
              Create your first accountant to start managing your financial data.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create First Accountant
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {accountants.map((accountant) => (
            <Card key={accountant.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{accountant.full_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{accountant.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Accountant</Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAccountant(accountant.user_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Created on {new Date(accountant.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
