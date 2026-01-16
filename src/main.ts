import { createDateRange } from '@/get-from-jira/create-date-range';
import { writeWorklogsToFile } from '@/get-from-jira/file-writer';
import { createJiraClient, fetchWorklogs } from '@/get-from-jira/jira-client';
import type { JiraConfig } from '@/get-from-jira/types';
import { validateWorklogs } from '@/get-from-jira/validations';

const config: JiraConfig = {
  domain: 'org.atlassian.net',
  email: 'email@email.com',
  // https://id.atlassian.com/manage-profile/security/api-tokens
  token: 'seu-token-aqui',
};

const startDate = '2026-01-01';
const endDate = '2026-01-31';

const main = async (): Promise<void> => {
  if (config.token === 'seu-api-token-aqui') {
    console.error('ERRO: Configure o API token do JIRA!');
    console.error(
      'Crie um em: https://id.atlassian.com/manage-profile/security/api-tokens'
    );

    return;
  }

  console.log(`Conectando ao JIRA: ${config.domain}\n`);

  try {
    const client = createJiraClient(config);
    const dateRange = createDateRange(startDate, endDate);
    const worklogs = await fetchWorklogs(client, dateRange);

    writeWorklogsToFile(worklogs);

    validateWorklogs(worklogs);
  } catch (error: any) {
    console.error('\nErro:', error.message);
    process.exit(1);
  }
};

void main();
