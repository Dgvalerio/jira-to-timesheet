export interface JiraConfig {
  readonly domain: string;
  readonly email: string;
  readonly token: string;
}

export interface DateRange {
  readonly start: string;
  readonly end: string;
}

export interface WorklogEntry {
  readonly date: Date;
  readonly startTime: string;
  readonly endTime: string;
  readonly issueKey: string;
  readonly summary: string;
  readonly description: string;
}

export interface RawWorklog {
  id: string;
  author: { accountId: string; displayName: string };
  started: string;
  timeSpentSeconds: number;
  comment?: WorklogComment;
}

export type WorklogComment =
  | string
  | {
      type: string;
      content: {
        type: string;
        content?: { type: string; text: string }[];
      }[];
    };

export interface Issue {
  key: string;
  fields: { summary: string };
}

export interface TimeSlot {
  initial: string;
  final: string;
}

export interface DaySchedule {
  [date: string]: TimeSlot[];
}

export interface Conflict {
  date: string;
  slot1: TimeSlot;
  slot2: TimeSlot;
}

export interface LunchViolation {
  date: string;
  slot: TimeSlot;
}
