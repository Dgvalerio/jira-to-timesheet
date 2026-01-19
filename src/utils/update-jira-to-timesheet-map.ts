import type { AppointmentReference } from '@/send-to-timesheet/types';
import { eslintFixFiles } from '@/utils/eslint-fix-files';

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { pathToFileURL } from 'node:url';
import { join, resolve } from 'path';

export const updateJiraToTimesheetMap = async (): Promise<void> => {
  const outputDir = `src/generated`;

  const clientsPath = resolve(process.cwd(), 'src/generated/clients.ts');
  const worklogsPath = resolve(process.cwd(), 'src/generated/worklogs.ts');

  const clientsModule = await import(
    `${pathToFileURL(clientsPath).href}?v=${Date.now()}`
  );
  const worklogsModule = await import(
    `${pathToFileURL(worklogsPath).href}?v=${Date.now()}`
  );

  const { categoryMap, clientMap, projectMap } = clientsModule as {
    categoryMap: Record<string, string>;
    clientMap: Record<string, string>;
    projectMap: Record<string, string>;
  };
  const { worklogsKeys } = worklogsModule as { worklogsKeys: string[] };

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const filename = join(outputDir, `jira-to-timesheet-map.ts`);

  let mapper: Record<string, AppointmentReference> = {};

  if (existsSync(filename)) {
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

      if (!mapper[key]) return empty;

      const ref = mapper[key];

      if (!ref.client || !ref.project || !ref.category) return empty;

      const client = clientMap[ref.client as keyof typeof clientMap];

      if (!client) return empty;

      const project = projectMap[ref.project as keyof typeof projectMap];

      if (!project) return empty;

      const category = categoryMap[ref.category as keyof typeof categoryMap];

      if (!category) return empty;

      return `  ${key}: mountProject('${client} (ID: ${ref.client})', '${project} (ID: ${ref.project})', '${category} (ID: ${ref.category})'),`;
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
