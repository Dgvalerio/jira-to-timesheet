import type {
  DateRange,
  Issue,
  JiraConfig,
  RawWorklog,
  WorklogEntry,
} from '@/get-from-jira/types';
import { mapWorklogToEntry } from '@/get-from-jira/worklog-mapper';

import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { format } from 'date-fns';

export const createJiraClient = (config: JiraConfig): AxiosInstance => {
  const authHeader = Buffer.from(`${config.email}:${config.token}`).toString(
    'base64'
  );

  return axios.create({
    baseURL: `${config.domain}/rest/api/3`,
    headers: {
      Authorization: `Basic ${authHeader}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });
};

export const getCurrentUserId = async (
  client: AxiosInstance
): Promise<string> => {
  try {
    const response = await client.get('/myself');

    return response.data.accountId;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Autenticacao falhou: Verifique email e API token');
    }

    throw new Error(`Erro ao buscar usuario: ${error.message}`);
  }
};

export const findIssuesWithWorklogs = async (
  client: AxiosInstance,
  dateRange: DateRange
): Promise<Issue[]> => {
  const jql = `worklogAuthor = currentUser() AND worklogDate >= "${dateRange.start}" AND worklogDate <= "${dateRange.end}"`;

  try {
    const response = await client.post('/search/jql', {
      jql,
      fields: ['summary'],
      maxResults: 100,
    });

    return response.data.issues ?? [];
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        `Erro HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`
      );
    }

    throw new Error(`Erro: ${error.message}`);
  }
};

export const findWorklogsForIssue = async (
  client: AxiosInstance,
  issueKey: string,
  userId: string,
  dateRange: DateRange
): Promise<RawWorklog[]> => {
  try {
    const response = await client.get(`/issue/${issueKey}/worklog`);

    return (response.data.worklogs ?? []).filter((worklog: RawWorklog) => {
      const worklogDate = worklog.started.split('T')[0] ?? '';

      return (
        worklog.author.accountId === userId &&
        worklogDate >= dateRange.start &&
        worklogDate <= dateRange.end
      );
    });
  } catch (error) {
    throw new Error(`Erro ao buscar worklogs para ${issueKey}: ${error}`);
  }
};

export const fetchWorklogs = async (
  client: AxiosInstance,
  dateRange: DateRange
): Promise<WorklogEntry[]> => {
  console.log(
    `Buscando worklogs de ${dateRange.start} ate ${dateRange.end}...\n`
  );

  const [userId, issues] = await Promise.all([
    getCurrentUserId(client),
    findIssuesWithWorklogs(client, dateRange),
  ]);

  console.log(`Total de issues encontradas: ${issues.length}\n`);

  const entries: WorklogEntry[] = [];

  for (const issue of issues) {
    const worklogs = await findWorklogsForIssue(
      client,
      issue.key,
      userId,
      dateRange
    );

    for (const worklog of worklogs) {
      const entry = mapWorklogToEntry(worklog, issue);

      entries.push(entry);

      const displayDate = format(entry.date, 'dd/MM/yyyy');

      console.log(
        `${displayDate} ${entry.startTime}-${entry.endTime} | ${entry.issueKey} - ${entry.summary}`
      );
    }
  }

  return entries.sort((a, b) => a.date.getTime() - b.date.getTime());
};
