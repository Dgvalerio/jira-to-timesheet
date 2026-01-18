// import { mountProject } from '@/generated/clients';
import { worklogs } from '@/generated/worklogs';
import { parseFromJiraToTimesheet } from '@/send-to-timesheet/parse-from-jira-to-timesheet';
import type { Appointment } from '@/send-to-timesheet/types';

export const appointments: Appointment[] = [
  ...worklogs.map(parseFromJiraToTimesheet),
  // Adicione aqui apontamentos extras que não foram feitos no JIRA
  // {
  //   date: '17/12/2025',
  //   initialTime: '15:00',
  //   finalTime: '15:30',
  //   ...mountProject('', '', ''),
  //   description: `Reunião de OnBoard com o dev no projeto X`,
  // },
];
