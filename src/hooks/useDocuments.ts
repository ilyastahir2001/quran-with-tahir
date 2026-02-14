import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

import type { RulesDocument, Instruction } from '@/types/database';

export function useRulesDocuments(): {
  rules: RulesDocument[];
  groupedRules: Record<string, RulesDocument[]>;
  isLoading: boolean;
  error: any;
} {
  const rulesQuery = useQuery({
    queryKey: ['rules_documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rules_documents')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('title', { ascending: true });

      if (error) throw error;
      return data as RulesDocument[];
    },
  });

  // Group by category
  const groupedRules = (rulesQuery.data ?? []).reduce((acc, rule) => {
    const category = rule.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(rule);
    return acc;
  }, {} as Record<string, RulesDocument[]>);

  return {
    rules: rulesQuery.data ?? [],
    groupedRules,
    isLoading: rulesQuery.isLoading,
    error: rulesQuery.error,
  };
}

export function useInstructions(): {
  instructions: Instruction[];
  groupedInstructions: Record<string, Instruction[]>;
  isLoading: boolean;
  error: any;
} {
  const instructionsQuery = useQuery({
    queryKey: ['instructions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instructions')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .order('title', { ascending: true });

      if (error) throw error;
      return data as Instruction[];
    },
  });

  // Group by category
  const groupedInstructions = (instructionsQuery.data ?? []).reduce((acc, instruction) => {
    const category = instruction.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(instruction);
    return acc;
  }, {} as Record<string, Instruction[]>);

  return {
    instructions: instructionsQuery.data ?? [],
    groupedInstructions,
    isLoading: instructionsQuery.isLoading,
    error: instructionsQuery.error,
  };
}
