import { Project, AuditLogEntry } from "@/types/project";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "./StatusBadge";
import AuditLog from "./AuditLog";
import { formatCurrency, formatDate, formatFileSize } from "@/lib/mockData";
import {
  FileText,
  Calendar,
  Building2,
  Coins,
  User,
  Download,
  CheckCircle2,
  XCircle,
  ArrowRight,
  MessageSquare,
  History,
  Info,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProjectDetailProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: "requester" | "reviewer" | "approver";
  onStatusChange?: (projectId: string, status: string, comment: string, newLogEntry: AuditLogEntry) => void;
}

const ProjectDetail = ({
  project,
  open,
  onOpenChange,
  userRole,
  onStatusChange,
}: ProjectDetailProps) => {
  const { t } = useLanguage();
  const [comment, setComment] = useState("");

  if (!project) return null;

  const canReview = userRole === "reviewer" && project.status === "review";
  const canApprove = userRole === "approver" && project.status === "pending_approval";

  const handleAction = (action: "approve" | "reject" | "forward") => {
    let newStatus = "";
    let message = "";
    let logAction: AuditLogEntry['action'] = 'commented';

    if (action === "forward") {
      newStatus = "pending_approval";
      message = t('audit.forwarded');
      logAction = "forwarded";
    } else if (action === "approve") {
      newStatus = "approved";
      message = t('audit.approved');
      logAction = "approved";
    } else {
      newStatus = "rejected";
      message = t('audit.rejected');
      logAction = "rejected";
    }

    const newLogEntry: AuditLogEntry = {
      id: crypto.randomUUID(),
      projectId: project.id,
      action: logAction,
      fromStatus: project.status,
      toStatus: newStatus as any,
      performedBy: userRole === 'reviewer' ? 'Khun Siriporn Malee' : 'Dr. Piyawan Srisawat',
      performedByRole: userRole,
      comment: comment || undefined,
      timestamp: new Date(),
    };

    onStatusChange?.(project.id, newStatus, comment, newLogEntry);
    toast.success(message);
    setComment("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-xl font-semibold pr-8">
              {project.title}
            </DialogTitle>
            <StatusBadge status={project.status} />
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              {t('detail.details')}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              {t('detail.history')} ({project.auditLog?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-4">
            {/* Project Info Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('detail.requester')}</p>
                  <p className="text-sm font-medium">{project.requester}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('detail.department')}</p>
                  <p className="text-sm font-medium">{project.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Coins className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('detail.budget')}</p>
                  <p className="text-sm font-medium">{formatCurrency(project.budget)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('detail.submitted')}</p>
                  <p className="text-sm font-medium">{formatDate(project.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">{t('detail.description')}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">
                {t('detail.attachments')} ({project.attachments.length})
              </h4>
              <div className="space-y-2">
                {project.attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Section */}
          {(project.reviewerComment || project.approverComment) && (
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">{t('detail.reviewerComment').replace(' Comment', 's')}</h4>
              <div className="space-y-3">
                {project.reviewerComment && (
                  <div className="p-3 bg-status-review-bg rounded-lg border border-status-review/20">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-status-review" />
                      <span className="text-xs font-medium text-status-review">
                        {t('detail.reviewerComment')}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{project.reviewerComment}</p>
                  </div>
                )}
                {project.approverComment && (
                  <div className={`p-3 rounded-lg border ${
                    project.status === 'approved' 
                      ? 'bg-status-approved-bg border-status-approved/20'
                      : 'bg-status-rejected-bg border-status-rejected/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className={`h-4 w-4 ${
                        project.status === 'approved' ? 'text-status-approved' : 'text-status-rejected'
                      }`} />
                      <span className={`text-xs font-medium ${
                        project.status === 'approved' ? 'text-status-approved' : 'text-status-rejected'
                      }`}>
                        {t('detail.approverComment')}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{project.approverComment}</p>
                  </div>
                )}
              </div>
            </div>
          )}

            {/* Action Area for Reviewer/Approver */}
            {(canReview || canApprove) && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="comment">{t('detail.addComment')}</Label>
                  <Textarea
                    id="comment"
                    placeholder={t('detail.commentPlaceholder')}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  {canReview && (
                    <>
                      <Button
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleAction("reject")}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {t('detail.reject')}
                      </Button>
                      <Button onClick={() => handleAction("forward")}>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {t('detail.forward')}
                      </Button>
                    </>
                  )}
                  {canApprove && (
                    <>
                      <Button
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleAction("reject")}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {t('detail.reject')}
                      </Button>
                      <Button onClick={() => handleAction("approve")}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {t('detail.approve')}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {project.auditLog && project.auditLog.length > 0 ? (
              <AuditLog entries={project.auditLog} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t('projects.noProjects')}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetail;
