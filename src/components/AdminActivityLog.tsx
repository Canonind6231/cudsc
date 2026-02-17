import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Search, Clock, FilePlus, ArrowRight, CheckCircle2, XCircle, MessageSquare, ChevronLeft, ChevronRight, CalendarIcon, X, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditEntry {
  id: string;
  project_id: string;
  action: string;
  from_status: string | null;
  to_status: string | null;
  performed_by_name: string;
  performed_by_role: string;
  comment: string | null;
  created_at: string;
  project_title?: string;
}

const fetchAuditLogs = async (): Promise<AuditEntry[]> => {
  const { data: logs, error: logsError } = await supabase
    .from("project_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (logsError) throw logsError;

  const projectIds = [...new Set((logs || []).map((l) => l.project_id))];
  if (projectIds.length === 0) return [];

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title")
    .in("id", projectIds);

  const projectMap = new Map((projects || []).map((p) => [p.id, p.title]));

  return (logs || []).map((log) => ({
    ...log,
    project_title: projectMap.get(log.project_id) || "-",
  }));
};

const AdminActivityLog = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const pageSize = 20;

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["admin-activity-log"],
    queryFn: fetchAuditLogs,
    staleTime: 5 * 60 * 1000,
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created": case "submitted": return <FilePlus className="h-4 w-4" />;
      case "forwarded": return <ArrowRight className="h-4 w-4" />;
      case "approved": return <CheckCircle2 className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      case "commented": return <MessageSquare className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case "approved": return "default";
      case "rejected": return "destructive";
      case "forwarded": return "secondary";
      default: return "outline";
    }
  };

  const getStatusLabel = (status: string | null) => {
    if (!status) return "-";
    const map: Record<string, string> = {
      review: t("status.review"), pending_approval: t("status.pendingApproval"),
      approved: t("status.approved"), rejected: t("status.rejected"), pending: t("status.review"),
    };
    return map[status] || status;
  };

  const getActionLabel = (action: string) => {
    const key = `audit.${action}`;
    const translated = t(key);
    return translated !== key ? translated : action;
  };

  const formatDateTime = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(new Date(dateStr));
  };

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchesSearch =
        e.performed_by_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.project_title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.comment || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAction = actionFilter === "all" || e.action === actionFilter;
      const entryDate = new Date(e.created_at);
      const matchesDateFrom = !dateFrom || entryDate >= dateFrom;
      const matchesDateTo = !dateTo || entryDate <= new Date(dateTo.getTime() + 86400000 - 1);
      return matchesSearch && matchesAction && matchesDateFrom && matchesDateTo;
    });
  }, [entries, searchQuery, actionFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedEntries = filteredEntries.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  useEffect(() => { setCurrentPage(1); }, [searchQuery, actionFilter, dateFrom, dateTo]);

  const STATUS_LABELS: Record<string, string> = {
    review: t("status.review"), pending_approval: t("status.pendingApproval"),
    approved: t("status.approved"), rejected: t("status.rejected"), pending: t("status.review"),
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet(t("admin.activityLog"));
      ws.columns = [
        { header: t("admin.timestamp"), width: 22 },
        { header: t("admin.action"), width: 18 },
        { header: t("admin.project"), width: 30 },
        { header: t("admin.performedBy"), width: 20 },
        { header: t("admin.role"), width: 15 },
        { header: t("admin.statusChange"), width: 30 },
        { header: t("admin.comment"), width: 40 },
      ];
      ws.getRow(1).font = { bold: true };
      filteredEntries.forEach((entry) => {
        const statusChange = entry.from_status || entry.to_status
          ? `${STATUS_LABELS[entry.from_status || ""] || entry.from_status || "-"} → ${STATUS_LABELS[entry.to_status || ""] || entry.to_status || "-"}`
          : "";
        ws.addRow([
          formatDateTime(entry.created_at), getActionLabel(entry.action),
          entry.project_title || "-", entry.performed_by_name,
          t(`admin.role.${entry.performed_by_role}`), statusChange, entry.comment || "",
        ]);
      });
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Activity_Log_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("admin.activityLog")}
          </CardTitle>
          <CardDescription className="mt-1.5">{t("admin.activityLogDescription")}</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={isExporting || filteredEntries.length === 0}>
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
          {t("export.excel")}
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("admin.searchActivity")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("projects.all")}</SelectItem>
              <SelectItem value="created">{t("audit.created")}</SelectItem>
              <SelectItem value="submitted">{t("audit.submitted")}</SelectItem>
              <SelectItem value="forwarded">{t("audit.forwarded")}</SelectItem>
              <SelectItem value="approved">{t("audit.approved")}</SelectItem>
              <SelectItem value="rejected">{t("audit.rejected")}</SelectItem>
              <SelectItem value="commented">{t("audit.commented")}</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[150px] justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "MMM dd, yyyy") : t("admin.from")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[150px] justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "MMM dd, yyyy") : t("admin.to")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
          {(dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}>
              <X className="h-4 w-4" />
            </Button>
          )}
          <Badge variant="secondary" className="whitespace-nowrap">
            {filteredEntries.length} {t("admin.entries")}
          </Badge>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.action")}</TableHead>
                    <TableHead>{t("admin.project")}</TableHead>
                    <TableHead>{t("admin.performedBy")}</TableHead>
                    <TableHead>{t("admin.role")}</TableHead>
                    <TableHead>{t("admin.statusChange")}</TableHead>
                    <TableHead>{t("admin.comment")}</TableHead>
                    <TableHead>{t("admin.timestamp")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(entry.action)}
                          <Badge variant={getActionBadgeVariant(entry.action)}>{getActionLabel(entry.action)}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{entry.project_title}</TableCell>
                      <TableCell>{entry.performed_by_name}</TableCell>
                      <TableCell><Badge variant="outline">{t(`admin.role.${entry.performed_by_role}`)}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.from_status || entry.to_status
                          ? `${getStatusLabel(entry.from_status)} → ${getStatusLabel(entry.to_status)}`
                          : "-"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{entry.comment || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDateTime(entry.created_at)}</TableCell>
                    </TableRow>
                  ))}
                  {paginatedEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t("admin.noActivity")}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">{t("admin.page")} {safeCurrentPage} / {totalPages}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={safeCurrentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled={safeCurrentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminActivityLog;
