import { Project, User, AuditLogEntry } from "@/types/project";

export const mockProjects: Project[] = [
  {
    id: "1",
    title: "Science Lab Equipment Upgrade",
    description: "Purchase new laboratory equipment for the chemistry and physics labs including microscopes, beakers, and safety equipment.",
    requester: "Dr. Somchai Prasert",
    department: "Science Department",
    budget: 250000,
    status: "review",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    attachments: [
      { id: "a1", name: "equipment_list.pdf", size: 245000, type: "application/pdf", uploadedAt: new Date("2024-01-15") },
      { id: "a2", name: "budget_breakdown.xlsx", size: 45000, type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", uploadedAt: new Date("2024-01-15") },
    ],
    auditLog: [
      { id: "log1", projectId: "1", action: "created", toStatus: "review", performedBy: "Dr. Somchai Prasert", performedByRole: "requester", timestamp: new Date("2024-01-15T09:00:00") },
    ],
  },
  {
    id: "2",
    title: "Annual Sports Day Event",
    description: "Organization of the annual sports day including venue setup, awards, refreshments, and guest coordination.",
    requester: "Khun Napat Wongchai",
    department: "Physical Education",
    budget: 150000,
    status: "pending_approval",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-14"),
    attachments: [
      { id: "a3", name: "event_proposal.pdf", size: 320000, type: "application/pdf", uploadedAt: new Date("2024-01-12") },
    ],
    reviewerComment: "Budget seems reasonable. Recommending for approval.",
    auditLog: [
      { id: "log2", projectId: "2", action: "created", toStatus: "review", performedBy: "Khun Napat Wongchai", performedByRole: "requester", timestamp: new Date("2024-01-12T10:30:00") },
      { id: "log3", projectId: "2", action: "forwarded", fromStatus: "review", toStatus: "pending_approval", performedBy: "Khun Siriporn Malee", performedByRole: "reviewer", comment: "Budget seems reasonable. Recommending for approval.", timestamp: new Date("2024-01-14T14:15:00") },
    ],
  },
  {
    id: "3",
    title: "Library Digital Resources",
    description: "Subscription to online academic databases and e-book collections for student research.",
    requester: "Khun Pranee Suksawat",
    department: "Library",
    budget: 85000,
    status: "approved",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-13"),
    attachments: [
      { id: "a4", name: "subscription_details.pdf", size: 180000, type: "application/pdf", uploadedAt: new Date("2024-01-08") },
    ],
    reviewerComment: "Essential for academic development.",
    approverComment: "Approved. Proceed with procurement.",
    auditLog: [
      { id: "log4", projectId: "3", action: "created", toStatus: "review", performedBy: "Khun Pranee Suksawat", performedByRole: "requester", timestamp: new Date("2024-01-08T08:45:00") },
      { id: "log5", projectId: "3", action: "forwarded", fromStatus: "review", toStatus: "pending_approval", performedBy: "Khun Siriporn Malee", performedByRole: "reviewer", comment: "Essential for academic development.", timestamp: new Date("2024-01-10T11:20:00") },
      { id: "log6", projectId: "3", action: "approved", fromStatus: "pending_approval", toStatus: "approved", performedBy: "Dr. Piyawan Srisawat", performedByRole: "approver", comment: "Approved. Proceed with procurement.", timestamp: new Date("2024-01-13T16:00:00") },
    ],
  },
  {
    id: "4",
    title: "Music Room Renovation",
    description: "Renovation of the music room including soundproofing, new instruments, and audio equipment.",
    requester: "Khun Ariya Charoenporn",
    department: "Arts Department",
    budget: 450000,
    status: "rejected",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-11"),
    attachments: [
      { id: "a5", name: "renovation_plan.pdf", size: 520000, type: "application/pdf", uploadedAt: new Date("2024-01-05") },
      { id: "a6", name: "contractor_quote.pdf", size: 125000, type: "application/pdf", uploadedAt: new Date("2024-01-05") },
    ],
    reviewerComment: "Budget exceeds allocated funds for this quarter.",
    approverComment: "Please resubmit with revised budget for next quarter.",
    auditLog: [
      { id: "log7", projectId: "4", action: "created", toStatus: "review", performedBy: "Khun Ariya Charoenporn", performedByRole: "requester", timestamp: new Date("2024-01-05T09:30:00") },
      { id: "log8", projectId: "4", action: "forwarded", fromStatus: "review", toStatus: "pending_approval", performedBy: "Khun Siriporn Malee", performedByRole: "reviewer", comment: "Budget exceeds allocated funds for this quarter.", timestamp: new Date("2024-01-08T13:45:00") },
      { id: "log9", projectId: "4", action: "rejected", fromStatus: "pending_approval", toStatus: "rejected", performedBy: "Dr. Piyawan Srisawat", performedByRole: "approver", comment: "Please resubmit with revised budget for next quarter.", timestamp: new Date("2024-01-11T10:30:00") },
    ],
  },
  {
    id: "5",
    title: "Student Exchange Program",
    description: "Funding for student exchange program with partner schools in Japan including travel, accommodation, and activities.",
    requester: "Dr. Wipawee Tanaka",
    department: "International Affairs",
    budget: 380000,
    status: "pending_approval",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-14"),
    attachments: [
      { id: "a7", name: "program_itinerary.pdf", size: 290000, type: "application/pdf", uploadedAt: new Date("2024-01-10") },
    ],
    auditLog: [
      { id: "log10", projectId: "5", action: "created", toStatus: "review", performedBy: "Dr. Wipawee Tanaka", performedByRole: "requester", timestamp: new Date("2024-01-10T11:00:00") },
      { id: "log11", projectId: "5", action: "forwarded", fromStatus: "review", toStatus: "pending_approval", performedBy: "Khun Siriporn Malee", performedByRole: "reviewer", timestamp: new Date("2024-01-14T09:30:00") },
    ],
  },
];

export const currentUser: User = {
  id: "u1",
  name: "Khun Siriporn Malee",
  email: "siriporn.m@cud.ac.th",
  role: "reviewer",
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    review: "Under Review",
    pending_approval: "Pending Approval",
    approved: "Approved",
    rejected: "Rejected",
  };
  return labels[status] || status;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};
