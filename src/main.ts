import { createDateRange } from '@/get-from-jira/create-date-range';
import { writeWorklogsToFile } from '@/get-from-jira/file-writer';
import { createJiraClient, fetchWorklogs } from '@/get-from-jira/jira-client';
import { validateWorklogs } from '@/get-from-jira/validations';
import { env } from '@/lib/@t3-oss/env';
import { loadTimesheetClients } from '@/send-to-timesheet/load-clients';
import { loadTimesheetCookies } from '@/send-to-timesheet/load-cookies';
import { saveClients } from '@/send-to-timesheet/save-clients';
import { eslintFixFiles } from '@/utils/eslint-fix-files';
import { generateJiraToTimesheetMap } from '@/utils/generate-jira-to-timesheet-map';

const START_DATE = '2026-01-01';
const END_DATE = '2026-01-31';

const main = async (): Promise<void> => {
  console.log(`Conectando ao JIRA: ${env.JIRA_DOMAIN}\n`);

  try {
    const client = createJiraClient({
      domain: env.JIRA_DOMAIN,
      email: env.JIRA_EMAIL,
      token: env.JIRA_TOKEN,
    });
    const dateRange = createDateRange(START_DATE, END_DATE);
    const worklogs = await fetchWorklogs(client, dateRange);

    await writeWorklogsToFile(worklogs);

    validateWorklogs(worklogs);

    console.log('Carregando cookies...');

    const cookies = await loadTimesheetCookies();

    console.log('Carregando clientes...');

    const clients = await loadTimesheetClients(cookies);

    await saveClients(clients);

    await generateJiraToTimesheetMap();

    await eslintFixFiles(['src/generated']);
  } catch (error: any) {
    console.error('\nErro:', error.message);
    process.exit(1);
  }
};

void main();
