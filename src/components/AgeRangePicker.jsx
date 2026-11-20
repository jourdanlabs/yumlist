import React from "react";
import { Button } from "@/components/ui/button";
import { AGE_RANGES } from "@/lib/ageRange";

export default function AgeRangePicker({ value, onChange, disabled }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {AGE_RANGES.map((range) => (
        <Button
          key={range.value}
          type="button"
          variant={value === range.value ? "default" : "outline"}
          disabled={disabled}
          onClick={() => onChange(range.value)}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}