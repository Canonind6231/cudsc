import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import CUDLogo from "@/components/CUDLogo";
import ProjectCard from "@/components/ProjectCard";
import StatsCard from "@/components/StatsCard";
import RequestForm from "@/components/RequestForm";
import ProjectDetailDialog from "@/components/ProjectDetailDialog";
import UserProfileDialog from "@/components/UserProfileDialog";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useProjects, ProjectData, AuditLogData, AttachmentData } from "@/hooks/useProjects";
import { supabase } from "@/integrations/supabase/client";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { exportBulkProjectsToExcel } from "@/lib/exportExcel";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/types/project";
import {
  Plus,
  FileStack,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  UserCircle,
  UserCog,
  ChevronDown,
  LogOut,
  Loader2,
  Shield,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, profile, role: userRole, isLoading: authLoading, signOut } = useAuth();
  const { 
    projects, 
    isLoading: projectsLoading, 
    fetchAuditLog, 
    fetchAttachments,
    createProject, 
    updateProjectStatus,
    deleteProject,
    resubmitProject,
    getFilteredProjects 
  } = useProjects(user?.id, userRole);
  
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogData[]>([]);
  const [selectedAttachments, setSelectedAttachments] = useState<AttachmentData[]>([]);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
  const [isBulkExporting, setIsBulkExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Prefetch Admin page for admin users
  useEffect(() => {
    if (userRole === "admin") {
      import("./Admin");
    }
  }, [userRole]);

  const stats = useMemo(() => ({
    total: projects.length,
    review: projects.filter((p) => p.status === "review").length,
    pending_approval: projects.filter((p) => p.status === "pending_approval").length,
    approved: projects.filter((p) => p.status === "approved").length,
    rejected: projects.filter((p) => p.status === "rejected").length,
  }), [projects]);

  const handleProjectClick = async (project: ProjectData) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
    
    // Fetch audit log and attachments
    const [auditLog, attachments] = await Promise.all([
      fetchAuditLog(project.id),
      fetchAttachments(project.id),
    ]);
    setSelectedAuditLog(auditLog);
    setSelectedAttachments(attachments);
  };

  const handleStatusChange = async (
    projectId: string, 
    newStatus: "review" | "pending_approval" | "approved" | "rejected", 
    comment: string
  ) => {
    const success = await updateProjectStatus(
      projectId,
      newStatus,
      comment,
      profile?.name || user?.email || "Unknown",
      userRole
    );
    if (success) {
      setShowProjectDetail(false);
    }
  };

  const handleCreateProject = async (data: {
    title: string;
    description: string;
    department: string;
    budget: string;
    files: File[];
  }) => {
    await createProject(
      {
        title: data.title,
        description: data.description,
        department: data.department,
        budget: parseFloat(data.budget) || 0,
        requester_name: profile?.name || user?.email || "Unknown",
      },
      data.files
    );
    setShowRequestForm(false);
  };

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const handleBulkExport = async () => {
    if (selectedProjectIds.size === 0) return;
    setIsBulkExporting(true);
    try {
      const selectedProjects = filteredProjects.filter((p) => selectedProjectIds.has(p.id));
      const auditLogs: Record<string, AuditLogData[]> = {};
      const attachmentsMap: Record<string, AttachmentData[]> = {};
      
      await Promise.all(
        selectedProjects.map(async (p) => {
          const [logs, files] = await Promise.all([
            fetchAuditLog(p.id),
            fetchAttachments(p.id),
          ]);
          auditLogs[p.id] = logs;
          attachmentsMap[p.id] = files;
        })
      );
      
      exportBulkProjectsToExcel(selectedProjects, auditLogs, attachmentsMap);
      setSelectedProjectIds(new Set());
    } finally {
      setIsBulkExporting(false);
    }
  };

  const roleLabels: Record<UserRole, string> = useMemo(() => ({
    requester: t('header.requester'),
    reviewer: t('header.reviewer'),
    approver: t('header.approver'),
    admin: t('header.admin'),
  }), [t]);


  const filteredProjects = useMemo(() => {
    const base = getFilteredProjects(userRole);
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      (p.description?.toLowerCase().includes(q)) ||
      p.requester_name.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q)
    );
  }, [getFilteredProjects, userRole, searchQuery]);

  const tabLabels: Record<string, string> = useMemo(() => ({
    all: t('projects.all'),
    review: t('stats.underReview'),
    pending_approval: t('stats.pendingApproval'),
    approved: t('stats.approved'),
    rejected: t('stats.rejected'),
  }), [t]);

  if (authLoading || projectsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-header sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <CUDLogo className="h-10" />
            
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* User Info & Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white hover:bg-white/20 max-w-[180px] sm:max-w-[250px]">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover mr-2 shrink-0" />
                    ) : (
                      <UserCircle className="h-5 w-5 mr-2 shrink-0" />
                    )}
                    <span className="truncate min-w-0">{profile?.name || user?.email}</span>
                    <ChevronDown className="h-4 w-4 ml-1 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {userRole === "admin" && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Shield className="h-4 w-4 mr-2" />
                        {t('header.adminPanel')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => setShowProfile(true)}>
                    <UserCog className="h-4 w-4 mr-2" />
                    {t('profile.menuItem')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('header.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8 animate-fade-in">
          {/* New Request Card */}
          <div
            onClick={() => setShowRequestForm(true)}
            className="rounded-xl border border-primary/30 bg-primary/5 p-4 transition-all hover:shadow-md hover:bg-primary/10 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('header.newRequest')}</p>
                <p className="text-2xl font-bold text-primary mt-1">+</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50">
                <Plus className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <StatsCard
            title={t('stats.totalProjects')}
            value={stats.total}
            icon={FileStack}
            variant="default"
          />
          <StatsCard
            title={t('stats.underReview')}
            value={stats.review}
            icon={Search}
            variant="review"
          />
          <StatsCard
            title={t('stats.pendingApproval')}
            value={stats.pending_approval}
            icon={Clock}
            variant="pending"
          />
          <StatsCard
            title={t('stats.approved')}
            value={stats.approved}
            icon={CheckCircle}
            variant="approved"
          />
          <StatsCard
            title={t('stats.rejected')}
            value={stats.rejected}
            icon={XCircle}
            variant="rejected"
          />
        </div>

        {/* Projects Section */}
        <div className="space-y-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">
              {t('projects.title')}
            </h2>
            <div className="flex items-center gap-3">
              {selectedProjectIds.size > 0 && (
                <Button
                  onClick={handleBulkExport}
                  disabled={isBulkExporting}
                  variant="outline"
                  size="sm"
                >
                  {isBulkExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {t('export.bulkExcel')} ({selectedProjectIds.size})
                </Button>
              )}
              <p className="text-sm text-muted-foreground">
                {t('projects.viewingAs')} <span className="font-medium text-primary">{roleLabels[userRole]}</span>
              </p>
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('projects.search') || "Search projects..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">{tabLabels.all}</TabsTrigger>
              <TabsTrigger value="review">{tabLabels.review}</TabsTrigger>
              <TabsTrigger value="pending_approval">{tabLabels.pending_approval}</TabsTrigger>
              <TabsTrigger value="approved">{tabLabels.approved}</TabsTrigger>
              <TabsTrigger value="rejected">{tabLabels.rejected}</TabsTrigger>
            </TabsList>

            {["all", "review", "pending_approval", "approved", "rejected"].map((tab) => {
              const tabProjects = filteredProjects.filter((p) => tab === "all" || p.status === tab);
              const allSelected = tabProjects.length > 0 && tabProjects.every((p) => selectedProjectIds.has(p.id));
              return (
              <TabsContent key={tab} value={tab} className="mt-0">
                {tabProjects.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedProjectIds((prev) => {
                          const next = new Set(prev);
                          if (allSelected) {
                            tabProjects.forEach((p) => next.delete(p.id));
                          } else {
                            tabProjects.forEach((p) => next.add(p.id));
                          }
                          return next;
                        });
                      }}
                    >
                      {allSelected ? t('export.deselectAll') : t('export.selectAll')}
                    </Button>
                    {selectedProjectIds.size > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {selectedProjectIds.size} {t('export.selected')}
                      </span>
                    )}
                  </div>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tabProjects.map((project) => (
                      <div key={project.id} className="relative">
                        <div
                          className="absolute top-3 left-3 z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedProjectIds.has(project.id)}
                            onChange={() => toggleProjectSelection(project.id)}
                            className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                          />
                        </div>
                        <ProjectCard
                          project={project}
                          onClick={() => handleProjectClick(project)}
                        />
                      </div>
                    ))}
                </div>
                {tabProjects.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileStack className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('projects.noProjects')}</p>
                  </div>
                )}
              </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </main>

      {/* Request Form Dialog */}
      <RequestForm
        open={showRequestForm}
        onOpenChange={setShowRequestForm}
        onSubmit={handleCreateProject}
      />

      {/* Project Detail Dialog */}
      <ProjectDetailDialog
        project={selectedProject}
        auditLog={selectedAuditLog}
        attachments={selectedAttachments}
        open={showProjectDetail}
        onOpenChange={setShowProjectDetail}
        userRole={userRole}
        currentUserId={user?.id}
        onStatusChange={handleStatusChange}
        onDeleteProject={deleteProject}
        onResubmitProject={resubmitProject}
      />

      {/* User Profile Dialog */}
      <UserProfileDialog
        open={showProfile}
        onOpenChange={setShowProfile}
        profile={profile}
        onProfileUpdated={() => {
          // Re-fetch auth state instead of full page reload
          supabase.auth.getSession();
        }}
      />
    </div>
  );
};

export default Index;
