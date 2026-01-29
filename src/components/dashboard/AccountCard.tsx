import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DebitCardView } from './DebitCardView';
import { Account } from './AccountsSection';
import { Building2, User, Phone, Mail, CreditCard, Eye, Trash2, Edit, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccountCardProps {
  account: Account;
  onDeleted: (accountId: string) => void;
  onEdit?: (account: Account) => void;
}

export function AccountCard({ account, onDeleted, onEdit }: AccountCardProps) {
  const { toast } = useToast();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cardViewOpen, setCardViewOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', account.id);

      if (error) throw error;
      onDeleted(account.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const getImageUrl = (path: string) => {
    const { data } = supabase.storage.from('documents').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{account.bank_name}</CardTitle>
              <Badge variant={account.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                {account.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setDetailsOpen(true)}>
                <Eye className="h-4 w-4" />
              </Button>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(account)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={deleting}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this account? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{account.account_holder_name}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{account.customer?.customer_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{account.mobile_number}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{account.email_id}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <Badge variant="secondary">
              {account.account_number.slice(-4)}
            </Badge>
            {account.debit_cards && account.debit_cards.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCardViewOpen(true)}
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                View Card
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
            <DialogDescription>Complete information for {account.bank_name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6">
            {/* Customer Information */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{account.customer?.customer_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Aadhaar:</span>
                  <p className="font-medium">{account.customer?.aadhaar_number}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">PAN:</span>
                  <p className="font-medium">{account.customer?.pan_number}</p>
                </div>
              </div>
              
              {/* Document Images */}
              {(account.aadhaar_front_image_url || account.aadhaar_back_image_url || account.customer?.aadhaar_image_url || account.customer?.pan_image_url) && (
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Documents</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {account.aadhaar_front_image_url && (
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Aadhaar Front</span>
                        <img 
                          src={getImageUrl(account.aadhaar_front_image_url)} 
                          alt="Aadhaar Front" 
                          className="w-full h-20 object-cover border rounded cursor-pointer hover:scale-105 transition-transform" 
                          onClick={() => window.open(getImageUrl(account.aadhaar_front_image_url), '_blank')}
                        />
                      </div>
                    )}
                    {account.aadhaar_back_image_url && (
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Aadhaar Back</span>
                        <img 
                          src={getImageUrl(account.aadhaar_back_image_url)} 
                          alt="Aadhaar Back" 
                          className="w-full h-20 object-cover border rounded cursor-pointer hover:scale-105 transition-transform" 
                          onClick={() => window.open(getImageUrl(account.aadhaar_back_image_url), '_blank')}
                        />
                      </div>
                    )}
                    {account.customer?.aadhaar_image_url && (
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Aadhaar</span>
                        <img 
                          src={getImageUrl(account.customer.aadhaar_image_url)} 
                          alt="Aadhaar" 
                          className="w-full h-20 object-cover border rounded cursor-pointer hover:scale-105 transition-transform" 
                          onClick={() => window.open(getImageUrl(account.customer.aadhaar_image_url), '_blank')}
                        />
                      </div>
                    )}
                    {account.customer?.pan_image_url && (
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">PAN</span>
                        <img 
                          src={getImageUrl(account.customer.pan_image_url)} 
                          alt="PAN" 
                          className="w-full h-20 object-cover border rounded cursor-pointer hover:scale-105 transition-transform" 
                          onClick={() => window.open(getImageUrl(account.customer.pan_image_url), '_blank')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Account Information */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Account Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Bank:</span>
                  <p className="font-medium">{account.bank_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Account Number:</span>
                  <p className="font-medium">{account.account_number}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">IFSC:</span>
                  <p className="font-medium">{account.ifsc_code}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Mobile:</span>
                  <p className="font-medium">{account.mobile_number}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{account.email_id}</p>
                </div>
                {account.internet_banking_id && (
                  <div>
                    <span className="text-muted-foreground">Internet Banking ID:</span>
                    <p className="font-medium">{account.internet_banking_id}</p>
                  </div>
                )}
                {account.internet_banking_password && (
                  <div>
                    <span className="text-muted-foreground">Internet Banking Password:</span>
                    <div className="flex items-center gap-2">
                      <p className="font-medium font-mono">
                        {showPassword ? account.internet_banking_password : '••••••••'}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
                {account.account_provided_by && (
                  <div>
                    <span className="text-muted-foreground">Provided By:</span>
                    <p className="font-medium">{account.account_provided_by}</p>
                  </div>
                )}
                {account.account_given_to && (
                  <div>
                    <span className="text-muted-foreground">Given To:</span>
                    <p className="font-medium">{account.account_given_to}</p>
                  </div>
                )}
                {account.atm_pin && (
                  <div>
                    <span className="text-muted-foreground">ATM PIN:</span>
                    <p className="font-medium font-mono">••••</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Debit Card View Dialog */}
      {account.debit_cards && account.debit_cards.length > 0 && (
        <Dialog open={cardViewOpen} onOpenChange={setCardViewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Debit Card</DialogTitle>
              <DialogDescription>Virtual debit card view</DialogDescription>
            </DialogHeader>
            <DebitCardView
              debitCard={account.debit_cards[0]}
              bankName={account.bank_name}
              accountHolderName={account.account_holder_name}
              atmPin={account.atm_pin}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}