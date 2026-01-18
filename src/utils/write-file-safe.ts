import * as fs from 'node:fs';
import path from 'node:path';

const HEADER = `/**
 * Arquivo gerado automaticamente via script.
 * Não edite manualmente.
 * */`;

export const writeFileSafe = (
  filePath: string,
  content: string,
  message?: string
): void => {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, `${HEADER}\n\n${content.trim()}\n\n`);

  const relativePath = path.relative(path.join(__dirname, '../'), filePath);

  console.log({
    level: 'info',
    message: message || `✅ Arquivo gerado: ${relativePath}`,
  });
};
