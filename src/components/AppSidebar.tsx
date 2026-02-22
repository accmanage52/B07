import { Building2, Users, CreditCard, Store, User, LogOut, Sparkles } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Home } from "lucide-react";

interface Profile {
  full_name: string;
  role: string;
  email: string;
}

interface AppSidebarProps {
  profile: Profile | null;
  onSignOut: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ profile, onSignOut, activeTab, onTabChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const mainItems = [
    { 
      id: 'accounts', 
      title: 'Accounts', 
      icon: CreditCard, 
      description: 'Manage bank accounts',
      gradient: 'bg-gradient-primary'
    },
    { 
      id: 'merchants', 
      title: 'Merchants', 
      icon: Store, 
      description: 'Payment gateways',
      gradient: 'bg-gradient-secondary'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
    },
  ];

  const adminItems = [
    { 
      id: 'users', 
      title: 'Users', 
      icon: Users, 
      description: 'Manage system users',
      gradient: 'bg-gradient-accent'
    },
    { 
      id: 'userdata', 
      title: 'User Data', 
      icon: User, 
      description: 'View user details',
      gradient: 'bg-gradient-primary'
    },
  ];

  const isActive = (itemId: string) => activeTab === itemId;

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId);
  };

  return (
    <Sidebar className={`${collapsed ? 'w-16' : 'w-64 md:w-72'} transition-all duration-300 glass border-r border-border/20 bg-background/95`}>
      <SidebarHeader className="p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Building2 className="h-6 w-6 md:h-8 md:w-8 text-primary animate-glow" />
            <Sparkles className="h-2 w-2 md:h-3 md:w-3 text-secondary absolute -top-1 -right-1 animate-float" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-foreground truncate">
                Financial CRM
              </h2>
              <p className="text-xs text-muted-foreground truncate">Modern Banking Solution</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 md:px-4">
        <SidebarGroup>
          <SidebarGroupLabel className={`text-muted-foreground font-semibold text-sm ${collapsed ? 'text-center' : ''}`}>
            {collapsed ? '•••' : 'Main Features'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 md:space-y-2">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    asChild
                    className={`group transition-all duration-200 rounded-xl ${
                      isActive(item.id) 
                        ? 'bg-primary/15 text-primary border border-primary/30 shadow-md' 
                        : 'hover:bg-muted/70 text-foreground hover:scale-[1.02]'
                    }`}
                  >
                    <button 
                      onClick={() => handleItemClick(item.id)}
                      className="w-full flex items-center gap-2 md:gap-3 p-2 md:p-3"
                    >
                      <div className={`p-1.5 md:p-2 rounded-lg ${item.gradient} group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <item.icon className="h-3 w-3 md:h-4 md:w-4 text-white" />
                      </div>
                      {!collapsed && (
                        <div className="text-left min-w-0">
                          <p className="font-medium text-sm md:text-base text-foreground truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                        </div>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {profile?.role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel className={`text-muted-foreground font-semibold text-sm ${collapsed ? 'text-center' : ''}`}>
              {collapsed ? '⚡' : 'Admin Panel'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 md:space-y-2">
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      asChild
                      className={`group transition-all duration-200 rounded-xl ${
                        isActive(item.id) 
                          ? 'bg-primary/15 text-primary border border-primary/30 shadow-md' 
                          : 'hover:bg-muted/70 text-foreground hover:scale-[1.02]'
                      }`}
                    >
                      <button 
                        onClick={() => handleItemClick(item.id)}
                        className="w-full flex items-center gap-2 md:gap-3 p-2 md:p-3"
                      >
                        <div className={`p-1.5 md:p-2 rounded-lg ${item.gradient} group-hover:scale-110 transition-transform flex-shrink-0`}>
                          <item.icon className="h-3 w-3 md:h-4 md:w-4 text-white" />
                        </div>
                        {!collapsed && (
                          <div className="text-left min-w-0">
                            <p className="font-medium text-sm md:text-base text-foreground truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                          </div>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 md:p-4">
        {profile && (
          <div className="space-y-3 md:space-y-4">
            {/* User Profile Section */}
            <div className={`glass rounded-xl p-2 md:p-3 border border-border/50 ${collapsed ? 'text-center' : ''}`}>
              <div className="flex items-center gap-2 md:gap-3">
                <Avatar className="h-6 w-6 md:h-8 md:w-8 ring-2 ring-primary/20 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-primary text-white text-xs md:text-sm font-semibold">
                    {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-xs md:text-sm truncate">{profile.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                    <div className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium bg-gradient-accent text-white mt-1">
                      {profile.role}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sign Out Button */}
            <Button 
              onClick={onSignOut}
              variant="ghost"
              size={collapsed ? "icon" : "sm"}
              className={`w-full transition-all duration-200 hover:bg-destructive/10 hover:text-destructive text-foreground ${
                collapsed ? 'p-1.5 md:p-2' : 'justify-start gap-2 md:gap-3 p-2 md:p-3'
              }`}
            >
              <LogOut className="h-3 w-3 md:h-4 md:w-4" />
              {!collapsed && <span className="text-xs md:text-sm">Sign Out</span>}
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
