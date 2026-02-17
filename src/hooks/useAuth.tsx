import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { UserRole } from "@/types/project";

interface Profile {
  id: string;
  name: string;
  email: string;
  department: string | null;
  avatar_url: string | null;
}

// Role hierarchy - higher index = higher authority
const ROLE_HIERARCHY: UserRole[] = ["requester", "reviewer", "approver", "admin"];

// Get all roles a user can access based on their highest role
export const getAccessibleRoles = (highestRole: UserRole): UserRole[] => {
  const roleIndex = ROLE_HIERARCHY.indexOf(highestRole);
  return ROLE_HIERARCHY.slice(0, roleIndex + 1);
};

// Check if a role can access another role's functionality
export const canAccessRole = (userRole: UserRole, targetRole: UserRole): boolean => {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const targetIndex = ROLE_HIERARCHY.indexOf(targetRole);
  return userIndex >= targetIndex;
};

interface AuthState {
  user: User | null;
  profile: Profile | null;
  role: UserRole; // Highest role
  accessibleRoles: UserRole[]; // All roles user can access
  isLoading: boolean;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    role: "requester",
    accessibleRoles: ["requester"],
    isLoading: true,
  });
  const fetchingRef = useRef<string | null>(null);

  const loadUserData = async (user: User) => {
    // Deduplicate: skip if already fetching for this user
    if (fetchingRef.current === user.id) return;
    fetchingRef.current = user.id;

    try {
      const [profileResult, roleResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", user.id).single(),
      ]);

      // Check if user account is disabled
      if (profileResult.data && profileResult.data.is_active === false) {
        await supabase.auth.signOut();
        setAuthState({
          user: null,
          profile: null,
          role: "requester",
          accessibleRoles: ["requester"],
          isLoading: false,
        });
        return;
      }

      const highestRole = (roleResult.data?.role as UserRole) || "requester";
      setAuthState({
        user,
        profile: profileResult.data,
        role: highestRole,
        accessibleRoles: getAccessibleRoles(highestRole),
        isLoading: false,
      });
    } finally {
      fetchingRef.current = null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        loadUserData(session.user);
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    // Listen for changes (sign in/out only, skip INITIAL_SESSION to avoid duplicate)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted || event === "INITIAL_SESSION") return;
        if (event === "SIGNED_IN" && session?.user) {
          loadUserData(session.user);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          loadUserData(session.user);
        } else if (!session) {
          setAuthState({
            user: null,
            profile: null,
            role: "requester",
            accessibleRoles: ["requester"],
            isLoading: false,
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return {
    ...authState,
    signOut,
  };
};
