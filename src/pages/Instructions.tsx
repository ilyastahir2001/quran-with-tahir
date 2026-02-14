import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  BookOpen, 
  Loader2, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Play,
  FolderOpen
} from 'lucide-react';
import { useInstructions } from '@/hooks/useDocuments';

export default function Instructions() {
  const { instructions, groupedInstructions, isLoading } = useInstructions();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(Object.keys(groupedInstructions)));

  // Update expanded categories when data loads
  React.useEffect(() => {
    setExpandedCategories(new Set(Object.keys(groupedInstructions)));
  }, [Object.keys(groupedInstructions).length]);

  // Filter instructions based on search
  const filteredGroupedInstructions = useMemo(() => {
    if (!searchQuery.trim()) return groupedInstructions as Record<string, typeof instructions>;
    
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, typeof instructions> = {};
    
    Object.entries(groupedInstructions as Record<string, typeof instructions>).forEach(([category, categoryInstructions]) => {
      const matchingInstructions = (categoryInstructions as typeof instructions).filter(
        (instruction: { title: string; content?: string | null }) => 
          instruction.title.toLowerCase().includes(query) ||
          instruction.content?.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query)
      );
      if (matchingInstructions.length > 0) {
        filtered[category] = matchingInstructions;
      }
    });
    
    return filtered;
  }, [groupedInstructions, searchQuery]);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Parse video URL for embedding
  const getEmbedUrl = (url: string): string | null => {
    try {
      // YouTube
      const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
      }
      // Vimeo
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      }
      return url; // Return as-is for other embed URLs
    } catch {
      return null;
    }
  };

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
        <h1 className="text-2xl font-bold tracking-tight">Instructions</h1>
        <p className="text-muted-foreground">How-to guides and video tutorials</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search instructions..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Instructions List */}
      {instructions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No instructions available</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Guides and tutorials will appear here when available.
          </p>
        </div>
      ) : Object.keys(filteredGroupedInstructions).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No matching instructions</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Try adjusting your search query.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(filteredGroupedInstructions).map(([category, categoryInstructions]) => {
            const instructionsList = categoryInstructions as Array<{
              id: string;
              title: string;
              content?: string | null;
              video_url?: string | null;
            }>;
            return (
            <Collapsible 
              key={category}
              open={expandedCategories.has(category)}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                <FolderOpen className="h-5 w-5" />
                <span className="font-semibold flex-1 text-left">{category}</span>
                <Badge variant="secondary">{instructionsList.length}</Badge>
                {expandedCategories.has(category) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-3 mt-3">
                {instructionsList.map((instruction) => {
                  const isExpanded = expandedIds.has(instruction.id);
                  const hasContent = instruction.content && instruction.content.length > 0;
                  const embedUrl = instruction.video_url ? getEmbedUrl(instruction.video_url) : null;
                  
                  return (
                    <Card key={instruction.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium">{instruction.title}</h3>
                          {instruction.video_url && (
                            <Badge variant="outline" className="shrink-0">
                              <Play className="h-3 w-3 mr-1" />
                              Video
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Video Embed */}
                        {embedUrl && isExpanded && (
                          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                            <iframe
                              src={embedUrl}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={instruction.title}
                            />
                          </div>
                        )}
                        
                        {/* Content */}
                        {hasContent && (
                          <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(instruction.id)}>
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {isExpanded ? instruction.content : `${instruction.content!.slice(0, 150)}${instruction.content!.length > 150 ? '...' : ''}`}
                            </div>
                            {(instruction.content!.length > 150 || embedUrl) && (
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                                  {isExpanded ? (
                                    <>Show Less <ChevronUp className="h-4 w-4 ml-1" /></>
                                  ) : (
                                    <>
                                      {embedUrl ? 'Watch Video' : 'Read More'} 
                                      <ChevronDown className="h-4 w-4 ml-1" />
                                    </>
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            )}
                          </Collapsible>
                        )}
                        
                        {/* Video-only (no content) */}
                        {!hasContent && embedUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleExpanded(instruction.id)}
                          >
                            {isExpanded ? (
                              <>Hide Video <ChevronUp className="h-4 w-4 ml-1" /></>
                            ) : (
                              <>Watch Video <Play className="h-4 w-4 ml-1" /></>
                            )}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          );
          })}
        </div>
      )}
    </div>
  );
}
