import { clientsList } from '@/generated/clients';
import { worklogsKeys } from '@/generated/worklogs';
import type { AppointmentReference } from '@/send-to-timesheet/types';
import { eslintFixFiles } from '@/utils/eslint-fix-files';

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'path';

export const updateJiraToTimesheetMap = async (): Promise<void> => {
  const outputDir = `src/generated`;

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const filename = join(outputDir, `jira-to-timesheet-map.ts`);

  let mapper: Record<string, AppointmentReference> = {};

  if (fs.existsSync(filename)) {
    try {
      const fileUrl = `${pathToFileURL(filename).href}?update=${Date.now()}`;

      const module = await import(fileUrl);

      if (module.JiraToTimesheetMap) {
        mapper = module.JiraToTimesheetMap;
        console.log(
          `♻️ Carregados ${Object.keys(mapper).length} itens existentes.`
        );
      }
    } catch (error) {
      console.warn(
        '⚠️ Arquivo existe mas não consegui importar. Criando do zero.',
        error
      );
    }
  }

  worklogsKeys.forEach((key) => {
    if (!mapper[key]) {
      mapper[key] = { client: '', project: '', category: '' };
    }
  });

  const content = `
import { mountProject } from '@/generated/clients';
import type { worklogsKeys } from '@/generated/worklogs';
import type { AppointmentReference } from '@/send-to-timesheet/types';

export const JiraToTimesheetMap: Record<
  (typeof worklogsKeys)[number],
  AppointmentReference
> = {
  ${worklogsKeys
    .map((key) => {
      const empty = `  ${key}: mountProject('', '', ''),`;

      console.log(1);
      if (!mapper[key]) return empty;
      console.log(2);

      const ref = mapper[key];

      console.log(3, { ref });
      if (!ref.client || !ref.project || !ref.category) return empty;
      console.log(4);

      const client = clientsList.find((item) => item.id === ref.client);

      console.log(5, { client });
      if (!client) return empty;
      console.log(6);

      const project = client.projects.find(
        (item) => String(item.Id) === ref.project
      );

      console.log(7, { project });
      if (!project) return empty;
      console.log(8);

      const category = project.categories.find(
        (item) => String(item.Id) === ref.category
      );

      console.log(9, { category });
      if (!category) return empty;
      console.log(0);

      return `  ${key}: mountProject('${client.title} (ID: ${client.id})', '${project.Name} (ID: ${[project.Id]})', '${category.Name} (ID: ${category.Id})'),`;
    })
    .join('\n')}
} as const;

    `;

  writeFileSync(filename, content, 'utf-8');

  await eslintFixFiles([filename]);

  console.log(
    `✅ Mapa atualizado com sucesso! Total de itens: ${Object.keys(mapper).length}`
  );
};
