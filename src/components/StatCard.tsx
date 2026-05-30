import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning-foreground",
  danger: "text-destructive",
  info: "text-info",
};

export function StatCard({ label, value, hint, icon, tone = "default", className }: StatCardProps) {
  return (
    <Card className={cn("border-border/60 shadow-sm", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className={cn("text-2xl font-semibold tracking-tight", toneClasses[tone])}>
              {value}
            </p>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
