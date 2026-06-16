"use client";

import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORAGE_KEYS } from "@/lib/constants";

export function SetupNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEYS.setupNotice) === "1";
    setVisible(!dismissed);
  }, []);

  if (!visible) return null;

  return (
    <div className="border-b border-primary/20 bg-primary/5">
      <div className="mx-auto flex max-w-7xl gap-3 px-3 py-3 sm:px-6">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1 text-sm leading-relaxed">
          <p className="font-medium">Your shop, your phone</p>
          <p className="text-muted-foreground">
            Sharing the Receity link does not share your business details or
            inventory. Each person sets up their own shop on their own device.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          aria-label="Dismiss"
          onClick={() => {
            localStorage.setItem(STORAGE_KEYS.setupNotice, "1");
            setVisible(false);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
