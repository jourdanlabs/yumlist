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

export default function DuplicateItemDialog({ duplicate, open, onOpenChange, onConfirm }) {
  const qty = duplicate?.quantity
    ? ` (${duplicate.quantity} ${duplicate.unit || "units"} in stock)`
    : "";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Already in your pantry</AlertDialogTitle>
          <AlertDialogDescription>
            {`${duplicate?.name || "This item"} is already in the pantry${qty}. Add it again as a separate item?`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Add anyway</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}