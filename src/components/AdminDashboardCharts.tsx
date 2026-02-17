import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from "recharts";

interface AuditEntry {
  action: string;
  performed_by_role: string;
  created_at: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(262, 83%, 58%)",
  "hsl(199, 89%, 48%)",
];

const fetchChartData = async (): Promise<AuditEntry[]> => {
  const { data, error } = await supabase
    .from("project_audit_log")
    .select("action, performed_by_role, created_at")
    .order("created_at", { ascending: true })
    .limit(1000);
  if (error) throw error;
  return data || [];
};

const AdminDashboardCharts = () => {
  const { t } = useLanguage();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["admin-chart-data"],
    queryFn: fetchChartData,
    staleTime: 5 * 60 * 1000,
  });

  const actionLabels: Record<string, string> = useMemo(() => ({
    created: t("audit.created"),
    submitted: t("audit.submitted"),
    forwarded: t("audit.forwarded"),
    approved: t("audit.approved"),
    rejected: t("audit.rejected"),
    commented: t("audit.commented"),
  }), [t]);

  const roleLabels: Record<string, string> = useMemo(() => ({
    requester: t("admin.role.requester"),
    reviewer: t("admin.role.reviewer"),
    approver: t("admin.role.approver"),
    admin: t("admin.role.admin"),
  }), [t]);

  const timelineData = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const dayMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo.getTime() + i * 86400000);
      dayMap.set(d.toISOString().slice(0, 10), 0);
    }
    entries.forEach((e) => {
      const day = e.created_at.slice(0, 10);
      if (dayMap.has(day)) dayMap.set(day, (dayMap.get(day) || 0) + 1);
    });
    return Array.from(dayMap.entries()).map(([date, count]) => ({
      date: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(date)),
      count,
    }));
  }, [entries]);

  const actionData = useMemo(() => {
    const counts = new Map<string, number>();
    entries.forEach((e) => counts.set(e.action, (counts.get(e.action) || 0) + 1));
    return Array.from(counts.entries())
      .map(([action, value]) => ({ name: actionLabels[action] || action, value }))
      .sort((a, b) => b.value - a.value);
  }, [entries, actionLabels]);

  const roleData = useMemo(() => {
    const counts = new Map<string, number>();
    entries.forEach((e) => counts.set(e.performed_by_role, (counts.get(e.performed_by_role) || 0) + 1));
    return Array.from(counts.entries())
      .map(([role, value]) => ({ name: roleLabels[role] || role, value }))
      .sort((a, b) => b.value - a.value);
  }, [entries, roleLabels]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = entries.filter((e) => e.created_at.slice(0, 10) === today).length;
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const weekCount = entries.filter((e) => new Date(e.created_at) >= sevenDaysAgo).length;
    return { total: entries.length, today: todayCount, thisWeek: weekCount };
  }, [entries]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="pt-6"><Skeleton className="h-[280px] w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Activity className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">{t("admin.chart.totalActivities")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><TrendingUp className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
                <p className="text-sm text-muted-foreground">{t("admin.chart.thisWeek")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><BarChart3 className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.today}</p>
                <p className="text-sm text-muted-foreground">{t("admin.chart.today")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            {t("admin.chart.activityTrend")}
          </CardTitle>
          <CardDescription>{t("admin.chart.activityTrendDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} className="fill-muted-foreground" interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
              <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} name={t("admin.chart.activities")} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Action Breakdown + Role Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><PieChartIcon className="h-4 w-4" />{t("admin.chart.actionBreakdown")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={actionData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {actionData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-4 w-4" />{t("admin.chart.roleDistribution")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={roleData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} className="fill-muted-foreground" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} className="fill-muted-foreground" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name={t("admin.chart.activities")} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardCharts;
