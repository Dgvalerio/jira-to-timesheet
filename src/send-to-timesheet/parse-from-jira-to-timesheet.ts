import { JiraToTimesheetMap } from '@/generated/jira-to-timesheet-map';
import type {
  AppointmentReference,
  Appointment,
  FromJIRA,
} from '@/send-to-timesheet/types';

import { format, parseISO } from 'date-fns';

export const parseFromJiraToTimesheet = (jira: FromJIRA): Appointment => {
  const key = jira.key.split('-')[0];

  if (!Object.hasOwn(JiraToTimesheetMap, key)) {
    throw new Error(`O projeto "${key}" não foi mapeado!`);
  }

  const project: AppointmentReference =
    JiraToTimesheetMap[key as keyof typeof JiraToTimesheetMap];

  return {
    date: format(parseISO(jira.date), 'dd/MM/yyyy'),
    initialTime: jira.startTime,
    finalTime: jira.endTime,
    description:
      `Trabalhando em ${jira.key}: ${jira.summary}` +
      (jira.description === 'Sem descrição' ? '' : ` (${jira.description})`),
    ...project,
  };
};
