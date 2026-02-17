import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DEPARTMENTS } from "@/lib/departments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CUDLogo from "@/components/CUDLogo";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const validatePassword = (pwd: string): string | null => {
  if (pwd.length < 10) return "Password must be at least 10 characters";
  if (!/[A-Z]/.test(pwd)) return "Password must contain an uppercase letter";
  if (!/[a-z]/.test(pwd)) return "Password must contain a lowercase letter";
  if (!/[0-9]/.test(pwd)) return "Password must contain a number";
  return null;
};

const Auth = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ 
    email: "", 
    password: "", 
    confirmPassword: "",
    name: "",
    department: ""
  });

  // Prefetch the Index page so it loads instantly after login
  useEffect(() => {
    import("./Index");
  }, []);

  // Detect recovery mode from auth event
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryMode(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error(t('auth.passwordsDoNotMatch') || "Passwords do not match");
      return;
    }
    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      toast.error(pwdError);
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success(t('auth.passwordUpdated') || "Password updated successfully!");
      setIsRecoveryMode(false);
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error(t('auth.enterEmail') || "Please enter your email address");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });
      if (error) throw error;
      toast.success(t('auth.resetEmailSent') || "Password reset link sent! Please check your email.");
      setShowResetPassword(false);
      setResetEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      // Log user access
      if (data.user) {
        const profile = data.user.user_metadata;
        supabase.from("user_access_log").insert({
          user_id: data.user.id,
          user_name: profile?.name || data.user.email || "Unknown",
          user_email: data.user.email || "",
          action: "login",
        }).then(({ error: logError }) => {
          if (logError) console.error("Failed to log access:", logError);
        });
      }
      
      toast.success("Login successful!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const pwdError = validatePassword(signupData.password);
    if (pwdError) {
      toast.error(pwdError);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name: signupData.name,
            department: signupData.department,
          },
        },
      });

      if (error) throw error;
      
      toast.success("Please check your email to verify your account");
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="gradient-header shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <CUDLogo className="h-10" />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Auth Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isRecoveryMode ? (t('auth.setNewPassword') || 'Set New Password') : (t('auth.welcome') || 'Welcome')}
            </CardTitle>
            <CardDescription>
              {isRecoveryMode 
                ? (t('auth.setNewPasswordDescription') || 'Enter your new password below')
                : (t('auth.description') || 'Sign in to access the project approval system')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isRecoveryMode ? (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t('auth.newPassword') || 'New Password'}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">{t('auth.confirmNewPassword') || 'Confirm New Password'}</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('auth.updatePassword') || 'Update Password'}
                </Button>
              </form>
            ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">{t('auth.login') || 'Login'}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.signup') || 'Sign Up'}</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t('auth.email') || 'Email'}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t('auth.password') || 'Password'}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('auth.login') || 'Login'}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetPassword(true);
                        setResetEmail(loginData.email);
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      {t('auth.forgotPassword') || 'Forgot your password?'}
                    </button>
                  </div>
                </form>

                {showResetPassword && (
                  <div className="mt-4 p-4 border rounded-lg bg-muted/50 space-y-3">
                    <h3 className="font-medium text-sm">{t('auth.resetPassword') || 'Reset Password'}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t('auth.resetDescription') || 'Enter your email and we\'ll send you a reset link.'}
                    </p>
                    <form onSubmit={handleResetPassword} className="space-y-3">
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={isLoading} className="flex-1">
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {t('auth.sendResetLink') || 'Send Reset Link'}
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setShowResetPassword(false)}>
                          {t('form.cancel') || 'Cancel'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{t('auth.name') || 'Full Name'}</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Rhine & Seine"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-department">{t('auth.department') || 'Department'}</Label>
                    <Select
                      value={signupData.department}
                      onValueChange={(value) => setSignupData({ ...signupData, department: value })}
                    >
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
                    <Label htmlFor="signup-email">{t('auth.email') || 'Email'}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('auth.password') || 'Password'}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">{t('auth.confirmPassword') || 'Confirm Password'}</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('auth.signup') || 'Sign Up'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
