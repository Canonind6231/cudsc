import { AuditLogData } from "@/hooks/useProjects";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  FilePlus, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  MessageSquare,
  User,
  Clock
} from "lucide-react";
import { formatDate } from "@/lib/mockData";

interface AuditLogTimelineProps {
  entries: AuditLogData[];
}

const AuditLogTimeline = ({ entries }: AuditLogTimelineProps) => {
  const { t } = useLanguage();

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
      case 'submitted':
        return <FilePlus className="h-4 w-4" />;
      case 'forwarded':
        return <ArrowRight className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'commented':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created':
        return t('audit.created');
      case 'submitted':
        return t('audit.submitted');
      case 'forwarded':
        return t('audit.forwarded');
      case 'approved':
        return t('audit.approved');
      case 'rejected':
        return t('audit.rejected');
      case 'commented':
        return t('audit.commented');
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
      case 'submitted':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'forwarded':
        return 'bg-status-review-bg text-status-review border-status-review/20';
      case 'approved':
        return 'bg-status-approved-bg text-status-approved border-status-approved/20';
      case 'rejected':
        return 'bg-status-rejected-bg text-status-rejected border-status-rejected/20';
      case 'commented':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      requester: t('header.requester'),
      reviewer: t('header.reviewer'),
      approver: t('header.approver'),
    };
    return labels[role] || role;
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  // Sort entries by timestamp, most recent first
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-foreground flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        {t('audit.activityHistory')}
      </h4>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[17px] top-6 bottom-6 w-0.5 bg-border" />
        
        <div className="space-y-4">
          {sortedEntries.map((entry) => (
            <div key={entry.id} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-full border-2 ${getActionColor(entry.action)}`}>
                {getActionIcon(entry.action)}
              </div>
              
              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="bg-card border border-border/50 rounded-lg p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium text-sm text-foreground">
                      {getActionLabel(entry.action)}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(new Date(entry.created_at))}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <User className="h-3 w-3" />
                    <span>{entry.performed_by_name}</span>
                    <span className="px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">
                      {getRoleLabel(entry.performed_by_role)}
                    </span>
                  </div>
                  
                  {entry.comment && (
                    <div className="mt-2 p-2 bg-muted/50 rounded text-sm text-muted-foreground italic">
                      "{entry.comment}"
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDate(new Date(entry.created_at))}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuditLogTimeline;
