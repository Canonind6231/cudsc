import ExcelJS from "exceljs";
import { ProjectData, AuditLogData, AttachmentData } from "@/hooks/useProjects";
import { formatCurrency, formatDate } from "@/lib/mockData";

const STATUS_LABELS: Record<string, string> = {
  review: "Under Review",
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
};

async function downloadWorkbook(wb: ExcelJS.Workbook, fileName: string) {
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export const exportProjectToExcel = async (
  project: ProjectData,
  auditLog: AuditLogData[],
  attachments: AttachmentData[]
) => {
  const wb = new ExcelJS.Workbook();

  // Sheet 1: Project Details
  const detailsWs = wb.addWorksheet("Project Details");
  detailsWs.columns = [{ width: 20 }, { width: 60 }];
  detailsWs.addRow(["Field", "Value"]);
  const projectRows = [
    ["Project Name", project.title],
    ["Description", project.description || ""],
    ["Department", project.department],
    ["Budget (THB)", project.budget],
    ["Status", STATUS_LABELS[project.status] || project.status],
    ["Requester", project.requester_name],
    ["Reviewer Comment", project.reviewer_comment || ""],
    ["Approver Comment", project.approver_comment || ""],
    ["Created", formatDate(new Date(project.created_at))],
    ["Last Updated", formatDate(new Date(project.updated_at))],
  ];
  projectRows.forEach((row) => detailsWs.addRow(row));

  // Sheet 2: History / Audit Log
  const historyWs = wb.addWorksheet("History");
  historyWs.columns = [
    { width: 20 }, { width: 15 }, { width: 18 }, { width: 18 },
    { width: 20 }, { width: 12 }, { width: 40 },
  ];
  historyWs.addRow(["Date", "Action", "From Status", "To Status", "Performed By", "Role", "Comment"]);
  auditLog.forEach((entry) =>
    historyWs.addRow([
      formatDate(new Date(entry.created_at)),
      entry.action,
      entry.from_status ? (STATUS_LABELS[entry.from_status] || entry.from_status) : "",
      entry.to_status ? (STATUS_LABELS[entry.to_status] || entry.to_status) : "",
      entry.performed_by_name,
      entry.performed_by_role,
      entry.comment || "",
    ])
  );

  // Sheet 3: Attached Files
  const filesWs = wb.addWorksheet("Attachments");
  filesWs.columns = [{ width: 40 }, { width: 20 }, { width: 15 }, { width: 20 }];
  filesWs.addRow(["File Name", "File Type", "File Size (bytes)", "Uploaded At"]);
  attachments.forEach((file) =>
    filesWs.addRow([
      file.file_name,
      file.file_type || "",
      file.file_size,
      formatDate(new Date(file.uploaded_at)),
    ])
  );

  const fileName = `${project.title.replace(/[^a-zA-Z0-9ก-๙]/g, "_")}_report.xlsx`;
  await downloadWorkbook(wb, fileName);
};

export const exportBulkProjectsToExcel = async (
  projects: ProjectData[],
  auditLogs: Record<string, AuditLogData[]>,
  attachments: Record<string, AttachmentData[]>
) => {
  const wb = new ExcelJS.Workbook();

  // Sheet 1: All Projects Summary
  const summaryWs = wb.addWorksheet("Projects Summary");
  summaryWs.columns = [
    { width: 30 }, { width: 50 }, { width: 20 }, { width: 15 }, { width: 18 },
    { width: 20 }, { width: 30 }, { width: 30 }, { width: 15 }, { width: 15 },
  ];
  summaryWs.addRow([
    "Project Name", "Description", "Department", "Budget (THB)", "Status",
    "Requester", "Reviewer Comment", "Approver Comment", "Created", "Last Updated",
  ]);
  projects.forEach((p) =>
    summaryWs.addRow([
      p.title, p.description || "", p.department, p.budget,
      STATUS_LABELS[p.status] || p.status, p.requester_name,
      p.reviewer_comment || "", p.approver_comment || "",
      formatDate(new Date(p.created_at)), formatDate(new Date(p.updated_at)),
    ])
  );

  // Sheet 2: All History
  const historyWs = wb.addWorksheet("History");
  historyWs.columns = [
    { width: 30 }, { width: 20 }, { width: 15 }, { width: 18 },
    { width: 18 }, { width: 20 }, { width: 12 }, { width: 40 },
  ];
  historyWs.addRow(["Project Name", "Date", "Action", "From Status", "To Status", "Performed By", "Role", "Comment"]);
  for (const project of projects) {
    const logs = auditLogs[project.id] || [];
    for (const entry of logs) {
      historyWs.addRow([
        project.title, formatDate(new Date(entry.created_at)), entry.action,
        entry.from_status ? (STATUS_LABELS[entry.from_status] || entry.from_status) : "",
        entry.to_status ? (STATUS_LABELS[entry.to_status] || entry.to_status) : "",
        entry.performed_by_name, entry.performed_by_role, entry.comment || "",
      ]);
    }
  }

  // Sheet 3: All Attachments
  const filesWs = wb.addWorksheet("Attachments");
  filesWs.columns = [{ width: 30 }, { width: 40 }, { width: 20 }, { width: 15 }, { width: 20 }];
  filesWs.addRow(["Project Name", "File Name", "File Type", "File Size (bytes)", "Uploaded At"]);
  for (const project of projects) {
    const files = attachments[project.id] || [];
    for (const file of files) {
      filesWs.addRow([
        project.title, file.file_name, file.file_type || "",
        file.file_size, formatDate(new Date(file.uploaded_at)),
      ]);
    }
  }

  const fileName = `Projects_Bulk_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
  await downloadWorkbook(wb, fileName);
};
