import { worklogs } from '@/generated/worklogs';
import { parseFromJiraToTimesheet } from '@/send-to-timesheet/parse-from-jira-to-timesheet';
import type { Days } from '@/send-to-timesheet/types';

const t = (
  initial: string,
  final: string
): { initial: string; final: string } => ({ initial, final });

export const days: Days[] = [
  ...worklogs.map(parseFromJiraToTimesheet),
  // Adicione aqui apontamentos extras que não foram feitos no JIRA
  // {
  //   date: '17/12/2025',
  //   time: [t('15:00', '15:30')],
  //   ...mountProject(),
  //   description: `Reunião de OnBoard com o dev no projeto X`,
  // },
];
