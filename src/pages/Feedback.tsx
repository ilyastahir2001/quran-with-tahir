import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageCircle, Star, Loader2, User, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useFeedback } from '@/hooks/useCommunication';

export default function Feedback() {
  const { feedback, isLoading, respondToFeedback } = useFeedback();
  const [filter, setFilter] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [response, setResponse] = useState('');

  const filteredFeedback = filter === 'all' 
    ? feedback 
    : feedback.filter(f => f.from_type === filter);

  const handleRespond = async () => {
    if (!selectedFeedback || !response.trim()) return;
    
    await respondToFeedback.mutateAsync({ id: selectedFeedback, response });
    setResponse('');
    setSelectedFeedback(null);
  };

  const currentFeedback = feedback.find(f => f.id === selectedFeedback);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
          <p className="text-muted-foreground">View feedback from students and admin</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Feedback</SelectItem>
            <SelectItem value="student">From Students</SelectItem>
            <SelectItem value="admin">From Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No feedback yet</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Feedback from students and admin will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedback.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.from_type === 'student' ? (
                      <User className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Users className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium capitalize">{item.from_type || 'Unknown'}</span>
                    {item.subject && (
                      <span className="text-muted-foreground">• {item.subject}</span>
                    )}
                  </div>
                  {item.rating && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < item.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(item.created_at), 'MMM d, yyyy')}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{item.message}</p>
                
                {item.teacher_response ? (
                  <div className="mt-3 p-3 bg-primary/5 rounded-lg border-l-2 border-primary">
                    <p className="text-xs font-medium mb-1">Your Response:</p>
                    <p className="text-sm">{item.teacher_response}</p>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFeedback(item.id)}
                  >
                    Respond
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Respond Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Respond to Feedback</DialogTitle>
          </DialogHeader>
          
          {currentFeedback && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Original Feedback:</p>
                <p className="text-sm">{currentFeedback.message}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="response">Your Response</Label>
                <Textarea
                  id="response"
                  placeholder="Write your response..."
                  rows={4}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSelectedFeedback(null)}>
              Cancel
            </Button>
            <Button onClick={handleRespond} disabled={respondToFeedback.isPending || !response.trim()}>
              {respondToFeedback.isPending ? 'Sending...' : 'Send Response'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
