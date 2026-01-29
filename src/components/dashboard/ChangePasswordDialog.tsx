import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KeyRound } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'accountant';
  email: string;
  user_id: string;
}

interface ChangePasswordDialogProps {
  userProfile: Profile;
}

export function ChangePasswordDialog({ userProfile }: ChangePasswordDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [accountants, setAccountants] = useState<Profile[]>([]);
  const { changePassword } = useAuth();

  useEffect(() => {
    if (userProfile.role === 'admin' && isOpen) {
      fetchAccountants();
      setSelectedUserId(userProfile.user_id); // Default to admin's own user ID
    }
  }, [userProfile, isOpen]);

  const fetchAccountants = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'accountant');

      if (error) throw error;
      setAccountants(data || []);
    } catch (error) {
      console.error('Error fetching accountants:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return;
    }

    if (newPassword.length < 6) {
      return;
    }

    setIsLoading(true);
    
    try {
      if (selectedUserId === userProfile.user_id) {
        // Changing own password
        const { error } = await changePassword(newPassword);
        if (error) throw error;
      } else {
        // Admin changing accountant's password via edge function
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`https://kkpqfabhsdanybxaaqsu.supabase.co/functions/v1/change-user-password`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetUserId: selectedUserId,
            newPassword: newPassword
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to change password');
        }
      }
      
      setIsOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      setSelectedUserId('');
    } catch (error: any) {
      console.error('Error changing password:', error);
    }
    
    setIsLoading(false);
  };

  const isValid = newPassword.length >= 6 && newPassword === confirmPassword && selectedUserId;

  // Only show change password for admins
  if (userProfile.role !== 'admin') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <KeyRound className="h-4 w-4 mr-2" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Select a user and enter the new password below. Password must be at least 6 characters long.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-select">Select User</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select user to change password" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={userProfile.user_id}>
                  {userProfile.full_name} (Admin - Yourself)
                </SelectItem>
                {accountants.map((accountant) => (
                  <SelectItem key={accountant.user_id} value={accountant.user_id}>
                    {accountant.full_name} (Accountant)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={6}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-destructive">Passwords do not match</p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
            >
              {isLoading ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}