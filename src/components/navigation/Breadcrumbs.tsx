import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

const routeMap: Record<string, string> = {
    admin: 'Admin',
    teacher: 'Teacher',
    student: 'Student',
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    logs: 'System Logs',
    settings: 'Settings',
    approvals: 'Approvals',
    teachers: 'Teachers',
    students: 'Students',
    classes: 'Classes',
    schedule: 'Schedule',
    payments: 'Payments',
    salaries: 'Salaries',
    today: 'Today',
    'find-tutors': 'Find Tutors',
    'my-teacher': 'My Teacher',
    lessons: 'Lessons',
    progress: 'My Progress',
    attendance: 'Attendance',
    messages: 'Messages',
    requests: 'Requests',
    announcements: 'Announcements',
    profile: 'Profile',
};

export const DynamicBreadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    if (pathnames.length === 0) return null;

    return (
        <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/" className="flex items-center gap-1">
                            <Home className="h-3 w-3" />
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />

                {pathnames.map((value, index) => {
                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const label = routeMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

                    return (
                        <React.Fragment key={to}>
                            <BreadcrumbItem>
                                {last ? (
                                    <BreadcrumbPage>{label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={to}>{label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!last && <BreadcrumbSeparator />}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
};
