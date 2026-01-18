export interface Days {
  client: string;
  project: string;
  category: string;
  date: string;
  description: string;
  time: { initial: string; final: string }[];
}

export interface AppointmentReference {
  client: string;
  project: string;
  category: string;
}

export interface FromJIRA {
  date: string;
  startTime: string;
  endTime: string;
  key: string;
  summary: string;
  description: string;
}

export interface TimesheetCategory {
  Id: number;
  Name: string;
  IdProject: number;
}

export interface TimesheetProject {
  Id: number;
  Name: string;
  StartDate: string;
  EndDate: string;
  IdCustomer: number;
  categories: TimesheetCategory[];
}

export interface TimesheetClient {
  id: string;
  title: string;
  projects: TimesheetProject[];
}

export interface TimesheetAppointment {
  __RequestVerificationToken: string;
  Id: string;
  IdCustomer: string;
  IdProject: string;
  IdCategory: string;
  // No formado dd/MM/yyyy
  InformedDate: string;
  // No formato hh:mm
  StartTime: string;
  // No formato hh:mm
  EndTime: string;
  NotMonetize: string;
  CommitRepository: string;
  Description: string;
}
