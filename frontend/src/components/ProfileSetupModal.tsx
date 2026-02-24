import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { UserRole } from '../backend';
import { Loader2, User } from 'lucide-react';

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.buyer);
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;
    await saveProfile.mutateAsync({ name: name.trim(), contact: contact.trim(), role });
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-saffron/20 flex items-center justify-center">
              <User className="w-5 h-5 text-saffron" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl text-deep-brown">
                Welcome to Kodinar Bazaar!
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground font-body">
                Set up your profile to get started
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="font-body font-medium text-foreground">
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="font-body"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact" className="font-body font-medium text-foreground">
              Contact (Phone / Email)
            </Label>
            <Input
              id="contact"
              placeholder="e.g. 9876543210"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              className="font-body"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role" className="font-body font-medium text-foreground">
              I want to
            </Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className="font-body">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.buyer} className="font-body">
                  🛒 Buy products (Buyer)
                </SelectItem>
                <SelectItem value={UserRole.seller} className="font-body">
                  🏪 Sell products (Seller)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {saveProfile.isError && (
            <p className="text-sm text-destructive font-body">
              {(saveProfile.error as Error)?.message || 'Failed to save profile. Please try again.'}
            </p>
          )}

          <Button
            type="submit"
            disabled={saveProfile.isPending || !name.trim() || !contact.trim()}
            className="w-full bg-saffron hover:bg-saffron-dark text-white font-body font-semibold"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Join Kodinar Bazaar'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
