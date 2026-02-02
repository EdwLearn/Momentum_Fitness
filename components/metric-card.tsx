import { cn } from "@/lib/utils"
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  variant?: "default" | "warning" | "success" | "danger"
  onClick?: () => void
}

export function MetricCard({ title, value, change, changeLabel, icon: Icon, variant = "default", onClick }: MetricCardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <div
      className={cn(
        "rounded-xl bg-card border border-border p-6 glow-green-sm",
        onClick && "cursor-pointer hover:border-primary/50 transition-colors"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p
            className={cn(
              "mt-2 text-3xl font-bold text-glow",
              variant === "warning" && "text-warning",
              variant === "danger" && "text-destructive",
              variant === "success" && "text-primary",
              variant === "default" && "text-primary",
            )}
          >
            {value}
          </p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-primary" />
              ) : isNegative ? (
                <TrendingDown className="h-4 w-4 text-destructive" />
              ) : null}
              <span
                className={cn(
                  "text-sm font-medium",
                  isPositive && "text-primary",
                  isNegative && "text-destructive",
                  !isPositive && !isNegative && "text-muted-foreground",
                )}
              >
                {isPositive && "+"}
                {change}%
              </span>
              {changeLabel && <span className="text-sm text-muted-foreground">{changeLabel}</span>}
            </div>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  )
}
