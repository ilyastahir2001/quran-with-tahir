import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useImprovements } from '@/hooks/useCommunication';

export default function Improvement() {
  const { improvements, isLoading, stats, markComplete } = useImprovements();
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');

  const filteredImprovements = activeTab === 'pending'
    ? improvements.filter(i => !i.is_completed)
    : improvements.filter(i => i.is_completed);

  const handleMarkComplete = async () => {
    if (!selectedId) return;
    
    await markComplete.mutateAsync({ id: selectedId, evidenceUrl: evidenceUrl || undefined });
    setEvidenceUrl('');
    setSelectedId(null);
  };

  const selectedImprovement = improvements.find(i => i.id === selectedId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Improvement Items</h1>
        <p className="text-muted-foreground">Track and complete improvement items assigned to you</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({stats.completed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredImprovements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">
                {activeTab === 'pending' ? 'No pending improvements' : 'No completed improvements'}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {activeTab === 'pending' 
                  ? 'Great job! You have no pending improvement items.'
                  : 'Completed improvements will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredImprovements.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{item.title}</h3>
                      <Badge variant={item.is_completed ? 'default' : 'secondary'}>
                        {item.is_completed ? (
                          <><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</>
                        ) : (
                          'Pending'
                        )}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Assigned: {format(new Date(item.created_at), 'MMM d, yyyy')}
                      {item.completed_at && (
                        <span className="ml-2">
                          • Completed: {format(new Date(item.completed_at), 'MMM d, yyyy')}
                        </span>
                      )}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    
                    {item.required_action && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs font-medium mb-1">Required Action:</p>
                        <p className="text-sm">{item.required_action}</p>
                      </div>
                    )}

                    {item.evidence_url && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Evidence:</span>
                        <a 
                          href={item.evidence_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {!item.is_completed && (
                      <Button
                        size="sm"
                        onClick={() => setSelectedId(item.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Mark Complete
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Complete Dialog */}
      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Improvement Item</DialogTitle>
            <DialogDescription>
              Mark this improvement as complete. Optionally provide a link to evidence.
            </DialogDescription>
          </DialogHeader>
          
          {selectedImprovement && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Item:</p>
                <p className="text-sm font-medium">{selectedImprovement.title}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="evidence">Evidence URL (optional)</Label>
                <Input
                  id="evidence"
                  type="url"
                  placeholder="https://..."
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSelectedId(null)}>
              Cancel
            </Button>
            <Button onClick={handleMarkComplete} disabled={markComplete.isPending}>
              {markComplete.isPending ? 'Saving...' : 'Mark Complete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
