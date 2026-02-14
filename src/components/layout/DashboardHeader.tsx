import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bell, Settings, User, LogOut, Wifi, WifiOff } from 'lucide-react';
import type { Notification } from '@/types/database';

import { NotificationDrawer } from '../notifications/NotificationDrawer';
import { useRealtime } from '@/contexts/RealtimeContext';

import { DynamicBreadcrumbs } from '../navigation/Breadcrumbs';
import { LanguageSwitcher } from './LanguageSwitcher';
import { TeacherStatusToggle } from '../teacher/TeacherStatusToggle';

export function DashboardHeader() {
  const { profile, signOut, user, isTeacher, isStudent, isAdmin, displayName, displayEmail } = useAuth();
  const { notificationsCount } = useRealtime();
  const { isMobile } = useSidebar();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="md:hidden flex items-center gap-2 group transition-all duration-300">
        <img src="/logo.png" alt="Logo" className="h-9 w-auto object-contain group-hover:scale-110 transition-transform duration-300" />
        <div className="flex flex-col -space-y-0.5">
          <span className="font-black text-sm tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Quran with Tahir
          </span>
          <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em] leading-none">
            Online Academy
          </span>
        </div>
      </div>

      {!isMobile && <DynamicBreadcrumbs />}

      <div className="flex-1" />

      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <TeacherStatusToggle />
        {isOnline ? (
          <div className="flex items-center gap-1.5 text-success text-sm hidden md:flex">
            <Wifi className="h-4 w-4" />
            <span>Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-destructive text-sm hidden md:flex">
            <WifiOff className="h-4 w-4" />
            <span>Offline</span>
          </div>
        )}
      </div>

      {/* Language Switcher */}
      <LanguageSwitcher />

      {/* Notifications */}
      <NotificationDrawer />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url ?? ''} alt={displayName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {displayName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {displayEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to={isAdmin ? "/admin/dashboard" : isTeacher ? "/teacher/profile" : "/student/profile"}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
