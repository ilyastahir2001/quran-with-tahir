import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, ArrowRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function ProfileCompletionAlert() {
    const { profile, student, teacher, isStudent, isTeacher } = useAuth();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);

    useEffect(() => {
        if (!profile) return;

        const missing: string[] = [];

        // Common fields
        if (!profile.phone) missing.push("Phone Number");
        if (!profile.country) missing.push("Country");
        if (!profile.language_pref) missing.push("Language Preference");

        // Role specific
        if (isStudent && student) {
            if (!student.timezone) missing.push("Timezone");
        }

        if (isTeacher && teacher) {
            // Teachers might have other critical fields
            if (!teacher.bio) missing.push("Bio");
        }

        setMissingFields(missing);

        // Check if dismissed previously in session (optional, for now just show if missing)
        if (missing.length > 0) {
            setIsVisible(true);
        }
    }, [profile, student, teacher, isStudent, isTeacher]);

    if (!isVisible || missingFields.length === 0) return null;

    return (
        <Alert className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <div className="flex flex-1 items-start justify-between">
                <div>
                    <AlertTitle className="text-amber-800 dark:text-amber-400 font-semibold">
                        Complete your profile
                    </AlertTitle>
                    <AlertDescription className="text-amber-700 dark:text-amber-500 mt-1">
                        Build trust and get better recommendations. You are missing:{" "}
                        <span className="font-medium">{missingFields.join(", ")}</span>.
                    </AlertDescription>
                    <Button
                        variant="link"
                        className="px-0 text-amber-900 dark:text-amber-300 font-semibold h-auto mt-2 flex items-center gap-1 group"
                        onClick={() => navigate("/onboarding")}
                    >
                        Complete Setup <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                    onClick={() => setIsVisible(false)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </Alert>
    );
}
