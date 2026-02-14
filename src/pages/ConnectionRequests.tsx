import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, Users, UserCheck, UserX } from 'lucide-react';
import { useConnectionRequests } from '@/hooks/useConnectionRequests';
import { ConnectionRequestCard } from '@/components/connection/ConnectionRequestCard';

export default function ConnectionRequests() {
  const [activeTab, setActiveTab] = useState('pending');
  const { 
    requests, 
    pendingCount, 
    isLoading, 
    acceptRequest, 
    rejectRequest 
  } = useConnectionRequests();

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const acceptedRequests = requests.filter(r => r.status === 'accepted');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  const handleAccept = (requestId: string, studentId: string) => {
    acceptRequest.mutate({ requestId, studentId });
  };

  const handleReject = (requestId: string) => {
    rejectRequest.mutate(requestId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Connection Requests</h1>
          {pendingCount > 0 && (
            <Badge className="bg-amber-500 text-white">
              {pendingCount} pending
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">Manage student connection requests</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pending" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Pending
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted" className="gap-2">
            <UserCheck className="h-4 w-4" />
            Accepted
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <UserX className="h-4 w-4" />
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">No Pending Requests</h3>
                <p className="text-muted-foreground">
                  New connection requests from students will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <ConnectionRequestCard
                  key={request.id}
                  request={request}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  isAccepting={acceptRequest.isPending}
                  isRejecting={rejectRequest.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-6">
          {acceptedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">No Accepted Requests</h3>
                <p className="text-muted-foreground">
                  Students you've connected with will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {acceptedRequests.map((request) => (
                <ConnectionRequestCard
                  key={request.id}
                  request={request}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">No Rejected Requests</h3>
                <p className="text-muted-foreground">
                  Declined connection requests will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rejectedRequests.map((request) => (
                <ConnectionRequestCard
                  key={request.id}
                  request={request}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
