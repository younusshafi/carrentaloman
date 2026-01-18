import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmationText: string;
  isLoading?: boolean;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmationText,
  isLoading = false,
}: ConfirmDeleteDialogProps) {
  const [inputValue, setInputValue] = useState('');

  const isConfirmEnabled = inputValue === confirmationText;

  const handleConfirm = () => {
    if (isConfirmEnabled) {
      onConfirm();
      setInputValue('');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setInputValue('');
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <span>{description}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4 space-y-3">
          <Label htmlFor="confirm-input">
            Type <span className="font-mono font-bold text-destructive">{confirmationText}</span> to confirm:
          </Label>
          <Input
            id="confirm-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={confirmationText}
            className="font-mono"
            autoComplete="off"
            disabled={isLoading}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isConfirmEnabled || isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Deleting...' : 'Confirm Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
