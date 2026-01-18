import { JiraToTimesheetMap } from '@/generated/jira-to-timesheet-map';
import type {
  AppointmentReference,
  Days,
  FromJIRA,
} from '@/send-to-timesheet/types';

import { format, parseISO } from 'date-fns';

const t = (
  initial: string,
  final: string
): { initial: string; final: string } => ({ initial, final });

export const parseFromJiraToTimesheet = (jira: FromJIRA): Days => {
  const key = jira.key.split('-')[0];

  if (!Object.hasOwn(JiraToTimesheetMap, key)) {
    throw new Error(`O projeto "${key}" não foi mapeado!`);
  }

  const project: AppointmentReference =
    JiraToTimesheetMap[key as keyof typeof JiraToTimesheetMap];

  return {
    date: format(parseISO(jira.date), 'dd/MM/yyyy'),
    time: [t(jira.startTime, jira.endTime)],
    description:
      `Trabalhando em ${jira.key}: ${jira.summary}` +
      (jira.description === 'Sem descrição' ? '' : ` (${jira.description})`),
    ...project,
  };
};
