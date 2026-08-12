import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export type User = {
  id: string;
  username: string;
  role: "startup" | "investor" | "organizer";
};

export function useAuth(requireAuth: boolean = true) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/me", {
          credentials: "include"
        });
        
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setUser(data);
          
          // Basic RBAC redirection
          if (pathname.startsWith("/organizer") && data.role !== "organizer") {
            router.push(data.role === "startup" ? "/startup/profile" : "/investor/dashboard");
          }
        } else {
          if (requireAuth && isMounted) {
            router.push("/signin");
          }
        }
      } catch (e) {
        if (requireAuth && isMounted) {
          router.push("/signin");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    // Only run if not on public auth pages
    if (pathname !== "/signin" && pathname !== "/signup" && pathname !== "/") {
      checkAuth();
    } else {
      setLoading(false);
    }
    
    return () => { isMounted = false; };
  }, [pathname, requireAuth, router]);

  return { user, loading };
}
