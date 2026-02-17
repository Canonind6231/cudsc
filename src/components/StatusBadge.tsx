import { useLanguage } from "@/contexts/LanguageContext";

type ProjectStatus = "review" | "pending_approval" | "approved" | "rejected";

interface StatusBadgeProps {
  status: ProjectStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { t } = useLanguage();
  
  const statusClasses: Record<ProjectStatus, string> = {
    review: "status-review",
    pending_approval: "status-pending",
    approved: "status-approved",
    rejected: "status-rejected",
  };

  const statusKeys: Record<ProjectStatus, string> = {
    review: 'status.review',
    pending_approval: 'status.pendingApproval',
    approved: 'status.approved',
    rejected: 'status.rejected',
  };

  return (
    <span className={`status-badge ${statusClasses[status]}`}>
      {t(statusKeys[status])}
    </span>
  );
};

export default StatusBadge;
