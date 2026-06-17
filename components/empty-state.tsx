import type { ReactNode } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

type EmptyStateProps = {
  emoji: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({
  emoji,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="receity-card border-dashed">
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="text-3xl" aria-hidden="true">
          {emoji}
        </span>
        <div className="max-w-sm space-y-1">
          <p className="font-medium">{title}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
