import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import MyPartySubmissionRow from "@/components/party/MyPartySubmissionRow";

export default function MyPartySubmissions({ items, onSave, onRemove }) {
  if (!items || items.length === 0) return null;

  return (
    <Card>
      <CardContent className="pt-5 space-y-3">
        <div>
          <p className="text-sm font-medium">What you added</p>
          <p className="text-xs text-muted-foreground">
            You can change or remove anything you added from this device.
          </p>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <MyPartySubmissionRow
              key={item.id}
              item={item}
              onSave={(draft) => onSave(item, draft)}
              onRemove={() => onRemove(item)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}