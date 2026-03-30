import { useState } from "react";
import { Users, CheckSquare, Banknote, Landmark, PlusCircle, LogOut, History } from "lucide-react";
import AdminUsers from "./users";
import AdminValidateTasks from "./validate-tasks";
import AdminDeposits from "./deposits";
import AdminWithdrawals from "./withdrawals";
import AdminAddTask from "./add-task";
import AdminUserHistory from "./user-history";
import { useAuthStore } from "@/lib/auth-store";
import { useLocation } from "wouter";

interface SelectedUser {
  id: number;
  name: string;
}

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const { clearAuth } = useAuthStore();
  const [, setLocation] = useLocation();

  const tabs = [
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'validate', label: 'Validation', icon: CheckSquare },
    { id: 'deposits', label: 'Dépôts', icon: Landmark },
    { id: 'withdrawals', label: 'Retraits', icon: Banknote },
    { id: 'add-task', label: 'Ajout Tâche', icon: PlusCircle },
  ];

  const handleLogout = () => {
    clearAuth();
    setLocation("/login");
  };

  const handleViewHistory = (userId: number, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
  };

  const handleBackFromHistory = () => {
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-display font-bold text-destructive">Panel Admin</h2>
        <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {!selectedUser ? (
        <>
          <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === 'users' && <AdminUsers onViewHistory={handleViewHistory} />}
            {activeTab === 'validate' && <AdminValidateTasks />}
            {activeTab === 'deposits' && <AdminDeposits />}
            {activeTab === 'withdrawals' && <AdminWithdrawals />}
            {activeTab === 'add-task' && <AdminAddTask />}
          </div>
        </>
      ) : (
        <AdminUserHistory
          userId={selectedUser.id}
          userName={selectedUser.name}
          onBack={handleBackFromHistory}
        />
      )}
    </div>
  );
}
