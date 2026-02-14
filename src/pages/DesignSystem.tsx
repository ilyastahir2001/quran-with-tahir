import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ColorSwatch = ({ 
  name, 
  variable, 
  className 
}: { 
  name: string; 
  variable: string; 
  className: string;
}) => (
  <div className="flex items-center gap-3">
    <div className={`w-12 h-12 rounded-lg border shadow-sm ${className}`} />
    <div>
      <p className="font-medium text-sm">{name}</p>
      <code className="text-xs text-muted-foreground">{variable}</code>
    </div>
  </div>
);

const StatusPill = ({ 
  label, 
  className 
}: { 
  label: string; 
  className: string;
}) => (
  <span className={`status-pill ${className}`}>{label}</span>
);

export default function DesignSystem() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Design System</h1>
            <p className="text-muted-foreground">Theme tokens and component reference</p>
          </div>
        </div>

        {/* Core Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Core Colors</CardTitle>
            <CardDescription>Primary theme colors used throughout the application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <ColorSwatch name="Background" variable="--background" className="bg-background" />
              <ColorSwatch name="Foreground" variable="--foreground" className="bg-foreground" />
              <ColorSwatch name="Card" variable="--card" className="bg-card" />
              <ColorSwatch name="Primary" variable="--primary" className="bg-primary" />
              <ColorSwatch name="Secondary" variable="--secondary" className="bg-secondary" />
              <ColorSwatch name="Muted" variable="--muted" className="bg-muted" />
              <ColorSwatch name="Accent" variable="--accent" className="bg-accent" />
              <ColorSwatch name="Destructive" variable="--destructive" className="bg-destructive" />
              <ColorSwatch name="Border" variable="--border" className="bg-border" />
              <ColorSwatch name="Ring" variable="--ring" className="bg-ring" />
            </div>
          </CardContent>
        </Card>

        {/* Semantic Status Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Semantic Status Colors</CardTitle>
            <CardDescription>Used for alerts, notifications, and feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <ColorSwatch name="Success" variable="--success" className="bg-success" />
              <ColorSwatch name="Warning" variable="--warning" className="bg-warning" />
              <ColorSwatch name="Info" variable="--info" className="bg-info" />
            </div>
          </CardContent>
        </Card>

        {/* Class Status Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Class Status Colors</CardTitle>
            <CardDescription>Colors representing different class states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <ColorSwatch name="Scheduled" variable="--status-scheduled" className="bg-status-scheduled" />
              <ColorSwatch name="In Progress" variable="--status-in-progress" className="bg-status-in-progress" />
              <ColorSwatch name="Completed" variable="--status-completed" className="bg-status-completed" />
              <ColorSwatch name="Missed" variable="--status-missed" className="bg-status-missed" />
              <ColorSwatch name="No Answer" variable="--status-no-answer" className="bg-status-no-answer" />
              <ColorSwatch name="Cancelled" variable="--status-cancelled" className="bg-status-cancelled" />
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Status Pills</p>
              <div className="flex flex-wrap gap-2">
                <StatusPill label="Scheduled" className="status-scheduled" />
                <StatusPill label="In Progress" className="status-in-progress" />
                <StatusPill label="Completed" className="status-completed" />
                <StatusPill label="Missed" className="status-missed" />
                <StatusPill label="No Answer" className="status-no-answer" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Status Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Status Colors</CardTitle>
            <CardDescription>Colors representing student attendance states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <ColorSwatch name="Present" variable="--attendance-present" className="bg-attendance-present" />
              <ColorSwatch name="Absent" variable="--attendance-absent" className="bg-attendance-absent" />
              <ColorSwatch name="Late" variable="--attendance-late" className="bg-attendance-late" />
              <ColorSwatch name="Leave" variable="--attendance-leave" className="bg-attendance-leave" />
              <ColorSwatch name="No Answer" variable="--attendance-no-answer" className="bg-attendance-no-answer" />
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Attendance Pills</p>
              <div className="flex flex-wrap gap-2">
                <StatusPill label="Present" className="attendance-present" />
                <StatusPill label="Absent" className="attendance-absent" />
                <StatusPill label="Late" className="attendance-late" />
                <StatusPill label="Leave" className="attendance-leave" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Chart Colors</CardTitle>
            <CardDescription>Colors used in data visualizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <ColorSwatch name="Chart 1" variable="--chart-1" className="bg-chart-1" />
              <ColorSwatch name="Chart 2" variable="--chart-2" className="bg-chart-2" />
              <ColorSwatch name="Chart 3" variable="--chart-3" className="bg-chart-3" />
              <ColorSwatch name="Chart 4" variable="--chart-4" className="bg-chart-4" />
              <ColorSwatch name="Chart 5" variable="--chart-5" className="bg-chart-5" />
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Sidebar Colors</CardTitle>
            <CardDescription>Colors specific to the navigation sidebar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <ColorSwatch name="Sidebar BG" variable="--sidebar-background" className="bg-sidebar" />
              <ColorSwatch name="Sidebar Primary" variable="--sidebar-primary" className="bg-sidebar-primary" />
              <ColorSwatch name="Sidebar Accent" variable="--sidebar-accent" className="bg-sidebar-accent" />
              <ColorSwatch name="Sidebar Border" variable="--sidebar-border" className="bg-sidebar-border" />
            </div>
          </CardContent>
        </Card>

        {/* Button Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>Available button styles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </CardContent>
        </Card>

        {/* Badge Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Badge Variants</CardTitle>
            <CardDescription>Available badge styles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>Text styles and hierarchy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold">Heading 1 (text-4xl)</h1>
              <h2 className="text-3xl font-bold">Heading 2 (text-3xl)</h2>
              <h3 className="text-2xl font-semibold">Heading 3 (text-2xl)</h3>
              <h4 className="text-xl font-semibold">Heading 4 (text-xl)</h4>
              <h5 className="text-lg font-medium">Heading 5 (text-lg)</h5>
            </div>
            <div className="border-t pt-4 space-y-2">
              <p className="text-base">Body text (text-base)</p>
              <p className="text-sm text-muted-foreground">Muted text (text-sm text-muted-foreground)</p>
              <p className="text-xs text-muted-foreground">Small text (text-xs)</p>
            </div>
          </CardContent>
        </Card>

        {/* Spacing Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Border Radius</CardTitle>
            <CardDescription>Standard border radius values</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-sm mb-2" />
                <code className="text-xs">rounded-sm</code>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-md mb-2" />
                <code className="text-xs">rounded-md</code>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-lg mb-2" />
                <code className="text-xs">rounded-lg</code>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full mb-2" />
                <code className="text-xs">rounded-full</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
