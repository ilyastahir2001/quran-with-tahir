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
    useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    LayoutDashboard,
    UserCheck,
    GraduationCap,
    Users,
    BookOpen,
    Calendar,
    CreditCard,
    Banknote,
    Settings,
    LogOut,
    ShieldCheck,
    ChevronDown,
    MessageSquare,
} from 'lucide-react';
// Fallacks if some icons missing in older lucide versions
import { DollarSign } from 'lucide-react';

const navigationItems = [
    {
        category: 'Overview',
        items: [
            { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        ]
    },
    {
        category: 'Management',
        items: [
            { name: 'Approvals', href: '/admin/approvals', icon: UserCheck },
            { name: 'Teachers', href: '/admin/teachers', icon: GraduationCap },
            { name: 'Students', href: '/admin/students', icon: Users },
        ]
    },
    {
        category: 'Academic',
        items: [
            { name: 'Classes', href: '/admin/classes', icon: BookOpen },
            { name: 'Schedule', href: '/admin/schedule', icon: Calendar },
        ]
    },
    {
        category: 'Financials',
        items: [
            { name: 'Payments', href: '/admin/payments', icon: CreditCard },
            { name: 'Salaries', href: '/admin/salaries', icon: DollarSign }, // Fallback to DollarSign if Banknote fails
        ]
    },
    {
        category: 'Communication',
        items: [
            { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
        ]
    },
    {
        category: 'Analysis',
        items: [
            { name: 'Analytics', href: '/admin/analytics', icon: LayoutDashboard },
            { name: 'System Logs', href: '/admin/logs', icon: BookOpen },
        ]
    },
    {
        category: 'System',
        items: [
            { name: 'Settings', href: '/admin/settings', icon: Settings },
        ]
    }
];

export function AdminSidebar() {
    const location = useLocation();
    const { profile, displayName, displayEmail, signOut } = useAuth();
    const { state, setOpenMobile } = useSidebar();
    const isMobile = useIsMobile();
    const isCollapsed = state === 'collapsed';

    const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

    // Auto-close mobile sidebar on navigation
    useEffect(() => {
        if (isMobile) {
            setOpenMobile(false);
        }
    }, [location.pathname, isMobile, setOpenMobile]);

    return (
        <Sidebar className="border-r border-sidebar-border bg-sidebar">
            <SidebarHeader className="p-4 border-b border-sidebar-border">
                <div className="flex items-center gap-3 group transition-all duration-300">
                    <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain group-hover:scale-110 transition-transform duration-300" />
                    {!isCollapsed && (
                        <div className="flex flex-col -space-y-0.5">
                            <span className="font-bold text-sidebar-foreground leading-none tracking-tight">Quran with Tahir</span>
                            <span className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-[0.15em] leading-none mt-1">
                                Admin Portal
                            </span>
                        </div>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2 py-4">
                {navigationItems.map((group, index) => (
                    <div key={group.category} className="mb-6">
                        {!isCollapsed && (
                            <h3 className="px-2 mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                                {group.category}
                            </h3>
                        )}
                        <SidebarMenu>
                            {group.items.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.href)}
                                        tooltip={isCollapsed ? item.name : undefined}
                                    >
                                        <NavLink
                                            to={item.href}
                                            className="flex items-center gap-3 font-medium transition-colors"
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {!isCollapsed && <span>{item.name}</span>}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </div>
                ))}
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-sidebar-border">
                <div className="flex items-center gap-3">
                    {isCollapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={signOut}
                                    className="focus:outline-none focus:ring-2 focus:ring-sidebar-ring rounded-full"
                                >
                                    <Avatar className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity">
                                        <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            {displayName?.charAt(0) || 'A'}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>Sign out</p>
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <>
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    {displayName?.charAt(0) || 'A'}
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
                                className="text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
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
