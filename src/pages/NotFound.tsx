import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, BookOpen, Calendar, Users } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { isTeacher, isStudent } = useAuth();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const teacherLinks = [
    { href: "/teacher/dashboard", label: "Dashboard", icon: Home, description: "Return to your main dashboard" },
    { href: "/teacher/today-classes", label: "Today's Classes", icon: Calendar, description: "View your scheduled classes" },
    { href: "/teacher/students", label: "My Students", icon: Users, description: "Manage your students" },
    { href: "/teacher/lessons/history", label: "Lesson History", icon: BookOpen, description: "Browse past lessons" },
  ];

  const studentLinks = [
    { href: "/student/dashboard", label: "Dashboard", icon: Home, description: "Return to your main dashboard" },
    { href: "/student/today", label: "Today's Classes", icon: Calendar, description: "View your scheduled classes" },
  ];

  const suggestedLinks = isStudent ? studentLinks : teacherLinks;
  const homeLink = isStudent ? "/student/dashboard" : "/teacher/dashboard";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-4xl font-bold text-primary">404</span>
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <p className="text-muted-foreground mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            {suggestedLinks.map(({ href, label, icon: Icon, description }) => (
              <Link
                key={href}
                to={href}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground truncate">{description}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button className="flex-1" asChild>
              <Link to={homeLink}>
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
