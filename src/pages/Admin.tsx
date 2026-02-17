import { useState, useEffect, lazy, Suspense, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import CUDLogo from "@/components/CUDLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AdminSkeleton from "@/components/AdminSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, Shield, Loader2, UserCircle, Trash2, Ban, CheckCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Lazy load heavy components (charts use recharts ~150KB)
const AdminDashboardCharts = lazy(() => import("@/components/AdminDashboardCharts"));
const AdminActivityLog = lazy(() => import("@/components/AdminActivityLog"));
const UserAccessLog = lazy(() => import("@/components/UserAccessLog"));

type AppRole = "requester" | "reviewer" | "approver" | "admin";

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  department: string | null;
  role: AppRole;
  is_active: boolean;
}

const Admin = () => {
  const { t } = useLanguage();
  const { user, role: userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && userRole !== "admin") {
      navigate("/");
    }
  }, [authLoading, userRole, navigate]);

  useEffect(() => {
    if (userRole === "admin") {
      fetchUsers();
    }
  }, [userRole]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("name");

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          department: profile.department,
          role: (userRole?.role as AppRole) || "requester",
          is_active: profile.is_active ?? true,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: t("admin.error"),
        description: t("admin.fetchError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    if (userId === user?.id) {
      toast({
        title: t("admin.error"),
        description: t("admin.cannotChangeOwnRole"),
        variant: "destructive",
      });
      return;
    }

    setUpdatingUserId(userId);
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );

      toast({
        title: t("admin.success"),
        description: t("admin.roleUpdated"),
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: t("admin.error"),
        description: t("admin.updateError"),
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };
  const handleToggleActive = async (targetUser: UserWithRole) => {
    if (targetUser.id === user?.id) return;
    setTogglingUserId(targetUser.id);
    try {
      const newStatus = !targetUser.is_active;
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: newStatus })
        .eq("id", targetUser.id);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: newStatus } : u))
      );

      toast({
        title: t("admin.success"),
        description: newStatus ? t("admin.userEnabled") : t("admin.userDisabled"),
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast({
        title: t("admin.error"),
        description: t("admin.toggleError"),
        variant: "destructive",
      });
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleDeleteUser = async (targetUser: UserWithRole) => {
    setDeletingUserId(targetUser.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ userId: targetUser.id }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
      toast({
        title: t("admin.success"),
        description: t("delete.userSuccess"),
      });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: t("admin.error"),
        description: error.message || t("delete.userError"),
        variant: "destructive",
      });
    } finally {
      setDeletingUserId(null);
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(
    (u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.department?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && u.is_active) ||
        (statusFilter === "disabled" && !u.is_active);
      return matchesSearch && matchesStatus;
    }
  );

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case "admin":
        return "default";
      case "approver":
        return "default";
      case "reviewer":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (authLoading || isLoading) {
    return <AdminSkeleton />;
  }

  if (userRole !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-header sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CUDLogo className="h-10" />
              <div className="hidden md:flex items-center gap-2 text-white/80">
                <Shield className="h-5 w-5" />
                <span className="font-medium">{t("admin.title")}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("admin.backToDashboard")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("admin.manageRoles")}
            </CardTitle>
            <CardDescription>{t("admin.manageRolesDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("admin.searchUsers")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v: "all" | "active" | "disabled") => setStatusFilter(v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.filterAll")}</SelectItem>
                  <SelectItem value="active">{t("admin.filterActive")}</SelectItem>
                  <SelectItem value="disabled">{t("admin.filterDisabled")}</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="whitespace-nowrap">
                {filteredUsers.length} {t("admin.users")}
              </Badge>
            </div>

            {/* Users Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.user")}</TableHead>
                    <TableHead>{t("admin.email")}</TableHead>
                    <TableHead>{t("admin.department")}</TableHead>
                    <TableHead>{t("admin.currentRole")}</TableHead>
                    <TableHead className="w-[180px]">{t("admin.changeRole")}</TableHead>
                    <TableHead className="w-[100px]">{t("admin.status")}</TableHead>
                    <TableHead className="w-[80px]">{t("delete.action")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id} className={!u.is_active ? "opacity-60" : ""}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-5 w-5 text-muted-foreground" />
                          {u.name}
                          {u.id === user?.id && (
                            <Badge variant="outline" className="text-xs">
                              {t("admin.you")}
                            </Badge>
                          )}
                          {!u.is_active && (
                            <Badge variant="destructive" className="text-xs">
                              {t("admin.disabled")}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>{u.department || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(u.role)}>
                          {t(`admin.role.${u.role}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={u.role}
                          onValueChange={(value: AppRole) => handleRoleChange(u.id, value)}
                          disabled={u.id === user?.id || updatingUserId === u.id}
                        >
                          <SelectTrigger className="w-[150px]">
                            {updatingUserId === u.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="requester">{t("admin.role.requester")}</SelectItem>
                            <SelectItem value="reviewer">{t("admin.role.reviewer")}</SelectItem>
                            <SelectItem value="approver">{t("admin.role.approver")}</SelectItem>
                            <SelectItem value="admin">{t("admin.role.admin")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={u.is_active
                            ? "text-destructive hover:text-destructive hover:bg-destructive/10"
                            : "text-green-600 hover:text-green-600 hover:bg-green-50"
                          }
                          disabled={u.id === user?.id || togglingUserId === u.id}
                          onClick={() => handleToggleActive(u)}
                        >
                          {togglingUserId === u.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : u.is_active ? (
                            <Ban className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={u.id === user?.id || deletingUserId === u.id}
                          onClick={() => setUserToDelete(u)}
                        >
                          {deletingUserId === u.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {t("admin.noUsers")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Charts */}
        <div className="mt-8">
        <Suspense fallback={<div className="space-y-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-[300px] w-full" /></div>}>
            <AdminDashboardCharts />
          </Suspense>
        </div>

        {/* User Access Log */}
        <div className="mt-8">
          <Suspense fallback={<Card><CardContent className="pt-6 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>}>
            <UserAccessLog />
          </Suspense>
        </div>

        {/* Activity Log */}
        <div className="mt-8">
          <Suspense fallback={<Card><CardContent className="pt-6 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>}>
            <AdminActivityLog />
          </Suspense>
        </div>
      </main>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.user')} - {userToDelete?.name}</AlertDialogTitle>
            <AlertDialogDescription>{t('delete.userConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('form.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => userToDelete && handleDeleteUser(userToDelete)}
            >
              {t('delete.user')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;