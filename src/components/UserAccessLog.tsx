import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Search, LogIn, ChevronLeft, ChevronRight, Users } from "lucide-react";

interface AccessEntry {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  action: string;
  created_at: string;
}

const fetchAccessLogs = async (): Promise<AccessEntry[]> => {
  const { data, error } = await supabase
    .from("user_access_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return data || [];
};

const UserAccessLog = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["user-access-log"],
    queryFn: fetchAccessLogs,
    staleTime: 2 * 60 * 1000,
  });

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  const filteredEntries = useMemo(() => {
    return entries.filter((e) =>
      e.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.user_email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [entries, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedEntries = filteredEntries.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t("admin.userAccessLog")}
        </CardTitle>
        <CardDescription>
          {t("admin.userAccessLogDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("admin.searchUsers") || "Search users..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Badge variant="secondary" className="whitespace-nowrap">
            {filteredEntries.length} {t("admin.entries") || "entries"}
          </Badge>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.user") || "User"}</TableHead>
                <TableHead>{t("admin.email") || "Email"}</TableHead>
                <TableHead>{t("admin.action") || "Action"}</TableHead>
                <TableHead>{t("admin.timestamp") || "Timestamp"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.user_name}</TableCell>
                  <TableCell className="text-muted-foreground">{entry.user_email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <LogIn className="h-4 w-4 text-primary" />
                      <Badge variant="outline">
                        {entry.action === "login" ? (t("admin.login") || "Login") : entry.action}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDateTime(entry.created_at)}
                  </TableCell>
                </TableRow>
              ))}
              {paginatedEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {t("admin.noActivity") || "No access logs found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {t("admin.page") || "Page"} {safeCurrentPage} / {totalPages}
            </p>
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
      </CardContent>
    </Card>
  );
};

export default UserAccessLog;
