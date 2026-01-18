import { ESLint } from 'eslint';

export const eslintFixFiles = async (
  patterns: string | string[]
): Promise<void> => {
  const eslint = new ESLint({ fix: true });

  const results = await eslint.lintFiles(patterns);

  await ESLint.outputFixes(results);
};
