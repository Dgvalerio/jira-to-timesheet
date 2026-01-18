import { worklogsKeys } from '@/generated/worklogs';
import { eslintFixFiles } from '@/utils/eslint-fix-files';

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export const generateJiraToTimesheetMap = async (): Promise<void> => {
  const content = `
import { mountProject } from '@/generated/clients';
import type { worklogsKeys } from '@/generated/worklogs';
import type { AppointmentReference } from '@/send-to-timesheet/types';

export const JiraToTimesheetMap: Record<
  (typeof worklogsKeys)[number],
  AppointmentReference
> = {
  ${worklogsKeys.map((key) => `  ${key}: mountProject('', '', ''),`).join('\n')}
};

    `;

  const outputDir = `src/generated`;

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const filename = join(outputDir, `jira-to-timesheet-map.ts`);

  writeFileSync(filename, content, 'utf-8');

  await eslintFixFiles([filename]);
};
