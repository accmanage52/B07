import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DebitCard } from './AccountsSection';
import { Eye, EyeOff, CreditCard } from 'lucide-react';

interface DebitCardViewProps {
  debitCard: DebitCard;
  bankName: string;
  accountHolderName: string;
  atmPin?: string;
}

export function DebitCardView({ debitCard, bankName, accountHolderName, atmPin }: DebitCardViewProps) {
  const [showDetails, setShowDetails] = useState(false);

  const formatCardNumber = (number: string, show: boolean) => {
    if (!show) {
      return `•••• •••• •••• ${number.slice(-4)}`;
    }
    return number.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatCVV = (cvv: string, show: boolean) => {
    return show ? cvv : '•••';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2"
        >
          {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showDetails ? 'Hide' : 'Show'} Details
        </Button>
      </div>
      
      <div className="relative w-full max-w-sm mx-auto">
        {/* Card Front */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-primary-foreground shadow-xl">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              <span className="text-sm font-medium">{bankName}</span>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-80">DEBIT</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-xs opacity-80 mb-1">CARD NUMBER</div>
              <div className="text-lg font-mono tracking-wider">
                {formatCardNumber(debitCard.card_number, showDetails)}
              </div>
            </div>
            
            <div className="flex justify-between">
              <div>
                <div className="text-xs opacity-80 mb-1">CARD HOLDER</div>
                <div className="text-sm font-medium uppercase">
                  {accountHolderName}
                </div>
              </div>
              <div>
                <div className="text-xs opacity-80 mb-1">EXPIRES</div>
                <div className="text-sm font-mono">
                  {debitCard.expiry_date}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Card Back (CVV & ATM PIN) */}
        <div className="mt-4 bg-gray-800 rounded-xl p-6 text-white">
          <div className="bg-black h-8 w-full mb-4 rounded"></div>
          <div className="flex justify-between items-end">
            <div className="bg-white text-black px-3 py-1 rounded">
              <span className="text-xs mr-2">CVV:</span>
              <span className="font-mono">{formatCVV(debitCard.cvv, showDetails)}</span>
            </div>
            {atmPin && (
              <div className="bg-white text-black px-3 py-1 rounded">
                <span className="text-xs mr-2">ATM PIN:</span>
                <span className="font-mono">{formatCVV(atmPin, showDetails)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        Virtual representation of the debit card
      </div>
    </div>
  );
}