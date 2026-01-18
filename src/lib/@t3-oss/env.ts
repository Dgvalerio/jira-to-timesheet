import { createEnv } from '@t3-oss/env-core';

import { z } from 'zod';

export const env = createEnv({
  server: {
    JIRA_DOMAIN: z.url(),
    JIRA_EMAIL: z.email(),
    JIRA_TOKEN: z
      .string()
      .min(
        1,
        'O token é obrigatório. Gere em https://id.atlassian.com/manage-profile/security/api-tokens'
      ),
    TIMESHEET_LOGIN: z.email(),
    TIMESHEET_PASSWORD: z.string().min(1),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
