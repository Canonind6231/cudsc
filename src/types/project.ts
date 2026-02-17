export type ProjectStatus = 'review' | 'pending_approval' | 'approved' | 'rejected';
export type UserRole = 'requester' | 'reviewer' | 'approver' | 'admin';

export interface ProjectAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export interface AuditLogEntry {
  id: string;
  projectId: string;
  action: 'created' | 'submitted' | 'forwarded' | 'approved' | 'rejected' | 'commented';
  fromStatus?: ProjectStatus;
  toStatus?: ProjectStatus;
  performedBy: string;
  performedByRole: UserRole;
  comment?: string;
  timestamp: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  requester: string;
  department: string;
  budget: number;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  attachments: ProjectAttachment[];
  reviewerComment?: string;
  approverComment?: string;
  auditLog: AuditLogEntry[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}
