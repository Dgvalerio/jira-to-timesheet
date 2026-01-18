# Jira to Timesheet - Documentation

Documenting the simple script to sync Jira worklogs to Timesheet.

## Prerequisites

Before running the scripts, you need to configure your environment variables.
Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Fill in the `.env` file with:
- `JIRA_DOMAIN`: Your Jira URL (e.g., https://organization.atlassian.net)
- `JIRA_EMAIL`: Your Jira email
- `JIRA_TOKEN`: Your Jira API Token (https://id.atlassian.com/manage-profile/security/api-tokens)
- `TIMESHEET_LOGIN`: Your Timesheet login email
- `TIMESHEET_PASSWORD`: Your Timesheet password

## Usage Workflow

Follow this step-by-step guide to sync your worklogs.

### 1. Configure Date Range

Open `src/get-data.ts` and set the `START_DATE` and `END_DATE` variables to define the period you want to fetch worklogs for.

> **Note**: Dates must be in the `yyyy-MM-dd` format.

```typescript
// src/get-data.ts
const START_DATE = '2026-01-03';
const END_DATE = '2026-01-05';
```

### 2. Fetch Data from Jira

Run the get script to fetch worklogs from Jira and generate the necessary configuration files.

```bash
yarn get
```

This will:
- Fetch worklogs from Jira.
- Load Timesheet clients.
- Create/Update `src/generated/jira-to-timesheet-map.ts`.

### 3. Map Jira Projects to Timesheet

After running `yarn get`, check the file `src/generated/jira-to-timesheet-map.ts`.
This file maps the Jira project keys (e.g., 'SCP') to the corresponding Timesheet project/task.

You need to ensure each Jira key corresponds to the correct Timesheet project using `mountProject`.

```typescript
// src/generated/jira-to-timesheet-map.ts
export const JiraToTimesheetMap = {
  SCP: mountProject(
    'CLIENT NAME (ID)',
    'PROJECT NAME (ID)',
    'TASK NAME (ID)'
  ),
} as const;
```

### 4. (Optional) Add Manual Appointments

If you have work that wasn't logged in Jira, you can manually add appointments in `src/send-to-timesheet/appointments.ts`.

```typescript
// src/send-to-timesheet/appointments.ts
export const appointments: Appointment[] = [
  ...worklogs.map(parseFromJiraToTimesheet),
  // Manual entry example:
  {
    date: '17/12/2025',
    initialTime: '15:00',
    finalTime: '15:30',
    ...mountProject('Client', 'Project', 'Task'),
    description: `Manual meeting`,
  },
];
```

### 5. Send to Timesheet

Finally, run the send script to upload your appointments to the Timesheet.

```bash
yarn send
```

## Contributing

Feel free to contribute! If you want to request changes or add features, please open an [issue](https://github.com/Dgvalerio/jira-to-timesheet/issues) or submit a Pull Request.
