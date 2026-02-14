import "jsr:@supabase/functions-js@2/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type ProvisionRole = 'teacher' | 'student' | 'parent'

interface ProvisionRequest {
  role?: ProvisionRole
  full_name?: string
  email?: string
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: 'Backend configuration is missing' }, 500)
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '')

    const authed = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    // Pass the token explicitly to getUser() for Edge Function compatibility
    // Type assertion needed because the Supabase types don't expose getUser on auth directly
    type GetUserFn = (token: string) => Promise<{ data: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null }; error: Error | null }>
    const { data: userData, error: userErr } = await ((authed.auth as unknown as { getUser: GetUserFn }).getUser)(token)
    if (userErr || !userData?.user) return json({ error: 'Unauthorized' }, 401)

    const user = userData.user

    let payload: ProvisionRequest = {}
    if (req.headers.get('content-type')?.includes('application/json')) {
      payload = (await req.json().catch(() => ({}))) as ProvisionRequest
    }

    const meta = user.user_metadata as Record<string, unknown> | undefined
    const role = (payload.role ?? (meta?.role as ProvisionRole | undefined))
    const fullName = (payload.full_name ?? (meta?.full_name as string | undefined) ?? user.email ?? 'User')
    const email = payload.email ?? user.email ?? null

    if (role !== 'teacher' && role !== 'student' && role !== 'parent') {
      return json({ error: 'Missing or invalid role' }, 400)
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    console.log(`[Provisioning] User ID: ${user.id}, Role: ${role}, Email: ${user.email}`)

    // 1) Ensure profile exists
    const { data: existingProfile, error: profileGetErr } = await admin
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileGetErr) throw new Error(`Failed to fetch profile: ${profileGetErr.message}`)

    if (!existingProfile) {
      console.log(`[Provisioning] Checking for profile by email: ${user.email}`)
      const { data: profileByEmail, error: profileEmailErr } = await admin
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .maybeSingle()

      if (profileEmailErr) throw new Error(`Failed to check profile email: ${profileEmailErr.message}`)

      if (profileByEmail) {
        console.log(`[Provisioning] Linking existing profile ${profileByEmail.id} to user ${user.id}`)
        const { error: profileUpdErr } = await admin
          .from('profiles')
          .update({ user_id: user.id })
          .eq('id', profileByEmail.id)
        if (profileUpdErr) throw new Error(`Failed to link profile: ${profileUpdErr.message}`)
      } else {
        console.log(`[Provisioning] Creating profile for ${user.id}`)
        const { error: profileInsErr } = await admin.from('profiles').insert({
          user_id: user.id,
          email: email ?? '',
          full_name: fullName,
        })
        if (profileInsErr) throw new Error(`Failed to create profile: ${profileInsErr.message}`)
      }
    }

    // 2) Ensure role exists
    const desiredRole = role === 'teacher' ? 'teacher' : 'student'
    const { data: existingRoles, error: roleGetErr } = await admin
      .from('user_roles')
      .select('id, role')
      .eq('user_id', user.id)

    if (roleGetErr) throw new Error(`Failed to fetch roles: ${roleGetErr.message}`)

    const hasDesiredRole = (existingRoles ?? []).some((r: { role: string }) => r.role === desiredRole)
    if (!hasDesiredRole) {
      console.log(`[Provisioning] Assigning role ${desiredRole} to ${user.id}`)
      const { error: roleInsErr } = await admin.from('user_roles').insert({ user_id: user.id, role: desiredRole })
      if (roleInsErr) throw new Error(`Failed to assign role: ${roleInsErr.message}`)
    }

    // 3) Ensure role-specific row exists
    if (role === 'teacher') {
      const { data: existingTeacher, error: teacherGetErr } = await admin
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (teacherGetErr) throw new Error(`Failed to fetch teacher ref: ${teacherGetErr.message}`)

      if (!existingTeacher) {
        console.log(`[Provisioning] Creating teacher record for ${user.id}`)
        const { error: teacherInsErr } = await admin.from('teachers').insert({ user_id: user.id })
        if (teacherInsErr) throw new Error(`Failed to create teacher record: ${teacherInsErr.message}`)
      }
    } else {
      const { data: existingStudent, error: studentGetErr } = await admin
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (studentGetErr) throw new Error(`Failed to fetch student ref: ${studentGetErr.message}`)

      if (!existingStudent) {
        console.log(`[Provisioning] Checking for student record by email: ${user.email}`)
        const { data: studentByEmail, error: studentEmailErr } = await admin
          .from('students')
          .select('id')
          .eq('email', user.email)
          .maybeSingle()

        if (studentEmailErr) throw new Error(`Failed to check student email: ${studentEmailErr.message}`)

        if (studentByEmail) {
          console.log(`[Provisioning] Linking existing student ${studentByEmail.id} to user ${user.id}`)
          const { error: studentUpdErr } = await admin
            .from('students')
            .update({
              user_id: user.id,
              is_parent_account: role === 'parent'
            })
            .eq('id', studentByEmail.id)
          if (studentUpdErr) throw new Error(`Failed to link student: ${studentUpdErr.message}`)
        } else {
          console.log(`[Provisioning] Creating student record for ${user.id}`)
          const { error: studentInsErr } = await admin.from('students').insert({
            user_id: user.id,
            full_name: fullName,
            email: email,
            is_parent_account: role === 'parent',
          })
          if (studentInsErr) throw new Error(`Failed to create student record: ${studentInsErr.message}`)
        }
      }
    }

    console.log(`[Provisioning] Successfully completed for ${user.id}`)
    return json({ ok: true, role: desiredRole })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    console.error('[Provisioning] Error:', message)
    return json({ error: message }, 500)
  }
})
