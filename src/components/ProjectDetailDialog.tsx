import { ProjectData, AuditLogData, AttachmentData } from "@/hooks/useProjects";
import { canAccessRole } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "./StatusBadge";
import AuditLogTimeline from "./AuditLogTimeline";
import { formatCurrency, formatDate, formatFileSize } from "@/lib/mockData";
import { supabase } from "@/integrations/supabase/client";
import { exportProjectToExcel } from "@/lib/exportExcel";
import { DEPARTMENTS } from "@/lib/departments";
import {
  FileText,
  Calendar,
  Building2,
  Coins,
  User,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  ArrowRight,
  MessageSquare,
  History,
  Info,
  Trash2,
  Loader2,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "@/types/project";

interface ProjectDetailDialogProps {
  project: ProjectData | null;
  auditLog: AuditLogData[];
  attachments: AttachmentData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: UserRole;
  currentUserId?: string;
  onStatusChange?: (projectId: string, status: "review" | "pending_approval" | "approved" | "rejected", comment: string) => void;
  onDeleteProject?: (projectId: string) => Promise<boolean>;
  onResubmitProject?: (projectId: string, updates: { title: string; description: string; department: string; budget: number }, performerName: string) => Promise<boolean>;
}

const ProjectDetailDialog = ({
  project,
  auditLog,
  attachments,
  open,
  onOpenChange,
  userRole,
  currentUserId,
  onStatusChange,
  onDeleteProject,
  onResubmitProject,
}: ProjectDetailDialogProps) => {
  const { t } = useLanguage();
  const [comment, setComment] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editBudget, setEditBudget] = useState("");

  if (!project) return null;

  const canReview = canAccessRole(userRole, "reviewer") && project.status === "review";
  const canApprove = canAccessRole(userRole, "approver") && project.status === "pending_approval";
  const canEdit = project.status === "rejected" && (
    (userRole === "requester" && currentUserId === project.requester_id) ||
    userRole === "reviewer" ||
    userRole === "approver" ||
    userRole === "admin"
  );

  const startEditing = () => {
    setEditTitle(project.title);
    setEditDescription(project.description || "");
    setEditDepartment(project.department);
    setEditBudget(String(project.budget));
    setIsEditing(true);
  };

  const handleResubmit = async () => {
    if (!onResubmitProject) return;
    setIsResubmitting(true);
    const success = await onResubmitProject(project.id, {
      title: editTitle,
      description: editDescription,
      department: editDepartment,
      budget: parseFloat(editBudget) || 0,
    }, project.requester_name);
    setIsResubmitting(false);
    if (success) {
      toast.success(t('edit.resubmitSuccess'));
      setIsEditing(false);
      onOpenChange(false);
    } else {
      toast.error(t('edit.resubmitError'));
    }
  };

  const handleAction = (action: "approve" | "reject" | "forward") => {
    let newStatus: "review" | "pending_approval" | "approved" | "rejected" = "review";
    let message = "";

    if (action === "forward") {
      newStatus = "pending_approval";
      message = t('audit.forwarded');
    } else if (action === "approve") {
      newStatus = "approved";
      message = t('audit.approved');
    } else {
      newStatus = "rejected";
      message = t('audit.rejected');
    }

    onStatusChange?.(project.id, newStatus, comment);
    toast.success(message);
    setComment("");
  };

  const handleDownload = async (attachment: AttachmentData) => {
    try {
      const { data, error } = await supabase.storage
        .from("project-attachments")
        .download(attachment.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(t('detail.downloadError'));
      console.error(error);
    }
  };

  const handleDeleteProject = async () => {
    if (!onDeleteProject || !project) return;
    setIsDeleting(true);
    const success = await onDeleteProject(project.id);
    setIsDeleting(false);
    if (success) {
      toast.success(t('delete.projectSuccess'));
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } else {
      toast.error(t('delete.projectError'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex flex-col gap-3">
            <DialogTitle className="text-lg sm:text-xl font-semibold pr-8 break-words">
              {project.title}
            </DialogTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={project.status} />
              {canEdit && !isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startEditing}
                  className="h-8 text-xs"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  {t('edit.editProject')}
                </Button>
              )}
              {userRole === "admin" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground h-8 text-xs"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  {t('delete.project')}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportProjectToExcel(project, auditLog, attachments)}
                title={t('export.excel')}
                className="h-8 text-xs"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                {t('export.excel')}
              </Button>
            </div>
          </div>
          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive mb-3">{t('delete.projectConfirm')}</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                  {t('form.cancel')}
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteProject} disabled={isDeleting}>
                  {isDeleting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  {t('delete.project')}
                </Button>
              </div>
            </div>
          )}
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              {t('detail.details')}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              {t('detail.history')} ({auditLog.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-4">
            {/* Edit Mode */}
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('form.projectTitle')}</Label>
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.description')}</Label>
                  <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.department')}</Label>
                  <Select value={editDepartment} onValueChange={setEditDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.selectDepartment')} />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {t(dept.key)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('form.budget')}</Label>
                  <Input type="number" value={editBudget} onChange={(e) => setEditBudget(e.target.value)} />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isResubmitting} className="w-full sm:w-auto">
                    {t('edit.cancelEdit')}
                  </Button>
                  <Button onClick={handleResubmit} disabled={isResubmitting || !editTitle.trim()} className="w-full sm:w-auto">
                    {isResubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {t('edit.resubmit')}
                  </Button>
                </div>
              </div>
            ) : (
            <>
            {/* Project Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('detail.requester')}</p>
                  <p className="text-sm font-medium">{project.requester_name}</p>
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
                  <p className="text-sm font-medium">{formatDate(new Date(project.created_at))}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">{t('detail.description')}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.description || t('detail.noComment')}
              </p>
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">
                {t('detail.attachments')} ({attachments.length})
              </h4>
              <div className="space-y-2">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{file.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.file_size)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(file)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {attachments.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('detail.noComment')}</p>
                )}
              </div>
            </div>

            {/* Comments Section */}
            {(project.reviewer_comment || project.approver_comment) && (
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">{t('detail.comments')}</h4>
                <div className="space-y-3">
                  {project.reviewer_comment && (
                    <div className="p-3 bg-status-review-bg rounded-lg border border-status-review/20">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-status-review" />
                        <span className="text-xs font-medium text-status-review">
                          {t('detail.reviewerComment')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{project.reviewer_comment}</p>
                    </div>
                  )}
                  {project.approver_comment && (
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
                      <p className="text-sm text-foreground">{project.approver_comment}</p>
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

                <div className="flex flex-col sm:flex-row justify-end gap-2">
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
            </>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {auditLog.length > 0 ? (
              <AuditLogTimeline entries={auditLog} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t('detail.noHistory')}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailDialog;
