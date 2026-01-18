import type {
  TimesheetCategory,
  TimesheetClient,
  TimesheetProject,
} from '@/send-to-timesheet/types';
import { eslintFixFiles } from '@/utils/eslint-fix-files';

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

type CategoriesObject = Record<
  `${TimesheetCategory['Name']} (ID: ${TimesheetCategory['Id']})`,
  TimesheetCategory
>;
type ProjectsObject = Record<
  `${TimesheetProject['Name']} (ID: ${TimesheetProject['Id']})`,
  TimesheetProject & { categories: CategoriesObject }
>;
type ClientsObject = Record<
  `${TimesheetClient['title']} (ID: ${TimesheetClient['id']})`,
  TimesheetClient & { projects: ProjectsObject }
>;

export const saveClients = async (
  clientsList: TimesheetClient[]
): Promise<void> => {
  const clientsObject = clientsList.reduce((clients, client) => {
    return Object.assign(clients, {
      [`${client.title} (ID: ${client.id})`]: Object.assign(client, {
        projects: client.projects.reduce((projects, project) => {
          return Object.assign(projects, {
            [`${project.Name} (ID: ${project.Id})`]: Object.assign(project, {
              categories: project.categories.reduce((categories, category) => {
                return Object.assign(categories, {
                  [`${category.Name} (ID: ${category.Id})`]: category,
                });
              }, {} as CategoriesObject),
            }),
          });
        }, {} as ProjectsObject),
      }),
    });
  }, {} as ClientsObject);

  const content = `
import type { AppointmentReference } from '@/send-to-timesheet/types';

export const clientsList = ${JSON.stringify(clientsList, null, 2)} as const;

export const clientsObject = ${JSON.stringify(clientsObject, null, 2)} as const;

type Clients = typeof clientsObject;

type GetCategories<
  ClientKey extends keyof Clients,
  ProjectKey extends keyof Clients[ClientKey]['projects'],
> = Clients[ClientKey]['projects'][ProjectKey] extends {
  categories: infer Categories;
}
  ? Categories
  : never;

type GenericObject = Record<
  string,
  {
    id: string;
    title: string;
    projects: Record<
      string,
      {
        Id: number;
        Name: string;
        StartDate: string;
        EndDate: string;
        IdCustomer: number;
        categories: Record<
          string,
          { Id: number; Name: string; IdProject: number }
        >;
      }
    >;
  }
>;

export const mountProject = <
  Client extends keyof Clients,
  Project extends keyof Clients[Client]['projects'],
  Category extends keyof GetCategories<Client, Project>,
>(
  client: Client,
  project: Project,
  category: Category
): AppointmentReference => {
  const clientData = (clientsObject as GenericObject)[client];
  const projectData = clientData.projects[project as string];
  const categoryData = projectData.categories[category as string];

  return {
    client: String(clientData.id),
    project: String(projectData.Id),
    category: String(categoryData.Id),
  };
};
    `;

  const outputDir = `src/generated`;

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const filename = join(outputDir, `clients.ts`);

  writeFileSync(filename, content, 'utf-8');

  await eslintFixFiles([filename]);
  await eslintFixFiles([filename]);
};
