import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSetStripeConfiguration, useIsStripeConfigured } from '../hooks/useQueries';

interface StripeSetupModalProps {
  open: boolean;
  onClose: () => void;
}

export default function StripeSetupModal({ open, onClose }: StripeSetupModalProps) {
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('IN, US, GB, CA, AU');
  const setStripeConfig = useSetStripeConfiguration();
  const { refetch } = useIsStripeConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) {
      toast.error('Please enter your Stripe secret key');
      return;
    }
    if (!secretKey.startsWith('sk_')) {
      toast.error('Invalid Stripe secret key format. It should start with sk_');
      return;
    }

    const allowedCountries = countries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    try {
      await setStripeConfig.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries,
      });
      await refetch();
      toast.success('Stripe configured successfully! 🎉');
      onClose();
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to configure Stripe');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-saffron" />
            </div>
            <DialogTitle className="font-display text-deep-brown">Configure Stripe Payments</DialogTitle>
          </div>
          <DialogDescription className="font-body text-muted-foreground">
            Set up Stripe to accept payments from customers. You'll need your Stripe secret key from the{' '}
            <a
              href="https://dashboard.stripe.com/apikeys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-saffron hover:underline"
            >
              Stripe Dashboard
            </a>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="secretKey" className="font-body text-deep-brown font-medium">
              Stripe Secret Key
            </Label>
            <Input
              id="secretKey"
              type="password"
              placeholder="sk_live_... or sk_test_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="font-body border-saffron/30 focus:border-saffron"
              required
            />
            <p className="text-xs text-muted-foreground font-body">
              Use <code className="bg-cream px-1 rounded text-xs">sk_test_...</code> for testing.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="countries" className="font-body text-deep-brown font-medium">
              Allowed Countries
            </Label>
            <Input
              id="countries"
              type="text"
              placeholder="IN, US, GB, CA"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
              className="font-body border-saffron/30 focus:border-saffron"
            />
            <p className="text-xs text-muted-foreground font-body">
              Comma-separated ISO country codes (e.g., IN, US, GB).
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs font-body text-amber-800">
              ⚠️ Keep your secret key confidential. It will be stored securely on the backend.
            </p>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="font-body border-saffron/30"
              disabled={setStripeConfig.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={setStripeConfig.isPending}
              className="bg-saffron hover:bg-saffron-dark text-white font-body"
            >
              {setStripeConfig.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
