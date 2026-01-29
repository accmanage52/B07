import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface MerchantFormProps {
  onSuccess: () => void;
}

interface Account {
  id: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  customer_id: string;
  customers: {
    id: string;
    customer_name: string;
  };
}

export function MerchantForm({ onSuccess }: MerchantFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [merchantType, setMerchantType] = useState<'paytm' | 'phonepe' | 'gpay' | 'bharatpe' | 'pinelab'>('paytm');
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select(`
          id, 
          bank_name, 
          account_holder_name, 
          account_number,
          customer_id,
          customers (
            id,
            customer_name
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('bank_name');

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const uploadQRCode = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/qr-codes/${merchantType}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let qrCodeUrl = '';

      // Upload QR code if provided
      if (qrFile) {
        qrCodeUrl = await uploadQRCode(qrFile);
      }

      // Create merchant
      const { error } = await supabase
        .from('merchants')
        .insert({
          user_id: user.id,
          account_id: selectedAccountId || null,
          merchant_type: merchantType,
          qr_code_url: qrCodeUrl,
          mobile_number: mobileNumber || null,
          email_id: emailId || null,
          password: password || null,
        });

      if (error) throw error;

      onSuccess();
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

  const resetForm = () => {
    setSelectedAccountId('');
    setQrFile(null);
    setMobileNumber('');
    setEmailId('');
    setPassword('');
  };

  const handleMerchantTypeChange = (value: 'paytm' | 'phonepe' | 'gpay' | 'bharatpe' | 'pinelab') => {
    setMerchantType(value);
    resetForm();
  };

  const getRequiredFields = () => {
    switch (merchantType) {
      case 'paytm':
      case 'phonepe':
      case 'bharatpe':
        return { mobile: true, email: false, password: false };
      case 'gpay':
      case 'pinelab':
        return { mobile: false, email: true, password: true };
      default:
        return { mobile: false, email: false, password: false };
    }
  };

  const requiredFields = getRequiredFields();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="account">Linked Account *</Label>
        <Select value={selectedAccountId} onValueChange={setSelectedAccountId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select an account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.customers.customer_name} - {account.bank_name} ({account.account_number})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {accounts.length === 0 && (
          <p className="text-sm text-muted-foreground">No active accounts found. Please add an account first.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="merchant-type">Merchant Type *</Label>
        <Select value={merchantType} onValueChange={handleMerchantTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select merchant type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paytm">Paytm</SelectItem>
            <SelectItem value="phonepe">PhonePe</SelectItem>
            <SelectItem value="gpay">GPay</SelectItem>
            <SelectItem value="bharatpe">BharatPe</SelectItem>
            <SelectItem value="pinelab">PineLab</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="qr-code">QR Code Image</Label>
        <Input
          id="qr-code"
          type="file"
          accept="image/*"
          onChange={(e) => setQrFile(e.target.files?.[0] || null)}
        />
      </div>

      {requiredFields.mobile && (
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile Number *</Label>
          <Input
            id="mobile"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="Enter mobile number"
            required
          />
        </div>
      )}

      {requiredFields.email && (
        <div className="space-y-2">
          <Label htmlFor="email">Email ID *</Label>
          <Input
            id="email"
            type="email"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            placeholder="Enter email address"
            required
          />
        </div>
      )}

      {requiredFields.password && (
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4">
        <Button type="submit" disabled={loading || !selectedAccountId} className="w-full">
          {loading ? 'Adding...' : 'Add Merchant'}
        </Button>
      </div>
    </form>
  );
}