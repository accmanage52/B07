import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Building2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccountFormProps {
  onSuccess: () => void;
  account?: any;
  isEdit?: boolean;
}

export function AccountForm({ onSuccess, account, isEdit = false }: AccountFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Customer details
  const [customerName, setCustomerName] = useState(account?.customers?.customer_name || '');
  const [aadhaarNumber, setAadhaarNumber] = useState(account?.customers?.aadhaar_number || '');
  const [panNumber, setPanNumber] = useState(account?.customers?.pan_number || '');
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState<File | null>(null);
  const [aadhaarBackFile, setAadhaarBackFile] = useState<File | null>(null);
  
  // Account details
  const [bankName, setBankName] = useState(account?.bank_name || '');
  const [accountHolderName, setAccountHolderName] = useState(account?.account_holder_name || '');
  const [accountNumber, setAccountNumber] = useState(account?.account_number || '');
  const [ifscCode, setIfscCode] = useState(account?.ifsc_code || '');
  const [mobileNumber, setMobileNumber] = useState(account?.mobile_number || '');
  const [emailId, setEmailId] = useState(account?.email_id || '');
  
  // New account fields
  const [internetBankingId, setInternetBankingId] = useState(account?.internet_banking_id || '');
  const [internetBankingPassword, setInternetBankingPassword] = useState(account?.internet_banking_password || '');
  const [accountProvidedBy, setAccountProvidedBy] = useState(account?.account_provided_by || '');
  const [accountGivenTo, setAccountGivenTo] = useState(account?.account_given_to || '');
  const [atmPin, setAtmPin] = useState(account?.atm_pin || '');
  const [status, setStatus] = useState(account?.status || 'active');
  const [accountClosingBalance, setAccountClosingBalance] = useState(account?.account_closing_balance || '');
  const [showAtmPin, setShowAtmPin] = useState(false);
  const [showIBPassword, setShowIBPassword] = useState(false);
  
  // Debit card details
  const [cardNumber, setCardNumber] = useState(account?.debit_cards?.[0]?.card_number || '');
  const [expiryDate, setExpiryDate] = useState(account?.debit_cards?.[0]?.expiry_date || '');
  const [cvv, setCvv] = useState(account?.debit_cards?.[0]?.cvv || '');

  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${folder}/${Date.now()}.${fileExt}`;
    
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
      let aadhaarImageUrl = account?.customer?.aadhaar_image_url || '';
      let panImageUrl = account?.customer?.pan_image_url || '';

      // Upload files if provided
      let aadhaarFrontUrl = account?.aadhaar_front_image_url || '';
      let aadhaarBackUrl = account?.aadhaar_back_image_url || '';
      
      if (aadhaarFrontFile) {
        aadhaarFrontUrl = await uploadFile(aadhaarFrontFile, 'aadhaar-front');
      }
      if (aadhaarBackFile) {
        aadhaarBackUrl = await uploadFile(aadhaarBackFile, 'aadhaar-back');
      }
      if (aadhaarFile) {
        aadhaarImageUrl = await uploadFile(aadhaarFile, 'aadhaar');
      }
      if (panFile) {
        panImageUrl = await uploadFile(panFile, 'pan');
      }

      let customer;
      let accountData;

      if (isEdit && account) {
        // Update existing customer
        const { data: updatedCustomer, error: customerError } = await supabase
          .from('customers')
          .update({
            customer_name: customerName,
            aadhaar_number: aadhaarNumber,
            pan_number: panNumber,
            ...(aadhaarImageUrl && { aadhaar_image_url: aadhaarImageUrl }),
            ...(panImageUrl && { pan_image_url: panImageUrl }),
          })
          .eq('id', account.customer.id)
          .select()
          .single();

        if (customerError) throw customerError;
        customer = updatedCustomer;

        // Update existing account
        const { data: updatedAccount, error: accountError } = await supabase
          .from('accounts')
          .update({
            bank_name: bankName,
            account_closing_balance: accountClosingBalance,
            account_holder_name: accountHolderName,
            account_number: accountNumber,
            ifsc_code: ifscCode,
            mobile_number: mobileNumber,
            email_id: emailId,
            internet_banking_id: internetBankingId,
            internet_banking_password: internetBankingPassword,
            account_provided_by: accountProvidedBy,
            account_given_to: accountGivenTo,
            ...(aadhaarFrontUrl && { aadhaar_front_image_url: aadhaarFrontUrl }),
            ...(aadhaarBackUrl && { aadhaar_back_image_url: aadhaarBackUrl }),
            atm_pin: atmPin,
            status: status,
          })
          .eq('id', account.id)
          .select()
          .single();

        if (accountError) throw accountError;
        accountData = updatedAccount;

        // Update or create debit card
        if (cardNumber && expiryDate && cvv) {
          if (account.debit_cards && account.debit_cards.length > 0) {
            // Update existing debit card
            const { error: cardError } = await supabase
              .from('debit_cards')
              .update({
                card_number: cardNumber,
                expiry_date: expiryDate,
                cvv: cvv,
              })
              .eq('id', account.debit_cards[0].id);

            if (cardError) throw cardError;
          } else {
            // Create new debit card
            const { error: cardError } = await supabase
              .from('debit_cards')
              .insert({
                account_id: account.id,
                card_number: cardNumber,
                expiry_date: expiryDate,
                cvv: cvv,
              });

            if (cardError) throw cardError;
          }
        }
      } else {
        // Create new customer
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            user_id: user.id,
            customer_name: customerName,
            aadhaar_number: aadhaarNumber,
            pan_number: panNumber,
            aadhaar_image_url: aadhaarImageUrl,
            pan_image_url: panImageUrl,
          })
          .select()
          .single();

        if (customerError) throw customerError;
        customer = newCustomer;

        // Create new account
        const { data: newAccount, error: accountError } = await supabase
          .from('accounts')
          .insert({
            user_id: user.id,
            customer_id: customer.id,
            bank_name: bankName,
            account_closing_balance: accountClosingBalance,
            account_holder_name: accountHolderName,
            account_number: accountNumber,
            ifsc_code: ifscCode,
            mobile_number: mobileNumber,
            email_id: emailId,
            internet_banking_id: internetBankingId,
            internet_banking_password: internetBankingPassword,
            account_provided_by: accountProvidedBy,
            account_given_to: accountGivenTo,
            aadhaar_front_image_url: aadhaarFrontUrl,
            aadhaar_back_image_url: aadhaarBackUrl,
            atm_pin: atmPin,
            status: status,
          })
          .select()
          .single();

        if (accountError) throw accountError;
        accountData = newAccount;

        // Create debit card if details provided
        if (cardNumber && expiryDate && cvv) {
          const { error: cardError } = await supabase
            .from('debit_cards')
            .insert({
              account_id: accountData.id,
              card_number: cardNumber,
              expiry_date: expiryDate,
              cvv: cvv,
            });

          if (cardError) throw cardError;
        }
      }

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Details
          </CardTitle>
          <CardDescription>Personal information of the account holder</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Customer Name *</Label>
              <Input
                id="customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aadhaar">Aadhaar Number *</Label>
              <Input
                id="aadhaar"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value)}
                placeholder="XXXX XXXX XXXX"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pan">PAN Number *</Label>
              <Input
                id="pan"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                placeholder="ABCDE1234F"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aadhaar-front-file">Aadhaar Front Image</Label>
              <Input
                id="aadhaar-front-file"
                type="file"
                accept="image/*"
                onChange={(e) => setAadhaarFrontFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aadhaar-back-file">Aadhaar Back Image</Label>
              <Input
                id="aadhaar-back-file"
                type="file"
                accept="image/*"
                onChange={(e) => setAadhaarBackFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aadhaar-file">Aadhaar Single Image (Optional)</Label>
              <Input
                id="aadhaar-file"
                type="file"
                accept="image/*"
                onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pan-file">PAN Image</Label>
              <Input
                id="pan-file"
                type="file"
                accept="image/*"
                onChange={(e) => setPanFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Account Details
          </CardTitle>
          <CardDescription>Bank account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank-name">Bank Name *</Label>
              <Input
                id="bank-name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-holder">Account Holder Name *</Label>
              <Input
                id="account-holder"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account-number">Account Number *</Label>
              <Input
                id="account-number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ifsc">IFSC Code *</Label>
              <Input
                id="ifsc"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email ID *</Label>
              <Input
                id="email"
                type="email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* New Account Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="internet-banking-id">Internet Banking ID</Label>
              <Input
                id="internet-banking-id"
                value={internetBankingId}
                onChange={(e) => setInternetBankingId(e.target.value)}
                placeholder="Enter internet banking ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="internet-banking-password">Internet Banking Password</Label>
              <div className="relative">
                <Input
                  id="internet-banking-password"
                  type={showIBPassword ? 'text' : 'password'}
                  value={internetBankingPassword}
                  onChange={(e) => setInternetBankingPassword(e.target.value)}
                  placeholder="Enter internet banking password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowIBPassword(!showIBPassword)}
                >
                  {showIBPassword ? 'Hide' : 'Show'}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account-provided-by">Account Provided By</Label>
              <Input
                id="account-provided-by"
                value={accountProvidedBy}
                onChange={(e) => setAccountProvidedBy(e.target.value)}
                placeholder="Who provided this account"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-given-to">Account Given To</Label>
              <Input
                id="account-given-to"
                value={accountGivenTo}
                onChange={(e) => setAccountGivenTo(e.target.value)}
                placeholder="Who was given this account"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="atm-pin">ATM PIN</Label>
              <div className="relative">
                <Input
                  id="atm-pin"
                  type={showAtmPin ? 'text' : 'password'}
                  value={atmPin}
                  onChange={(e) => setAtmPin(e.target.value)}
                  placeholder="Enter ATM PIN"
                  maxLength={4}
                />
              <Label htmlFor="closing-balance">Account Closing Balance</Label>
               <Input
                 id="closing-balance"
                 type="number"
                 value={accountClosingBalance}
                 onChange={(e) => setAccountClosingBalance(e.target.value)}
                 placeholder="Enter closing balance"
               />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowAtmPin(!showAtmPin)}
                >
                  {showAtmPin ? 'Hide' : 'Show'}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Account Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="freeze">Freeze</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debit Card Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Debit Card Details
          </CardTitle>
          <CardDescription>Optional debit card information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input
                id="card-number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="XXXX XXXX XXXX XXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="XXX"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Account' : 'Create Account')}
        </Button>
      </div>
    </form>
  );
}
