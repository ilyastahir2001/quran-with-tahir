import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Video, BookOpen, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
    const navItems = [
        { to: "/student/dashboard", icon: LayoutDashboard, label: "Home" },
        { to: "/student/schedule", icon: Calendar, label: "Schedule" },
        { to: "/virtual-class/demo", icon: Video, label: "Class", highlight: true },
        { to: "/student/lessons", icon: BookOpen, label: "Lessons" },
        { to: "/student/settings", icon: Menu, label: "Menu" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border pb-safe">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        className={({ isActive }) => cn(
                            "flex flex-col items-center justify-center w-full h-full transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                            item.highlight && "text-primary font-bold"
                        )}
                    >
                        {item.highlight ? (
                            <div className="bg-primary/10 p-2 rounded-full mb-1">
                                <item.icon className="h-5 w-5" />
                            </div>
                        ) : (
                            <item.icon className="h-5 w-5 mb-1" />
                        )}
                        <span className="text-[10px] uppercase tracking-wide font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};
