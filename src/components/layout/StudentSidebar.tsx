import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  CalendarDays,
  Search,
  UserCheck,
  GraduationCap,
  Calendar,
  BookOpen,
  TrendingUp,
  ClipboardCheck,
  MessageCircle,
  FileQuestion,
  Megaphone,
  User,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  BookMarked,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useTranslation } from 'react-i18next';

export function StudentSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { profile, student, signOut, isParent, linkedChildren, activeChild, setActiveChild, displayName, displayEmail } = useAuth();

  const studentNavItems = [
    { title: t('sidebar.dashboard'), icon: LayoutDashboard, path: '/student/dashboard' },
    { title: t('sidebar.my_classes'), icon: CalendarDays, path: '/student/today' },
    { title: t('sidebar.find_tutors'), icon: Search, path: '/student/find-tutors' },
    { title: t('sidebar.messages'), icon: MessageCircle, path: '/student/messages' },
    { title: t('sidebar.lessons'), icon: BookOpen, path: '/student/lessons' },
    { title: t('sidebar.progress'), icon: TrendingUp, path: '/student/progress' },
    { title: t('sidebar.schedule'), icon: Calendar, path: '/student/schedule' },
  ];

  const settingsNavItems = [
    { title: t('sidebar.settings'), icon: Settings, path: '/student/settings' },
    { title: t('sidebar.help'), icon: HelpCircle, path: '/student/help' },
  ];

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border p-4">
        <Link to="/student/dashboard" className="flex items-center gap-3 group transition-all duration-300">
          <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain group-hover:scale-110 transition-transform duration-300" />
          <div className="flex flex-col -space-y-0.5">
            <span className="font-bold text-foreground leading-none tracking-tight">Quran with Tahir</span>
            <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em] leading-none mt-1">
              Student Portal
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Parent Child Selector */}
        {isParent && linkedChildren.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Viewing As</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 space-y-1">
                {linkedChildren.map((child) => (
                  <Button
                    key={child.id}
                    variant={activeChild?.id === child.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveChild(child)}
                  >
                    <Avatar className="h-5 w-5 mr-2">
                      <AvatarImage src={child.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {child.full_name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {child.full_name}
                  </Button>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isParent && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/student/parent-portal'}
                    tooltip="Parent Portal"
                  >
                    <Link to="/student/parent-portal">
                      <Users className="h-4 w-4" />
                      <span>Parent Portal</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {studentNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                  >
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isParent && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/student/audit-logs'}
                    tooltip="Audit Logs"
                  >
                    <Link to="/student/audit-logs">
                      <ClipboardList className="h-4 w-4" />
                      <span>Audit Logs</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                  >
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={student?.avatar_url || profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {displayEmail}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="shrink-0"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
