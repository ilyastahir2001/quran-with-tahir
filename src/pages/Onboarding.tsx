import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";

// Helper for timezones
const timezones = Intl.supportedValuesOf('timeZone');

const formSchema = z.object({
    full_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    phone: z.string().min(5, { message: "Please enter a valid phone number." }),
    country: z.string().min(2, { message: "Please select your country." }),
    timezone: z.string().min(1, { message: "Timezone is required for scheduling." }),
    language_pref: z.string().min(1, { message: "Please select details." }),
});

export default function Onboarding() {
    const { profile, student, refreshProfile, isStudent } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Define defaults based on existing data
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            full_name: profile?.full_name || "",
            phone: profile?.phone || "",
            country: profile?.country || "",
            timezone: student?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            language_pref: profile?.language_pref || "English",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!profile?.id) return;
        setIsSubmitting(true);

        try {
            // Update Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: values.full_name,
                    phone: values.phone,
                    country: values.country,
                    language_pref: values.language_pref,
                })
                .eq('id', profile.id);

            if (profileError) throw profileError;

            // Update Student specific fields
            if (isStudent && student?.id) {
                const { error: studentError } = await supabase
                    .from('students')
                    .update({
                        timezone: values.timezone
                    })
                    .eq('id', student.id);

                if (studentError) throw studentError;
            }

            await refreshProfile();

            toast({
                title: "Profile Updated",
                description: "Your information has been saved successfully.",
            });

            // Redirect back to dashboard
            navigate(isStudent ? "/student/dashboard" : "/teacher/dashboard");

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update profile.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
                    </div>
                    <CardDescription>
                        Help us personalize your experience and ensure you never miss class updates.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <FormField
                                control={form.control}
                                name="full_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+1 234 567 8900" {...field} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Ideally WhatsApp for quick alerts.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <FormControl>
                                                <Input placeholder="USA, UK, etc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {isStudent && (
                                <FormField
                                    control={form.control}
                                    name="timezone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Timezone</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select your timezone" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {timezones.map((tz) => (
                                                        <SelectItem key={tz} value={tz}>
                                                            {tz}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Crucial for accurate class scheduling.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="language_pref"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preferred Language</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value || "English"}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select language" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="English">English</SelectItem>
                                                <SelectItem value="Urdu">Urdu</SelectItem>
                                                <SelectItem value="Arabic">Arabic</SelectItem>
                                                <SelectItem value="French">French</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save & Continue"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
