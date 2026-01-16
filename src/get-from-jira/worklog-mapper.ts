import { parseComment } from '@/get-from-jira/parse-comment';
import type { Issue, RawWorklog, WorklogEntry } from '@/get-from-jira/types';

import { addSeconds, format } from 'date-fns';

export const mapWorklogToEntry = (
  worklog: RawWorklog,
  issue: Issue
): WorklogEntry => {
  const startDate = new Date(worklog.started);
  const endDate = addSeconds(startDate, worklog.timeSpentSeconds);

  return {
    date: startDate,
    startTime: format(startDate, 'HH:mm'),
    endTime: format(endDate, 'HH:mm'),
    issueKey: issue.key,
    summary: issue.fields.summary,
    description: parseComment(worklog.comment),
  };
};
