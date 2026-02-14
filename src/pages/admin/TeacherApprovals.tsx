import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminService } from '@/services/admin.service';
import { useAuth } from '@/hooks/useAuth';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TeacherStatus, Teacher, Profile, ProfileMetadata } from "@/types/database";

export default function TeacherApprovals() {
    const { profile } = useAuth();
    const queryClient = useQueryClient();
    const [verifiedIds, setVerifiedIds] = useState<Set<string>>(new Set());

    const toggleVerified = (id: string) => {
        const newIds = new Set(verifiedIds);
        if (newIds.has(id)) newIds.delete(id);
        else newIds.add(id);
        setVerifiedIds(newIds);
    };

    // Fetch pending teachers
    const { data: pendingTeachers, isLoading } = useQuery({
        queryKey: ['pending-teachers'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('teachers')
                .select(`
          id,
          status,
          created_at,
          specializations,
          bio,
          profile:profiles!inner(*)
        `)
                .eq('status', 'pending');

            if (error) throw error;
            return data as unknown as (Teacher & { profile: Profile })[];
        }
    });

    // Real-time updates for pending approvals
    useEffect(() => {
        const channel = supabase
            .channel('admin-teacher-approvals')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'teachers' },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['pending-teachers'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    // Approve/Reject mutation
    const updateStatus = useMutation({
        mutationFn: async ({ id, status, is_verified, profileId, userId }: { id: string; status: TeacherStatus; is_verified?: boolean; profileId: string; userId: string | null }) => {
            const updates: { status: TeacherStatus; is_verified?: boolean } = { status };
            if (is_verified !== undefined) {
                updates.is_verified = is_verified;
            }

            // 1. Update Teacher Record
            const { error: teacherError } = await supabase
                .from('teachers')
                .update(updates)
                .eq('id', id);

            if (teacherError) throw teacherError;

            // 2. Update Profile Metadata for scalability and easy access
            if (profileId) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('metadata')
                    .eq('id', profileId)
                    .single();

                const newMetadata = {
                    ...(profileData?.metadata as ProfileMetadata || {}),
                    approval_status: status
                };

                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ metadata: newMetadata })
                    .eq('id', profileId);

                if (profileError) console.error('AdminApproval: Metadata sync failed', profileError);
            }

            // 3. Broadcast real-time update to the teacher
            if (userId) {
                console.log(`AdminApproval: Broadcasting update to user:${userId}`);
                await supabase.channel(`user:${userId}`).send({
                    type: 'broadcast',
                    event: 'teacher_update',
                    payload: { status }
                });
            }
        },
        onSuccess: (_, { id, status, is_verified }) => {
            queryClient.invalidateQueries({ queryKey: ['pending-teachers'] });
            if (profile?.id) {
                AdminService.logAction(profile.id, 'TEACHER_APPROVAL_UPDATE', 'teacher', id, { status, is_verified });
            }
            toast.success('Teacher status updated successfully');
        },
        onError: (error) => {
            console.error('Update status error:', error);
            toast.error('Failed to update status');
        }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Teacher Approvals</h1>
                <Badge variant="secondary">
                    {pendingTeachers?.length || 0} Pending
                </Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Applications</CardTitle>
                </CardHeader>
                <CardContent>
                    {pendingTeachers?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No pending approvals found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Teacher</TableHead>
                                    <TableHead>Applied</TableHead>
                                    <TableHead>Bio</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingTeachers?.map((teacher) => (
                                    <TableRow key={teacher.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={teacher.profile?.avatar_url || ''} alt={teacher.profile?.full_name || 'Teacher Name'} />
                                                    <AvatarFallback>
                                                        {teacher.profile?.full_name?.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{teacher.profile?.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">{teacher.profile?.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(teacher.created_at), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="max-w-md truncate">
                                            {teacher.bio || 'No bio provided'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex flex-col items-end gap-3">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`verify-${teacher.id}`}
                                                        checked={verifiedIds.has(teacher.id)}
                                                        onCheckedChange={() => toggleVerified(teacher.id)}
                                                    />
                                                    <Label
                                                        htmlFor={`verify-${teacher.id}`}
                                                        className="text-xs font-medium cursor-pointer flex items-center"
                                                    >
                                                        <ShieldCheck className="h-3 w-3 mr-1 text-primary" />
                                                        Verify Identity
                                                    </Label>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => updateStatus.mutate({
                                                            id: teacher.id,
                                                            status: 'rejected',
                                                            profileId: teacher.profile.id,
                                                            userId: teacher.profile.user_id
                                                        })}
                                                        disabled={updateStatus.isPending}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => updateStatus.mutate({
                                                            id: teacher.id,
                                                            status: 'approved',
                                                            is_verified: verifiedIds.has(teacher.id),
                                                            profileId: teacher.profile.id,
                                                            userId: teacher.profile.user_id
                                                        })}
                                                        disabled={updateStatus.isPending}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
