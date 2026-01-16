import type { WorklogEntry } from '@/get-from-jira/types';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export const escapeString = (str: string): string => str.replace(/'/g, "\\'");
export const escapeTemplate = (str: string): string => str.replace(/`/g, '\\`');

export const buildFileContent = (entries: WorklogEntry[]): string => {
  const items = entries
    .map((entry, index) => {
      const comma = index < entries.length - 1 ? ',' : '';

      return [
        '  {',
        `    date: '${entry.date.toISOString()}',`,
        `    startTime: '${entry.startTime}',`,
        `    endTime: '${entry.endTime}',`,
        `    key: '${entry.issueKey}',`,
        `    summary: '${escapeString(entry.summary)}',`,
        `    description: \`${escapeTemplate(entry.description)}\`,`,
        `  }${comma}`,
      ].join('\n');
    })
    .join('\n');

  return `const list = [\n${items},\n];\n\nexport default list;\n\n`;
};

export const writeWorklogsToFile = (entries: WorklogEntry[]): void => {
  // Escreve em backups separados por data
  const date = format(new Date(), "yyyy/MM' - 'MMMM/dd", { locale: ptBR });

  const outputDir = `src/backup/worklogs/${date}`;

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = format(new Date(), 'HH-mm-ss');
  const filename = join(outputDir, `${timestamp}.ts`);
  const content = buildFileContent(entries);

  writeFileSync(filename, content, 'utf-8');

  console.log(`\n✅ Arquivo de backup criado: ${filename}`);

  // Sobrescreve o arquivo de worklogs a ser enviado
  const finalOutputDir = `src/to-send`;

  if (!existsSync(finalOutputDir)) {
    mkdirSync(finalOutputDir, { recursive: true });
  }

  const finalFilename = join(finalOutputDir, `worklogs.ts`);
  const finalContent = buildFileContent(entries);

  writeFileSync(finalFilename, finalContent, 'utf-8');

  console.log(`\n✅ Arquivo final criado: ${finalFilename}`);
};
