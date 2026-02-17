import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: 'default' | 'pending' | 'review' | 'approved' | 'rejected';
}

const StatsCard = ({ title, value, icon: Icon, variant = 'default' }: StatsCardProps) => {
  const variantClasses: Record<string, string> = {
    default: "bg-card border-border/50",
    pending: "bg-status-pending-bg border-status-pending/20",
    review: "bg-status-review-bg border-status-review/20",
    approved: "bg-status-approved-bg border-status-approved/20",
    rejected: "bg-status-rejected-bg border-status-rejected/20",
  };

  const iconClasses: Record<string, string> = {
    default: "text-primary",
    pending: "text-status-pending",
    review: "text-status-review",
    approved: "text-status-approved",
    rejected: "text-status-rejected",
  };

  return (
    <div className={`rounded-xl border p-4 ${variantClasses[variant]} transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-background/50`}>
          <Icon className={`h-6 w-6 ${iconClasses[variant]}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
