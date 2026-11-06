import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function ReceiptDuplicatesDialog({ open, count, onOpenChange, onSkip, onAddAnyway }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Some items are already in your pantry</AlertDialogTitle>
          <AlertDialogDescription>
            {count} of these match items you already have. Add them again, or skip them and only
            add the new ones?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onSkip} className="bg-emerald-600 text-white hover:bg-emerald-700">
            Skip duplicates
          </AlertDialogAction>
          <AlertDialogAction onClick={onAddAnyway} className="bg-amber-600 text-white hover:bg-amber-700">
            Add anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}