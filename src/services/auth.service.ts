import { supabase } from '@/integrations/supabase/client';
import type { Profile, Teacher, Student, AppRole, StudentAchievement } from '@/types/database';

export interface AuthUserData {
    profile: Profile | null;
    teacher: Teacher | null;
    student: Student | null;
    roles: AppRole[];
    achievements: StudentAchievement[];
    linkedChildren: Student[];
    activeChild: Student | null;
}

export const AuthService = {
    /**
     * Logs a security event for the user.
     */
    async logActivity(userId: string, eventType: string, metadata: Record<string, string | number | boolean | null> = {}) {
        try {
            await supabase.from('auth_activity_logs').insert({
                user_id: userId,
                event_type: eventType,
                metadata
            });
        } catch (error) {
            console.warn('AuthService: Failed to log activity', error);
            // Fail silently to not block the user flow
        }
    },

    /**
     * Enrolls a new TOTP factor.
     */
    async enrollMFA() {
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
        });
        if (error) throw error;
        return data;
    },

    /**
     * Verifies and activates a TOTP factor.
     */
    async verifyMFA(factorId: string, code: string) {
        const { data, error } = await supabase.auth.mfa.challengeAndVerify({
            factorId,
            code,
        });
        if (error) throw error;
        return data;
    },

    /**
     * Challenges and verifies a factor during login (AAL2 upgrade).
     */
    async challengeAndVerifyMFA(factorId: string, code: string) {
        const { data, error } = await supabase.auth.mfa.challengeAndVerify({
            factorId,
            code,
        });
        if (error) throw error;
        return data;
    },

    /**
     * Lists verified MFA factors for the user.
     */
    async listFactors() {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;
        return data?.all || [];
    },

    /**
     * Unenrolls (deletes) a MFA factor.
     */
    async unenrollMFA(factorId: string) {
        const { data, error } = await supabase.auth.mfa.unenroll({
            factorId,
        });
        if (error) throw error;
        return data;
    },

    /**
     * Updates the student's streak based on their last activity.
     */
    async updateStreak(studentId: string, currentStudent: Student) {
        try {
            // Use student's timezone or fallback to local
            const timezone = currentStudent.timezone || 'UTC';

            // Get "Today" in the user's timezone
            const now = new Date();
            const todayStr = new Intl.DateTimeFormat('en-CA', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(now); // Canadian format gives YYYY-MM-DD reliably

            const lastActivity = currentStudent.last_activity_date;

            let newStreak = currentStudent.current_streak || 0;
            let newLongest = currentStudent.longest_streak || 0;

            if (lastActivity === todayStr) {
                return null; // Already updated today in their timezone
            }

            // Get "Yesterday" in the user's timezone
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = new Intl.DateTimeFormat('en-CA', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(yesterday);

            if (lastActivity === yesterdayStr) {
                newStreak += 1;
            } else if (!lastActivity || lastActivity < yesterdayStr) {
                newStreak = 1; // Reset or start new streak
            }

            if (newStreak > newLongest) {
                newLongest = newStreak;
            }

            const { data, error } = await supabase
                .from('students')
                .update({
                    current_streak: newStreak,
                    longest_streak: newLongest,
                    last_activity_date: todayStr
                })
                .eq('id', studentId)
                .select()
                .single();

            if (data) {
                // Check for streak milestones
                if (newStreak === 3 || newStreak === 7) {
                    const type = 'streak_days';
                    const val = newStreak;
                    const { data: ach } = await supabase
                        .from('achievements')
                        .select('id')
                        .eq('requirement_type', type)
                        .eq('requirement_value', val)
                        .maybeSingle();

                    if (ach) {
                        await supabase.from('student_achievements').upsert({
                            student_id: studentId,
                            achievement_id: ach.id
                        }, { onConflict: 'student_id,achievement_id' });
                    }
                }
                return data as Student;
            }
            return null;
        } catch (err) {
            console.error('AuthService: Error updating streak', err);
            return null;
        }
    },

    /**
     * Fetches all user data (Profile, Roles, Teacher, Student, Achievements) in parallel.
     */
    async fetchUserData(
        userId: string,
        abortSignal?: AbortSignal,
        options?: {
            roleFromMeta?: string;
            fullNameFromMeta?: string;
            emailFromMeta?: string;
        }
    ): Promise<AuthUserData | null> {
        console.log('AuthService: Fetching user data for', userId);

        // Helper to add timeout to promises
        const withTimeout = <T,>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> => {
            return Promise.race([
                promise,
                new Promise<T>((_, reject) =>
                    setTimeout(() => reject(new Error(errorMsg)), ms)
                )
            ]);
        };

        try {
            // Define promises with built-in error handling
            // We wrap each in Promise.resolve to safely use .catch and .then on PostgrestBuilders
            const rolesPromise = Promise.resolve(supabase.from('user_roles').select('role').eq('user_id', userId).abortSignal(abortSignal || new AbortController().signal))
                .catch(err => ({ data: [], error: err }));

            const profilePromise = Promise.resolve(supabase.from('profiles').select('*').eq('user_id', userId).abortSignal(abortSignal || new AbortController().signal).maybeSingle())
                .catch(err => ({ data: null, error: err }));

            const teacherPromise = Promise.resolve(supabase.from('teachers').select('*').eq('user_id', userId).abortSignal(abortSignal || new AbortController().signal).maybeSingle())
                .catch(err => ({ data: null, error: err }));

            const studentPromise = Promise.resolve(supabase.from('students').select('*').eq('user_id', userId).abortSignal(abortSignal || new AbortController().signal).maybeSingle())
                .catch(err => ({ data: null, error: err }));

            const achievementsPromise = Promise.resolve(supabase.from('student_achievements').select('*, achievement:achievements(*)').abortSignal(abortSignal || new AbortController().signal))
                .catch(err => ({ data: [], error: err }));

            interface FetchResult { data: any; error?: any; }
            
            // Shortened timeout for production responsiveness
            const TIMEOUT_MS = 5000; 

            const [rolesResult, profileResult, teacherResult, studentResult, achievementsResult] = await (Promise.all([
                withTimeout(rolesPromise.then(r => { console.log('AuthService: Roles fetch complete'); return r; }), TIMEOUT_MS, 'Roles fetch timeout'),
                withTimeout(profilePromise.then(p => { console.log('AuthService: Profile fetch complete'); return p; }), TIMEOUT_MS, 'Profile fetch timeout'),
                teacherPromise.then(t => { console.log('AuthService: Teacher fetch complete'); return t; }),
                studentPromise.then(s => { console.log('AuthService: Student fetch complete'); return s; }),
                achievementsPromise.then(a => { console.log('AuthService: Achievements fetch complete'); return a; })
            ]) as Promise<[FetchResult, FetchResult, FetchResult, FetchResult, FetchResult]>).catch(err => {
                console.warn('AuthService: Parallel fetch had a failure or timeout', err);
                return [ {data: []}, {data: null}, {data: null}, {data: null}, {data: []} ] as [FetchResult, FetchResult, FetchResult, FetchResult, FetchResult];
            });

            // Provisioning Logic & Fallbacks
            let profile = profileResult.data as Profile | null;
            let teacher = teacherResult.data as Teacher | null;
            let student = studentResult.data as Student | null;
            let roles = (rolesResult.data?.map(r => r.role as unknown as AppRole).filter(Boolean) || []) as AppRole[];

            // FALLBACK: If profile is missing from DB, construct a virtual one from metadata
            if (!profile && options) {
                console.log('AuthService: Profile missing from DB, using metadata fallback');
                profile = {
                    id: crypto.randomUUID(), // Temporary ID for internal consistency
                    user_id: userId,
                    full_name: options.fullNameFromMeta || 'User',
                    email: options.emailFromMeta || '',
                    avatar_url: null,
                    country: null,
                    phone: null,
                    metadata: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    language_pref: 'en'
                } as Profile;
            }

            const roleFromMeta = options?.roleFromMeta;
            const hasMetadataRole = roleFromMeta === 'teacher' || roleFromMeta === 'student' || roleFromMeta === 'parent';
            const hasDatabaseRoles = roles.length > 0;

            const needsRoleProvision = !hasDatabaseRoles && hasMetadataRole;
            const needsRowProvision =
                (roleFromMeta === 'teacher' && !teacher) ||
                ((roleFromMeta === 'student' || roleFromMeta === 'parent') && !student);

            if (needsRoleProvision || (hasMetadataRole && needsRowProvision)) {
                console.log('AuthService: Triggering background provisioning for', roleFromMeta);

                try {
                    const { error: provisionError } = await supabase.functions.invoke('provision-user', {
                        body: {
                            role: roleFromMeta,
                            full_name: options?.fullNameFromMeta,
                            email: options?.emailFromMeta,
                        },
                    });

                    if (!provisionError) {
                        console.log('AuthService: Provisioning successful, refreshing data');
                        const [p, t, s, r] = await Promise.all([
                            supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
                            supabase.from('teachers').select('*').eq('user_id', userId).maybeSingle(),
                            supabase.from('students').select('*').eq('user_id', userId).maybeSingle(),
                            supabase.from('user_roles').select('role').eq('user_id', userId),
                        ]);

                        // Only overwrite if we got actual data back
                        if (p.data) profile = p.data as Profile;
                        if (t.data) teacher = t.data as Teacher;
                        if (s.data) student = s.data as Student;
                        if (r.data && r.data.length > 0) roles = r.data.map(role => role.role as unknown as AppRole);
                    }
                } catch (err) {
                    console.error('AuthService: Background provisioning failed', err);
                }
            }

            // Process Student Data
            let linkedChildren: Student[] = [];
            let activeChild: Student | null = null;
            let studentAchievements: StudentAchievement[] = [];

            if (student) {
                studentAchievements = (achievementsResult.data as (StudentAchievement & { student_id: string })[])?.filter(a => a.student_id === student!.id) || [];

                if (student.is_parent_account) {
                    const { data: childrenData } = await supabase.from('students').select('*').eq('parent_id', student.id);
                    if (childrenData) {
                        linkedChildren = childrenData as Student[];
                        activeChild = childrenData[0] as Student;
                    }
                }
            }

            // Role Fallback
            if (roleFromMeta) {
                let activeRole: AppRole | null = null;
                if (roleFromMeta === 'admin') activeRole = 'admin';
                else if (roleFromMeta === 'teacher') activeRole = 'teacher';
                else if (roleFromMeta === 'student' || roleFromMeta === 'parent') activeRole = 'student';

                if (activeRole && !roles.includes(activeRole)) {
                    roles.push(activeRole);
                }
            }

            if (roles.length === 0) {
                if (teacher) roles = ['teacher'];
                else if (student) roles = ['student'];
                // Removed default fallback to ['student']
                // If no role found in DB, return empty so UI can handle setup
            }

            return {
                profile,
                teacher,
                student,
                roles,
                achievements: studentAchievements,
                linkedChildren: linkedChildren,
                activeChild: activeChild
            };

        } catch (error) {
            if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('AbortError'))) {
                return null;
            }
            console.error('AuthService: Error fetching user data', error);

            // Even if fetch fails, try to return a fallback if we have metadata
            if (options) {
                return {
                    profile: {
                        id: crypto.randomUUID(),
                        user_id: userId,
                        full_name: options.fullNameFromMeta || 'User',
                        email: options.emailFromMeta || '',
                        avatar_url: null,
                        country: null,
                        phone: null,
                        metadata: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        language_pref: 'en'
                    } as Profile,
                    teacher: null,
                    student: null,
                    roles: options.roleFromMeta ? [options.roleFromMeta === 'teacher' ? 'teacher' : (options.roleFromMeta === 'admin' ? 'admin' : 'student')] as AppRole[] : [],
                    achievements: [],
                    linkedChildren: [],
                    activeChild: null
                };
            }
            return null;
        }
    }
};
