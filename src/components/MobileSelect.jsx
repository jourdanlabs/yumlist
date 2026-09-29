import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileSelect({ value, onChange, options, placeholder = "Select…", label, id }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const display = selected ? selected.label : placeholder;

  return (
    <>
      <button
        type="button"
        id={id}
        onClick={() => setOpen(true)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>{display}</span>
        <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
      </button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[60vh]">
          <DrawerHeader className="text-center">
            <DrawerTitle>{label || placeholder}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto overscroll-none px-4 pb-[env(safe-area-inset-bottom)] max-h-[50vh]">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors min-h-[44px]",
                  opt.value === value ? "bg-primary/10 text-primary" : "hover:bg-accent"
                )}
              >
                {opt.label}
                {opt.value === value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}