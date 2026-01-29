import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MerchantForm } from './MerchantForm';
import { MerchantCard } from './MerchantCard';
import { Plus, Store, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Merchant {
  id: string;
  merchant_type: 'paytm' | 'phonepe' | 'gpay' | 'bharatpe' | 'pinelab';
  qr_code_url?: string;
  mobile_number?: string;
  email_id?: string;
  password?: string;
  account_id?: string;
  accounts?: {
    id: string;
    bank_name: string;
    account_holder_name: string;
    account_number: string;
    customer_id: string;
    customers: {
      id: string;
      customer_name: string;
    };
  };
}

interface Account {
  id: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
}

export function MerchantsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select(`
          *,
          accounts (
            id,
            bank_name,
            account_holder_name,
            account_number,
            customer_id,
            customers (
              id,
              customer_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMerchants((data || []) as Merchant[]);
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

  const handleMerchantAdded = () => {
    setDialogOpen(false);
    fetchMerchants();
    toast({
      title: "Success",
      description: "Merchant added successfully",
    });
  };

  const handleMerchantDeleted = (merchantId: string) => {
    setMerchants(merchants.filter(merchant => merchant.id !== merchantId));
    toast({
      title: "Success",
      description: "Merchant deleted successfully",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Filter merchants based on search term and type
  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = searchTerm === '' || 
      merchant.merchant_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.mobile_number?.includes(searchTerm) ||
      merchant.email_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || merchant.merchant_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Get unique merchant types for filter
  const uniqueTypes = Array.from(new Set(merchants.map(m => m.merchant_type)));

  const groupedMerchants = filteredMerchants.reduce((groups, merchant) => {
    const customerKey = merchant.accounts ? 
      merchant.accounts.customers.customer_name : 
      'No Account Linked';
    
    if (!groups[customerKey]) {
      groups[customerKey] = [];
    }
    groups[customerKey].push(merchant);
    return groups;
  }, {} as Record<string, Merchant[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Payment Merchants</h3>
          <p className="text-muted-foreground">Manage payment gateway accounts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Merchant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Merchant</DialogTitle>
              <DialogDescription>
                Add a new payment gateway account
              </DialogDescription>
            </DialogHeader>
            <MerchantForm onSuccess={handleMerchantAdded} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search merchants by type, mobile number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {merchants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No merchants yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by adding your first payment merchant
            </p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Merchant
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMerchants).map(([customerName, customerMerchants]) => (
            <div key={customerName} className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <h4 className="text-lg font-semibold text-foreground">{customerName}</h4>
                <Badge variant="outline" className="text-xs">
                  {customerMerchants.length} {customerMerchants.length === 1 ? 'Merchant' : 'Merchants'}
                </Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {customerMerchants.map((merchant) => (
                  <MerchantCard
                    key={merchant.id}
                    merchant={merchant}
                    onDeleted={handleMerchantDeleted}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredMerchants.length === 0 && merchants.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No merchants found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}