import { axiosConfig as config } from '@/send-to-timesheet/axios-config';
import type {
  TimesheetCategory,
  TimesheetClient,
  TimesheetProject,
} from '@/send-to-timesheet/types';

import axios from 'axios';
import type { SerializedCookie } from 'tough-cookie';

const loadCategories = async (
  project: Pick<TimesheetProject, 'Id' | 'Name'>,
  cookies: SerializedCookie[]
): Promise<TimesheetCategory[]> => {
  try {
    const { data } = await axios.post<TimesheetCategory[]>(
      '/Worksheet/ReadCategory',
      `idproject=${project.Id}`,
      config(cookies)
    );

    return data;
  } catch (e) {
    console.error(`Error on get Categories from "${project.Name}" process!`, e);

    return [];
  }
};

const loadProjects = async (
  client: Pick<TimesheetClient, 'id' | 'title'>,
  cookies: SerializedCookie[]
): Promise<TimesheetProject[]> => {
  try {
    const { data } = await axios.post<Omit<TimesheetProject, 'categories'>[]>(
      '/Worksheet/ReadProject',
      `idcustomer=${client.id}`,
      config(cookies)
    );

    const projects = data.map(async (p) => ({
      ...p,
      categories: await loadCategories(p, cookies),
    }));

    return await Promise.all(projects);
  } catch (e) {
    console.error(`Error on get Projects from "${client.title}" process!`, e);

    return [];
  }
};

export const loadTimesheetClients = async (
  cookies: SerializedCookie[]
): Promise<TimesheetClient[]> => {
  try {
    const response = await axios.get('/Worksheet/Read', config(cookies));
    const html: string = response.data;

    const selectMatch = html.match(
      /<select[^>]*name="IdCustomer"[^>]*>([\s\S]+?)<\/select>/
    );

    if (!selectMatch) {
      console.error(
        html.includes('<div class="login-content">')
          ? 'Cookies inválidos ou sessão expirada.'
          : 'Bloco <select> não encontrado.'
      );

      return [];
    }

    const options = Array.from(
      selectMatch[1].matchAll(
        /<option[^>]*value="(.*?)"[^>]*>\s*([\s\S]*?\S)\s*<\/option>/g
      ),
      ([, id, title]) => ({ id, title })
    );

    if (options.length === 0) {
      console.error('Nenhuma opção encontrada no select.');

      return [];
    }

    console.log(`${options.length - 1} clientes carregados!`);
    console.log(`Carregando projetos e categorias...`);

    const clientsPromise: Promise<TimesheetClient>[] = options.reduce(
      (list, { id, title }) => {
        if (!id) return list;

        return list.concat(
          loadProjects({ id, title }, cookies).then((projects) => ({
            id,
            title,
            projects,
          }))
        );
      },
      [] as Promise<TimesheetClient>[]
    );

    const clients = await Promise.all(clientsPromise);

    if (clients.length <= 0)
      console.error('Os clientes não puderam ser carregados');

    return clients;
  } catch (e) {
    console.error('Error on “Get Clients” process!', e);

    return [];
  }
};
