import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  FileText, 
  Loader2, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  FolderOpen
} from 'lucide-react';
import { useRulesDocuments } from '@/hooks/useDocuments';

export default function Rules() {
  const { rules, groupedRules, isLoading } = useRulesDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(Object.keys(groupedRules)));

  // Update expanded categories when data loads
  React.useEffect(() => {
    setExpandedCategories(new Set(Object.keys(groupedRules)));
  }, [Object.keys(groupedRules).length]);

  // Filter rules based on search
  const filteredGroupedRules = useMemo(() => {
    if (!searchQuery.trim()) return groupedRules;
    
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, typeof rules> = {};
    
    Object.entries(groupedRules).forEach(([category, categoryRules]) => {
      const rulesArray = categoryRules as typeof rules;
      const matchingRules = rulesArray.filter(
        (rule) => 
          rule.title.toLowerCase().includes(query) ||
          rule.content?.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query)
      );
      if (matchingRules.length > 0) {
        filtered[category] = matchingRules;
      }
    });
    
    return filtered;
  }, [groupedRules, searchQuery]);

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
        <h1 className="text-2xl font-bold tracking-tight">Academy Rules</h1>
        <p className="text-muted-foreground">Policies and procedures for teachers</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search rules..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Rules List */}
      {rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No rules documents</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Rules and policies will appear here when available.
          </p>
        </div>
      ) : Object.keys(filteredGroupedRules).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No matching rules</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Try adjusting your search query.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(filteredGroupedRules).map(([category, categoryRules]) => {
            const rulesArray = categoryRules as typeof rules;
            return (
            <Collapsible 
              key={category}
              open={expandedCategories.has(category)}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                <FolderOpen className="h-5 w-5" />
                <span className="font-semibold flex-1 text-left">{category}</span>
                <Badge variant="secondary">{rulesArray.length}</Badge>
                {expandedCategories.has(category) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-3 mt-3">
                {rulesArray.map((rule) => {
                  const isExpanded = expandedIds.has(rule.id);
                  const hasContent = rule.content && rule.content.length > 0;
                  
                  return (
                    <Card key={rule.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium">{rule.title}</h3>
                          {rule.pdf_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a href={rule.pdf_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View PDF
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      {hasContent && (
                        <CardContent>
                          <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(rule.id)}>
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {isExpanded ? rule.content : `${rule.content!.slice(0, 150)}${rule.content!.length > 150 ? '...' : ''}`}
                            </div>
                            {rule.content!.length > 150 && (
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                                  {isExpanded ? (
                                    <>Show Less <ChevronUp className="h-4 w-4 ml-1" /></>
                                  ) : (
                                    <>Read More <ChevronDown className="h-4 w-4 ml-1" /></>
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            )}
                          </Collapsible>
                        </CardContent>
                      )}
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
