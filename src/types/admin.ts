import { Json } from '@/integrations/supabase/types';

export type AdminRole = 'super_admin' | 'support_admin' | 'finance_admin' | 'moderator';


export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PayoutStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export interface AdminPermission {
    id: string;
    user_id: string;
    role: AdminRole;
    created_at: string;
}

export interface AdminAuditLog {
    id: string;
    admin_id: string;
    action: string;
    target_resource: string;
    details: Json | null;
    ip_address?: string;
    created_at: string;
}

export interface TeacherPayout {
    id: string;
    teacher_id: string;
    amount: number;
    period_start: string;
    period_end: string;
    status: PayoutStatus;
    created_at: string;
}

export interface StudentPayment {
    id: string;
    student_id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    method: string;
    transaction_id?: string;
    created_at: string;
}
