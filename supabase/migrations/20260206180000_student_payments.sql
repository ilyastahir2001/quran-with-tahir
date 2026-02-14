-- ==========================================
-- Student Payments & Revenue Module
-- ==========================================
-- 1. Create Enums
CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded',
    'cancelled'
);
CREATE TYPE public.payment_method AS ENUM (
    'stripe',
    'paypal',
    'bank_transfer',
    'cash',
    'other'
);
CREATE TYPE public.billing_period AS ENUM ('monthly', 'quarterly', 'yearly', 'one_time');
-- 2. Create Payment Plans (Subscription Tiers)
CREATE TABLE IF NOT EXISTS public.payment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    billing_period billing_period DEFAULT 'monthly',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- 3. Create Invoices (Generated Bills)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.payment_plans(id) ON DELETE
    SET NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        status payment_status DEFAULT 'pending',
        due_date DATE NOT NULL,
        paid_at TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- 4. Create Transactions (Actual Payments)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE
    SET NULL,
        student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        status payment_status DEFAULT 'pending',
        payment_method payment_method,
        transaction_reference TEXT,
        -- Stripe/PayPal ID
        processed_at TIMESTAMPTZ DEFAULT now(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- 5. Enable RLS
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
-- 6. Helper Function
CREATE OR REPLACE FUNCTION public.get_student_id_safe(_user_id UUID) RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
SELECT id
FROM public.students
WHERE user_id = _user_id
LIMIT 1 $$;
-- 7. Policies
-- Payment Plans (Public Read, Admin Write)
CREATE POLICY "Anyone can view active plans" ON public.payment_plans FOR
SELECT USING (is_active = true);
CREATE POLICY "Admins can manage plans" ON public.payment_plans FOR ALL USING (public.is_admin(auth.uid()));
-- Invoices (Student Read Own, Admin Manage)
CREATE POLICY "Students can view own invoices" ON public.invoices FOR
SELECT USING (
        student_id = public.get_student_id_safe(auth.uid())
        OR public.is_admin(auth.uid())
    );
CREATE POLICY "Admins can manage invoices" ON public.invoices FOR ALL USING (public.is_admin(auth.uid()));
-- Transactions (Student Read Own, Admin Manage)
CREATE POLICY "Students can view own transactions" ON public.transactions FOR
SELECT USING (
        student_id = public.get_student_id_safe(auth.uid())
        OR public.is_admin(auth.uid())
    );
CREATE POLICY "Admins can manage transactions" ON public.transactions FOR ALL USING (public.is_admin(auth.uid()));
-- 8. Realtime
ALTER PUBLICATION supabase_realtime
ADD TABLE public.invoices;
ALTER PUBLICATION supabase_realtime
ADD TABLE public.transactions;
-- 9. Triggers
CREATE TRIGGER set_payment_plans_updated_at BEFORE
UPDATE ON public.payment_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_invoices_updated_at BEFORE
UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();