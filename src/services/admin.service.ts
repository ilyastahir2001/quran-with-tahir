import { supabase } from '@/integrations/supabase/client';

export const AdminService = {
    /**
     * Logs an administrative action to the audit trails.
     */
    async logAction(
        adminId: string, 
        action: string, 
        resourceType: string, 
        resourceId: string | null = null, 
        details: Record<string, any> = {}
    ) {
        try {
            const { error } = await supabase.from('admin_audit_logs').insert({
                admin_id: adminId,
                action,
                resource_type: resourceType,
                resource_id: resourceId,
                details
            });
            if (error) throw error;
        } catch (error) {
            console.warn('AdminService: Failed to log audit action', error);
            // Fail silently to not block admin UI
        }
    }
};
