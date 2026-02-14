import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useConnectionRequests } from '@/hooks/useConnectionRequests';
import logo from '/logo.png';
import {
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  Calendar,
  Users,
  UserPlus,
  BookOpen,
  ClipboardCheck,
  Bell,
  ListTodo,
  MessageSquareWarning,
  Lightbulb,
  MessageCircle,
  DollarSign,
  MinusCircle,
  TrendingUp,
  FileText,
  HelpCircle,
  Megaphone,
  ChevronDown,
  PlusCircle,
  History,
  UserCheck,
  LogOut,
  BookMarked,
} from 'lucide-react';

import { Search } from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
  { name: 'Today Classes', href: '/teacher/today-classes', icon: CalendarDays },
  { name: 'Classes', href: '/teacher/classes', icon: GraduationCap },
  { name: 'Class Schedule', href: '/teacher/schedule', icon: Calendar },
  { name: 'My Students', href: '/teacher/students', icon: Users },
  { name: 'Find Students', href: '/teacher/find-students', icon: Search },
  { name: 'Requests', href: '/teacher/connection-requests', icon: UserPlus, hasBadge: true },
  {
    name: 'Lessons',
    icon: BookOpen,
    children: [
      { name: 'Add Lesson', href: '/teacher/lessons/add', icon: PlusCircle },
      { name: 'Lesson History', href: '/teacher/lessons/history', icon: History },
      { name: 'Examiner Remarks', href: '/teacher/lessons/examiner', icon: UserCheck },
    ],
  },
  { name: 'Attendance', href: '/teacher/attendance', icon: ClipboardCheck },
  { name: 'Reminder', href: '/teacher/reminder', icon: Bell },
  { name: 'Tasks', href: '/teacher/tasks', icon: ListTodo },
  { name: 'Complaints', href: '/teacher/complaints', icon: MessageSquareWarning },
  { name: 'Suggestions', href: '/teacher/suggestions', icon: Lightbulb },
  { name: 'Feedback', href: '/teacher/feedback', icon: MessageCircle },
  { name: 'Messages', href: '/teacher/messages', icon: MessageCircle },
  { name: 'Salary', href: '/teacher/salary', icon: DollarSign },
  { name: 'Deduction List', href: '/teacher/deductions', icon: MinusCircle },
  { name: 'Leave Requests', href: '/teacher/leave-requests', icon: Calendar },
  { name: 'Improvement', href: '/teacher/improvement', icon: TrendingUp },
  { name: 'Rules', href: '/teacher/rules', icon: FileText },
  { name: 'Instruction', href: '/teacher/instruction', icon: HelpCircle },
  { name: 'Announcements', href: '/teacher/announcements', icon: Megaphone },
];

export function DashboardSidebar() {
  const location = useLocation();
  const { profile, displayName, displayEmail, signOut } = useAuth();
  const { state, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const isCollapsed = state === 'collapsed';
  const { pendingCount } = useConnectionRequests();

  const isActive = (href: string) => location.pathname === href;
  const isParentActive = (children: { href: string }[]) =>
    children.some(child => location.pathname === child.href);

  // Auto-close mobile sidebar on navigation
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [location.pathname, isMobile, setOpenMobile]);

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 group transition-all duration-300">
          <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain group-hover:scale-110 transition-transform duration-300" />
          {!isCollapsed && (
            <div className="flex flex-col -space-y-0.5">
              <span className="font-bold text-sidebar-foreground leading-none tracking-tight">Quran with Tahir</span>
              <span className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-[0.15em] leading-none mt-1">
                Teacher Portal
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <ScrollArea className="h-[calc(100vh-180px)]">
          <SidebarMenu>
            {/* PRIVATE: Only show teacher portal navigation to admins */}
            {useAuth().isAdmin ? navigationItems.map((item) => {
              if (item.children) {
                return (
                  <Collapsible
                    key={item.name}
                    defaultOpen={isParentActive(item.children)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={cn(
                            'w-full',
                            isParentActive(item.children) && 'bg-sidebar-accent text-sidebar-accent-foreground'
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && (
                            <>
                              <span className="flex-1">{item.name}</span>
                              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </>
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(child.href)}
                              >
                                <NavLink
                                  to={child.href}
                                  className="flex items-center gap-2"
                                  onClick={handleNavClick}
                                >
                                  <child.icon className="h-3.5 w-3.5" />
                                  <span>{child.name}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              }

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href!)}
                    tooltip={isCollapsed ? item.name : undefined}
                  >
                    <NavLink
                      to={item.href!}
                      className="flex items-center gap-2"
                      onClick={handleNavClick}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.name}</span>
                          {item.hasBadge && pendingCount > 0 && (
                            <Badge className="h-5 px-1.5 bg-amber-500 text-white text-xs">
                              {pendingCount}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }) : (
              <div className="px-4 py-2 text-sm text-muted-foreground italic">
                Portal is currently private.
              </div>
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          {isCollapsed ? (
            // Collapsed state: Avatar acts as sign out button
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={signOut}
                  className="focus:outline-none focus:ring-2 focus:ring-sidebar-ring rounded-full"
                >
                  <Avatar className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                      {displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Sign out</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            // Expanded state: Show full user info
            <>
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name ?? undefined} />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  {profile?.full_name?.charAt(0) || 'T'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {displayName}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {displayEmail}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
