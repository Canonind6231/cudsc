import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/types/project";

export interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  requester_id: string;
  requester_name: string;
  department: string;
  budget: number;
  status: "review" | "pending_approval" | "approved" | "rejected";
  reviewer_comment: string | null;
  approver_comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogData {
  id: string;
  project_id: string;
  action: string;
  from_status: string | null;
  to_status: string | null;
  performed_by: string | null;
  performed_by_name: string;
  performed_by_role: string;
  comment: string | null;
  created_at: string;
}

export interface AttachmentData {
  id: string;
  project_id: string;
  file_name: string;
  file_size: number;
  file_type: string | null;
  storage_path: string;
  uploaded_at: string;
}

export const useProjects = (userId: string | undefined, userRole: UserRole) => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!userId) return;

    try {
      let query = supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      // Requesters can only see their own projects
      if (userRole === "requester") {
        query = query.eq("requester_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      const filteredData = (data || []).filter(p => p.status !== 'pending') as ProjectData[];
      setProjects(filteredData);
    } catch (error: any) {
      toast.error("Failed to fetch projects");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, userRole]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const fetchAuditLog = async (projectId: string): Promise<AuditLogData[]> => {
    const { data, error } = await supabase
      .from("project_audit_log")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch audit log:", error);
      return [];
    }
    return data || [];
  };

  const fetchAttachments = async (projectId: string): Promise<AttachmentData[]> => {
    const { data, error } = await supabase
      .from("project_attachments")
      .select("*")
      .eq("project_id", projectId);

    if (error) {
      console.error("Failed to fetch attachments:", error);
      return [];
    }
    return data || [];
  };

  const createProject = async (
    projectData: {
      title: string;
      description: string;
      department: string;
      budget: number;
      requester_name: string;
    },
    files: File[]
  ) => {
    if (!userId) {
      toast.error("User not authenticated");
      return null;
    }

    try {
      // Get the current authenticated user to ensure we have the correct ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Authentication session expired");
        return null;
      }

      // Create project using the authenticated user's ID
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          title: projectData.title,
          description: projectData.description,
          department: projectData.department,
          budget: projectData.budget,
          requester_id: user.id, // Use user.id from auth session directly
          requester_name: projectData.requester_name,
          status: "review",
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Upload files and create attachment records
      for (const file of files) {
        const filePath = `${user.id}/${project.id}/${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from("project-attachments")
          .upload(filePath, file);

        if (uploadError) {
          console.error("File upload error:", uploadError);
          continue;
        }

        await supabase.from("project_attachments").insert({
          project_id: project.id,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: filePath,
        });
      }

      // Create audit log entry
      await supabase.from("project_audit_log").insert({
        project_id: project.id,
        action: "created",
        to_status: "review",
        performed_by: user.id,
        performed_by_name: projectData.requester_name,
        performed_by_role: "requester",
      });

      toast.success("Project created successfully!");
      fetchProjects();
      return project;
    } catch (error: any) {
      toast.error(error.message || "Failed to create project");
      console.error(error);
      return null;
    }
  };

  const updateProjectStatus = async (
    projectId: string,
    newStatus: "review" | "pending_approval" | "approved" | "rejected",
    comment: string,
    performerName: string,
    performerRole: UserRole
  ) => {
    if (!userId) return false;

    try {
      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const project = projects.find((p) => p.id === projectId);
      if (!project) return false;

      const updates: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // Determine effective role based on the action being performed
      const effectiveRole: UserRole = 
        (newStatus === "pending_approval") ? "reviewer" :
        ((newStatus === "approved" || newStatus === "rejected") && project.status === "pending_approval") ? "approver" :
        performerRole;

      if (effectiveRole === "reviewer") {
        updates.reviewer_comment = comment;
      } else if (effectiveRole === "approver") {
        updates.approver_comment = comment;
      }

      const { error: updateError } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", projectId);

      if (updateError) throw updateError;

      // Create audit log entry
      const actionMap: Record<string, string> = {
        pending_approval: "forwarded",
        approved: "approved",
        rejected: "rejected",
      };

      await supabase.from("project_audit_log").insert({
        project_id: projectId,
        action: actionMap[newStatus] || "updated",
        from_status: project.status,
        to_status: newStatus,
        performed_by: user.id,
        performed_by_name: performerName,
        performed_by_role: effectiveRole === "admin" ? "approver" : effectiveRole,
        comment: comment || null,
      });

      fetchProjects();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update project");
      console.error(error);
      return false;
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!userId) return false;
    try {
      // Delete attachments from storage
      const { data: attachments } = await supabase
        .from("project_attachments")
        .select("storage_path")
        .eq("project_id", projectId);

      if (attachments && attachments.length > 0) {
        await supabase.storage
          .from("project-attachments")
          .remove(attachments.map((a) => a.storage_path));
      }

      // Delete attachment records
      await supabase.from("project_attachments").delete().eq("project_id", projectId);
      // Delete audit log
      await supabase.from("project_audit_log").delete().eq("project_id", projectId);
      // Delete project
      const { error } = await supabase.from("projects").delete().eq("id", projectId);
      if (error) throw error;

      fetchProjects();
      return true;
    } catch (error: any) {
      console.error("Failed to delete project:", error);
      return false;
    }
  };

  const resubmitProject = async (
    projectId: string,
    updates: { title: string; description: string; department: string; budget: number },
    performerName: string
  ) => {
    if (!userId) return false;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from("projects")
        .update({
          title: updates.title,
          description: updates.description,
          department: updates.department,
          budget: updates.budget,
          status: "review" as const,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (error) throw error;

      // Get user's role for audit log
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      await supabase.from("project_audit_log").insert({
        project_id: projectId,
        action: "resubmitted",
        from_status: "rejected",
        to_status: "review",
        performed_by: user.id,
        performed_by_name: performerName,
        performed_by_role: roleData?.role || "requester",
        comment: null,
      });

      fetchProjects();
      return true;
    } catch (error: any) {
      console.error("Failed to resubmit project:", error);
      return false;
    }
  };

  const getFilteredProjects = useCallback(
    (role: UserRole) => {
      // Higher roles inherit lower role access, so all roles above requester see all projects
      return projects;
    },
    [projects]
  );

  return {
    projects,
    isLoading,
    fetchProjects,
    fetchAuditLog,
    fetchAttachments,
    createProject,
    updateProjectStatus,
    deleteProject,
    resubmitProject,
    getFilteredProjects,
  };
};
