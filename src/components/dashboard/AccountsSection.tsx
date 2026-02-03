import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AccountForm } from './AccountForm';
import { AccountCard } from './AccountCard';
import { Plus, Banknote, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  customer_name: string;
  aadhaar_number: string;
  pan_number: string;
  aadhaar_image_url?: string;
  pan_image_url?: string;
}

export interface Account {
  id: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  mobile_number: string;
  email_id: string;
  account_closing_balance?: number;
  internet_banking_id?: string;
  internet_banking_password?: string;
  account_provided_by?: string;
  account_given_to?: string;
  aadhaar_front_image_url?: string;
  aadhaar_back_image_url?: string;
  atm_pin?: string;
  status?: string;
  customer: Customer;
  debit_cards?: DebitCard[];
}

export interface DebitCard {
  id: string;
  card_number: string;
  expiry_date: string;
  cvv: string;
}

export function AccountsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select(`
          *,
          customers:customer_id (*),
          debit_cards (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(account => ({
       ...account,
       customer: account.customers,
       account_closing_balance: Number(account.account_closing_balance) || 0,
      }));

      
      setAccounts(transformedData);
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

  const handleAccountAdded = () => {
    setDialogOpen(false);
    setEditingAccount(null);
    fetchAccounts();
    toast({
      title: "Success",
      description: editingAccount ? "Account updated successfully" : "Account added successfully",
    });
  };

  const handleAccountEdit = (account: Account) => {
    setEditingAccount(account);
    setDialogOpen(true);
  };

  const handleAccountDeleted = (accountId: string) => {
    setAccounts(accounts.filter(account => account.id !== accountId));
    toast({
      title: "Success",
      description: "Account deleted successfully",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Filter accounts based on search term and status
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = searchTerm === '' || 
      account.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_holder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.customer?.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_number.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Bank Accounts</h3>
          <p className="text-muted-foreground">Manage customer accounts and debit cards</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingAccount(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
              <DialogDescription>
                {editingAccount ? 'Update account information' : 'Create a new bank account with customer details and debit card information'}
              </DialogDescription>
            </DialogHeader>
            <AccountForm 
              onSuccess={handleAccountAdded} 
              account={editingAccount}
              isEdit={!!editingAccount}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts by bank, holder name, customer name, or account number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="freeze">Freeze</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Banknote className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No accounts yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by adding your first bank account
            </p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Account
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onDeleted={handleAccountDeleted}
              onEdit={handleAccountEdit}
            />
          ))}
        </div>
      )}

      {filteredAccounts.length === 0 && accounts.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No accounts found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
