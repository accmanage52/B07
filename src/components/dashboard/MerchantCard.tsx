import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Merchant } from './MerchantsSection';
import { Eye, Trash2, Phone, Mail, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MerchantCardProps {
  merchant: Merchant;
  onDeleted: (merchantId: string) => void;
}

const merchantIcons = {
  paytm: '/images/paytmu.png',
  phonepe: '/images/phonepe.png',
  gpay: '/images/gpay.png',
  bharatpe: '/images/bharatpe.png',
  pinelab: '/images/pinelab.png',
};

const merchantColors = {
  paytm: 'bg-blue-500',
  phonepe: 'bg-purple-500',
  gpay: 'bg-green-500',
  bharatpe: 'bg-white-500',
  pinelab: 'bg-red-500',
};

export function MerchantCard({ merchant, onDeleted }: MerchantCardProps) {
  const { toast } = useToast();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('merchants')
        .delete()
        .eq('id', merchant.id);

      if (error) throw error;
      onDeleted(merchant.id);
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

  const getQRCodeImageUrl = (path: string) => {
    const { data } = supabase.storage.from('documents').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Merchant Icon */}
              <div className={`w-10 h-10 rounded-lg ${merchantColors[merchant.merchant_type]} flex items-center justify-center`}>
                <img
                  src={merchantIcons[merchant.merchant_type]}
                  alt={merchant.merchant_type}
                  className="w-9 h-9 object-contain"
                />
              </div>

              <div>
                <CardTitle className="text-lg capitalize">{merchant.merchant_type}</CardTitle>
                {merchant.accounts && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Customer: {merchant.accounts.customers.customer_name}
                  </div>
                )}
                <Badge variant="secondary" className="text-xs mt-1">
                  Payment Gateway
                </Badge>
              </div>
            </div>

            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setDetailsOpen(true)}>
                <Eye className="h-4 w-4" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={deleting}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Merchant</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this merchant? This action cannot be undone.
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
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="space-y-2">
            {merchant.accounts && (
              <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded-lg">
                <div className="font-medium">
                  Account: {merchant.accounts.bank_name} - {merchant.accounts.account_holder_name}
                </div>
              </div>
            )}

            {merchant.mobile_number && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{merchant.mobile_number}</span>
              </div>
            )}

            {merchant.email_id && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{merchant.email_id}</span>
              </div>
            )}

            {merchant.qr_code_url && (
              <div className="flex items-center gap-2 text-sm">
                <QrCode className="h-4 w-4 text-muted-foreground" />
                <span className="text-success">QR Code Available</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Merchant Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-lg ${merchantColors[merchant.merchant_type]} flex items-center justify-center`}>
                <img
                  src={merchantIcons[merchant.merchant_type]}
                  alt={merchant.merchant_type}
                  className="w-9 h-9 object-contain"
                />
              </div>
              {merchant.merchant_type.charAt(0).toUpperCase() + merchant.merchant_type.slice(1)}
            </DialogTitle>
            <DialogDescription>Payment gateway details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {merchant.accounts && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Account Details</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Customer:</strong> {merchant.accounts.customers.customer_name}</div>
                  <div><strong>Bank:</strong> {merchant.accounts.bank_name}</div>
                  <div><strong>Account Holder:</strong> {merchant.accounts.account_holder_name}</div>
                  <div><strong>Account Number:</strong> {merchant.accounts.account_number}</div>
                </div>
              </div>
            )}

            {merchant.mobile_number && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Mobile:
                </span>
                <span className="font-medium">{merchant.mobile_number}</span>
              </div>
            )}

            {merchant.email_id && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email:
                </span>
                <span className="font-medium">{merchant.email_id}</span>
              </div>
            )}

            {merchant.password && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Password:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium font-mono">
                    {showPassword ? merchant.password : '••••••••'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {merchant.qr_code_url && (
              <div className="space-y-2">
                <span className="text-muted-foreground flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  QR Code:
                </span>
                <div className="flex justify-center">
                  <img
                    src={getQRCodeImageUrl(merchant.qr_code_url)}
                    alt={`${merchant.merchant_type} QR Code`}
                    className="w-48 h-48 border rounded-lg object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
