import { ReactNode, useEffect } from "react";
import { TopHeader } from "./top-header";
import { BottomNav } from "./bottom-nav";
import { useAuthStore } from "@/lib/auth-store";
import { useGetMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, setUser, clearAuth } = useAuthStore();
  const [location, setLocation] = useLocation();

  // Fetch user profile to keep balance updated
  const { data: user, isError } = useGetMe({
    query: {
      enabled: isAuthenticated,
      refetchInterval: 30000, // Refresh every 30s to update balance
    }
  });

  useEffect(() => {
    if (user) {
      setUser(user);
    }
    if (isError) {
      clearAuth();
      setLocation("/login");
    }
  }, [user, isError, setUser, clearAuth, setLocation]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 relative overflow-x-hidden">
      <TopHeader />
      
      <main className="max-w-md mx-auto p-4 sm:max-w-2xl md:max-w-4xl lg:max-w-7xl pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}
