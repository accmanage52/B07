import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { User, CreditCard, Store, Eye, EyeOff, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'accountant';
  created_at: string;
  created_by_admin: string | null;
}

interface UserAccount {
  id: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  status: string;
  created_at: string;
  internet_banking_id: string | null;
  internet_banking_password: string | null;
  customer: {
    customer_name: string;
  };
}

interface UserMerchant {
  id: string;
  merchant_type: string;
  email_id: string | null;
  mobile_number: string | null;
  created_at: string;
  account: {
    bank_name: string;
    account_holder_name: string;
    customer: {
      customer_name: string;
    };
  } | null;
}

export const UserDataSection = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [userMerchants, setUserMerchants] = useState<UserMerchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'accountant')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (userId: string) => {
    if (!userId) return;
    
    setDataLoading(true);
    try {
      // Fetch user accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select(`
          *,
          customer:customers(customer_name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (accountsError) throw accountsError;
      setUserAccounts(accountsData || []);

      // Fetch user merchants
      const { data: merchantsData, error: merchantsError } = await supabase
        .from('merchants')
        .select(`
          *,
          account:accounts(
            bank_name,
            account_holder_name,
            customer:customers(customer_name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (merchantsError) throw merchantsError;
      setUserMerchants(merchantsData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    fetchUserData(userId);
  };

  const togglePasswordVisibility = (accountId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const selectedUser = users.find(user => user.user_id === selectedUserId);

  // Filter accounts based on search term and status
  const filteredAccounts = userAccounts.filter(account => {
    const matchesSearch = searchTerm === '' || 
      account.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_holder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.customer?.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_number.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter merchants based on search term
  const filteredMerchants = userMerchants.filter(merchant => {
    const matchesSearch = searchTerm === '' || 
      merchant.merchant_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.email_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.mobile_number?.includes(searchTerm) ||
      merchant.account?.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.account?.customer?.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Data Overview
          </CardTitle>
          <CardDescription>
            Select a user to view their accounts and merchants data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleUserSelect} value={selectedUserId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a user to view their data" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.user_id} value={user.user_id}>
                  <div className="flex items-center gap-2">
                    <span>{user.full_name}</span>
                    <span className="text-muted-foreground">({user.email})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>Data for {selectedUser.full_name}</CardTitle>
            <CardDescription>
              All accounts and merchants created by this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search data by name, bank, type, number..."
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Tabs defaultValue="accounts" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="accounts" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Accounts ({filteredAccounts.length}/{userAccounts.length})
                    </TabsTrigger>
                    <TabsTrigger value="merchants" className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Merchants ({filteredMerchants.length}/{userMerchants.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="accounts" className="space-y-4">
                    {filteredAccounts.length === 0 ? (
                      <div className="text-center py-8">
                        {userAccounts.length === 0 ? (
                          <p className="text-muted-foreground">No accounts found for this user</p>
                        ) : (
                          <div className="space-y-2">
                            <Search className="h-8 w-8 text-muted-foreground mx-auto" />
                            <p className="text-muted-foreground">No accounts match your search criteria</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      filteredAccounts.map((account) => (
                      <Card key={account.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{account.bank_name}</CardTitle>
                            <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                              {account.status}
                            </Badge>
                          </div>
                          <CardDescription>
                            Customer: {account.customer?.customer_name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Account Holder</p>
                              <p className="text-sm text-muted-foreground">{account.account_holder_name}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Account Number</p>
                              <p className="text-sm text-muted-foreground">****{account.account_number.slice(-4)}</p>
                            </div>
                            {account.internet_banking_id && (
                              <div>
                                <p className="text-sm font-medium">Internet Banking ID</p>
                                <p className="text-sm text-muted-foreground">{account.internet_banking_id}</p>
                              </div>
                            )}
                            {account.internet_banking_password && (
                              <div>
                                <p className="text-sm font-medium">Internet Banking Password</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-muted-foreground">
                                    {showPasswords[account.id] ? account.internet_banking_password : '••••••••'}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => togglePasswordVisibility(account.id)}
                                  >
                                    {showPasswords[account.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium">Created</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(account.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                  <TabsContent value="merchants" className="space-y-4">
                    {filteredMerchants.length === 0 ? (
                      <div className="text-center py-8">
                        {userMerchants.length === 0 ? (
                          <p className="text-muted-foreground">No merchants found for this user</p>
                        ) : (
                          <div className="space-y-2">
                            <Search className="h-8 w-8 text-muted-foreground mx-auto" />
                            <p className="text-muted-foreground">No merchants match your search criteria</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      filteredMerchants.map((merchant) => (
                      <Card key={merchant.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{merchant.merchant_type}</CardTitle>
                          <CardDescription>
                            {merchant.account ? 
                              `Account: ${merchant.account.customer?.customer_name} - ${merchant.account.bank_name}` :
                              'No account linked'
                            }
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {merchant.email_id && (
                              <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-muted-foreground">{merchant.email_id}</p>
                              </div>
                            )}
                            {merchant.mobile_number && (
                              <div>
                                <p className="text-sm font-medium">Mobile</p>
                                <p className="text-sm text-muted-foreground">{merchant.mobile_number}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium">Created</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(merchant.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};