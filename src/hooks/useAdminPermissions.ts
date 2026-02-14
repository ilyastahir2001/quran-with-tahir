import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AdminRole } from '@/types/admin';

export function useAdminPermissions() {
    const { user } = useAuth();

    const { data: roles = [], isLoading } = useQuery({
        queryKey: ['admin_roles', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const { data, error } = await supabase.rpc('get_admin_roles');

            if (error) {
                console.error('Error fetching admin roles:', error);
                // Fallback: If RPC fails (e.g. not created yet), return empty
                return [];
            }

            return data as AdminRole[];
        },
        enabled: !!user,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const hasRole = (requiredRoles: AdminRole | AdminRole[]) => {
        if (Array.isArray(requiredRoles)) {
            return requiredRoles.some(role => roles.includes(role));
        }
        return roles.includes(requiredRoles);
    };

    const isSuperAdmin = roles.includes('super_admin');

    return {
        roles,
        isLoading,
        hasRole,
        isSuperAdmin,
        // Convenience flags
        canManageFinancials: isSuperAdmin || roles.includes('finance_admin'),
        canManageUsers: isSuperAdmin || roles.includes('support_admin'),
        canManageSystem: isSuperAdmin,
        canViewMonitoring: isSuperAdmin || roles.includes('moderator') || roles.includes('support_admin'),
    };
}
