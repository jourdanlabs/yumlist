import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2, MousePointerClick } from "lucide-react";

export default function AffiliateProgramRow({ program, clicks, onToggle, onDelete }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm flex items-center gap-2">
          {program.retailer}
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MousePointerClick className="w-3 h-3" /> {clicks}
          </span>
        </div>
        <p className="text-xs text-muted-foreground break-all mt-0.5">{program.link_template}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Switch checked={!!program.active} onCheckedChange={(v) => onToggle(program, v)} aria-label="Active" />
        <Button variant="ghost" size="icon" aria-label="Delete program" onClick={() => onDelete(program)}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}