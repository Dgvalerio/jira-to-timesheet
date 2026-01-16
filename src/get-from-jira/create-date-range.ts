import type { DateRange } from '@/get-from-jira/types';

export const createDateRange = (start?: string, end?: string): DateRange => {
  if (start && end) return { start, end };

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    start: firstDay.toISOString().split('T')[0]!,
    end: lastDay.toISOString().split('T')[0]!,
  };
};
