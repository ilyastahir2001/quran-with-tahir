import React, { useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, Teacher, Student, AppRole, StudentAchievement } from '@/types/database';
import { AuthService } from '@/services/auth.service';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [linkedChildren, setLinkedChildren] = useState<Student[]>([]);
  const [activeChild, _setActiveChild] = useState<Student | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Wrapper for setActiveChild to handle persistence
  const setActiveChild = useCallback((child: Student | null) => {
    _setActiveChild(child);
    if (child) {
      localStorage.setItem('active_child_id', child.id);
    } else {
      localStorage.removeItem('active_child_id');
    }
  }, []);

  // Track fetched user to avoid duplicate fetches
  const lastFetchedUserIdRef = useRef<string | null>(null);
  // Track if we have successfully loaded user data
  const hasLoadedDataRef = useRef<boolean>(false);
  // Track abort controller for current fetch
  const fetchAbortControllerRef = useRef<AbortController | null>(null);
  // Track initialization
  const initializationPromiseRef = useRef<Promise<void> | null>(null);
  // Track active transitions to prevent overlapping fetches
  const isFetchingRef = useRef<boolean>(false);
  // Debounce ref for user updates
  const lastStateChangeRef = useRef<number>(0);

  const updateStreak = useCallback(async (studentId: string, currentStudent: Student) => {
    const updatedStudent = await AuthService.updateStreak(studentId, currentStudent);
    if (updatedStudent) {
      setStudent(updatedStudent);
    }
  }, [setStudent]);

  const loadUserData = useCallback(async (
    userId: string,
    options?: {
      force?: boolean;
      roleFromMeta?: string;
      fullNameFromMeta?: string;
      emailFromMeta?: string;
    }
  ) => {
    // 1. Check if we're already fetching (unless forced and not active)
    if (isFetchingRef.current) {
      console.log('Auth: Load already in progress, skipping request for', userId);
      return;
    }

    if (!options?.force && lastFetchedUserIdRef.current === userId && hasLoadedDataRef.current) {
      console.log('Auth: User data already loaded for', userId);
      return;
    }

    // 2. Abort existing fetch
    if (fetchAbortControllerRef.current) {
      fetchAbortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    fetchAbortControllerRef.current = abortController;

    console.log('Auth: Starting loadUserData for', userId);
    isFetchingRef.current = true;
    lastFetchedUserIdRef.current = userId;
    hasLoadedDataRef.current = false;

    try {
      // Call the Service
      const data = await AuthService.fetchUserData(userId, abortController.signal, options);

      if (abortController.signal.aborted) {
        console.log('Auth: Fetch aborted for', userId);
        return null;
      }

      if (data) {
        setProfile(data.profile);
        setTeacher(data.teacher);
        setStudent(data.student);
        setRoles(data.roles);
        setAchievements(data.achievements);
        setLinkedChildren(data.linkedChildren);

        // Child Persistence Logic
        if (data.linkedChildren.length > 0) {
          const storedChildId = localStorage.getItem('active_child_id');
          const foundChild = storedChildId ? data.linkedChildren.find(c => c.id === storedChildId) : null;
          _setActiveChild(foundChild || data.activeChild || data.linkedChildren[0]);
        } else {
          _setActiveChild(data.activeChild);
        }

        if (data.student) {
          updateStreak(data.student.id, data.student);
        }
        hasLoadedDataRef.current = true;
      } else {
        // Fetch failed or returned null (critical error)
        console.error('Auth: fetchUserData returned null for', userId);
        hasLoadedDataRef.current = false;
      }
    } catch (err) {
      console.error('Auth: loadUserData critical error', err);
      hasLoadedDataRef.current = false;
    } finally {
      isFetchingRef.current = false;
    }
  }, [updateStreak, setProfile, setTeacher, setStudent, setRoles, setAchievements, setLinkedChildren, _setActiveChild]);

  const clearUserData = useCallback(() => {
    setProfile(null);
    setTeacher(null);
    setStudent(null);
    setLinkedChildren([]);
    setActiveChild(null);
    setRoles([]);
    setAchievements([]);
    lastFetchedUserIdRef.current = null;
    hasLoadedDataRef.current = false;
    initializationPromiseRef.current = null;
  }, [setProfile, setTeacher, setStudent, setLinkedChildren, setActiveChild, setRoles, setAchievements]);

  const performInitialization = useCallback(async (mountedRef: React.MutableRefObject<boolean>) => {
    console.log('Auth: Initializing session...');
    try {
      const { data: { session: existingSession } } = await supabase.auth.getSession();

      if (!mountedRef.current) return;

      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (!existingSession?.user) {
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Auth: Initialization error:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const mountedRef = { current: true };

    const safetyTimeout = setTimeout(() => {
      if (isMounted && isLoading && !hasLoadedDataRef.current) {
        console.warn('Auth: Initialization safety timeout reached');
        setIsLoading(false);
      }
    }, 8000);

    const initialize = async () => {
      if (!initializationPromiseRef.current) {
        initializationPromiseRef.current = performInitialization(mountedRef);
      }
      return initializationPromiseRef.current;
    };

    initialize();

    return () => {
      isMounted = false;
      mountedRef.current = false;
      if (safetyTimeout) clearTimeout(safetyTimeout);
    };
  }, [performInitialization, isLoading]);

  useEffect(() => {
    const mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        console.log(`Auth: Event [${event}]`);

        // Update local session/user state immediately
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (event === 'SIGNED_OUT') {
          clearUserData();
          setIsLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
          if (currentSession?.user) {
            // Only set loading if we don't already have data or it's a fresh sign-in
            const isFreshSignIn = event === 'SIGNED_IN';
            const needsData = !hasLoadedDataRef.current || isFreshSignIn || event === 'USER_UPDATED';

            if (needsData) {
              const now = Date.now();
              // Prevent rapid fire updates (less than 1s apart) unless it's a fresh sign-in
              if (!isFreshSignIn && now - lastStateChangeRef.current < 1000) {
                console.log('Auth: Ignoring rapid state change for', event);
                return;
              }
              lastStateChangeRef.current = now;

              setIsLoading(true);
              const metadata = currentSession.user.user_metadata || {};
              // Thorough metadata extraction
              const fullName = metadata.full_name || metadata.fullName || metadata.name || metadata.display_name;
              const role = metadata.role || currentSession.user.app_metadata?.role;

              await loadUserData(currentSession.user.id, {
                force: event === 'USER_UPDATED' || isFreshSignIn,
                roleFromMeta: role,
                fullNameFromMeta: fullName,
                emailFromMeta: currentSession.user.email ?? undefined,
              });

              setIsLoading(false);

              if (isFreshSignIn) {
                AuthService.logActivity(currentSession.user.id, 'login', {
                  method: currentSession.user.app_metadata.provider || 'email'
                });
              }
            }
          } else {
            setIsLoading(false);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserData, clearUserData]);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.fullName || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.email || user?.email || '';

  const signIn = useCallback(async (email: string, password: string) => {
    lastFetchedUserIdRef.current = null;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data?.user) {
      // Check for MFA factors
      try {
        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (!factorsError && factors?.all?.length > 0) {
          const factor = factors.all[0]; // For now, assume one factor
          return { error: null, mfaRequired: true, factorId: factor.id };
        }
      } catch (err) {
        console.warn('MFA check failed', err);
      }
    }

    return { error: error as Error | null, mfaRequired: false };
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    fullName: string,
    role: 'teacher' | 'student' | 'parent' = 'student',
    country?: string,
    language?: string
  ) => {
    const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
          country: country,
          language_pref: language
        },
      },
    });
    return { error: error as Error | null };
  }, []);

  const signOut = useCallback(async () => {
    if (user) {
      AuthService.logActivity(user.id, 'logout');
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    clearUserData();
  }, [user, clearUserData]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const metadata = user.user_metadata || {};
      const fullName = metadata.full_name || metadata.fullName || metadata.name || metadata.display_name;
      const role = metadata.role || user.app_metadata?.role;

      await loadUserData(user.id, {
        force: true,
        roleFromMeta: role,
        fullNameFromMeta: fullName,
        emailFromMeta: user.email ?? undefined,
      });
    }
  }, [user, loadUserData]);

  // Real-time personal topic subscription
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase.channel(`user:${user.id}`, { config: { private: true } })
      .on('broadcast', { event: 'teacher_update' }, () => refreshProfile())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, refreshProfile]);

  const primaryRole = (user?.user_metadata?.role as AppRole) || (roles.includes('admin') ? 'admin' : roles[0]) || null;
  const isAdmin = roles.includes('admin') || (user?.user_metadata?.role === 'admin');

  // Strict check: User has metadata role OR database role, AND (if not admin) they are either being provisioned or already have a record
  const isTeacher = (roles.includes('teacher') || (user?.user_metadata?.role === 'teacher') || isAdmin);
  const isStudent = (roles.includes('student') || (user?.user_metadata?.role === 'student') || (user?.user_metadata?.role === 'parent'));

  // Real check: Do they actually have the data loaded? (Used for deeper protection)
  const hasTeacherRecord = !!teacher || isAdmin;
  const hasStudentRecord = !!student;

  const isParent = roles.includes('parent') || (user?.user_metadata?.role === 'parent') || (isStudent && (student?.is_parent_account ?? false));


  const contextValue = React.useMemo(() => ({
    user,
    session,
    profile,
    teacher,
    student,
    roles,
    primaryRole,
    isLoading,
    isTeacher,
    isAdmin,
    isStudent,
    isParent,
    linkedChildren,
    activeChild,
    achievements,
    hasTeacherRecord,
    hasStudentRecord,
    displayName,
    displayEmail,

    setActiveChild,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }), [
    user, session, profile, teacher, student, roles, primaryRole, isLoading,
    isTeacher, isAdmin, isStudent, isParent, linkedChildren, activeChild,
    achievements, hasTeacherRecord, hasStudentRecord, displayName, displayEmail,
    setActiveChild, signIn, signUp, signOut, refreshProfile
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
