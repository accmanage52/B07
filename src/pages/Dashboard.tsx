import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AccountsSection } from '@/components/dashboard/AccountsSection';
import { MerchantsSection } from '@/components/dashboard/MerchantsSection';
import { UserManagement } from '@/components/dashboard/UserManagement';
import { UserDataSection } from '@/components/dashboard/UserDataSection';
import { ChangePasswordDialog } from '@/components/dashboard/ChangePasswordDialog';
import { AppSidebar } from '@/components/AppSidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, Settings, Sparkles } from 'lucide-react';
import { DashboardAnalytics } from '@/components/dashboard/DashboardAnalytics';

interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'accountant';
  email: string;
  user_id: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      fetchProfile();
    }
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardAnalytics />;
      case 'accounts': return <AccountsSection />;
      case 'merchants': return <MerchantsSection />;
      case 'users': return profile?.role === 'admin' ? <UserManagement /> : null;
      case 'userdata': return profile?.role === 'admin' ? <UserDataSection /> : null;
      default: return <AccountsSection />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent glow-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    navigate('/');
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-hero">
        <AppSidebar 
          profile={profile} 
          onSignOut={handleSignOut}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="glass border-b border-border/20 backdrop-blur-xl">
            <div className="flex items-center justify-between px-3 md:px-6 py-4">
              <div className="flex items-center gap-2 md:gap-4 min-w-0">
                <SidebarTrigger className="md:hidden" />
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2 truncate">
                    Dashboard <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-secondary flex-shrink-0" />
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <ThemeToggle />
                <ChangePasswordDialog userProfile={profile} />
              </div>
            </div>
          </header>

          <main className="flex-1 p-3 md:p-6 overflow-hidden">
            <div className="animate-fade-in h-full">
              {renderActiveContent()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
