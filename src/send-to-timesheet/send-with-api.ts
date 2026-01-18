import { categoryMap, clientMap, projectMap } from '@/generated/clients';
import { appointments as allAppointments } from '@/send-to-timesheet/appointments';
import { axiosConfig } from '@/send-to-timesheet/axios-config';
import { loadTimesheetCookies } from '@/send-to-timesheet/load-cookies';
import type { Appointment } from '@/send-to-timesheet/types';

import axios from 'axios';
import type { SerializedCookie } from 'tough-cookie';

const getRequestVerificationToken = async (
  cookies: SerializedCookie[]
): Promise<string> => {
  const response = await axios.get('/Worksheet/Read', axiosConfig(cookies));

  const regex =
    /name="__RequestVerificationToken" type="hidden" value="([\S\s]+?)??" \/>/g;
  const regexResponse = regex.exec(response.data);

  if (!regexResponse) return '';

  return regexResponse[1];
};

export const sendAppointments = async (
  cookies: SerializedCookie[],
  verificationToken: string,
  appointments: Appointment[]
): Promise<
  | { success: false; error: any }
  | { success: true; data: any }
  | { success: false; errors: any }
> => {
  // 1. Converter SerializedCookie[] para string de cabeçalho 'Cookie'
  const cookieHeader = cookies.map((c) => `${c.key}=${c.value}`).join('; ');

  // 2. Transformar seu Appointment[] no formato WorksheetMultiple do backend
  const payload = {
    WorksheetMultiple: appointments.map((appointment) => ({
      IdCustomer: appointment.client,
      CustomerName: clientMap[appointment.client as keyof typeof clientMap],
      IdProject: appointment.project,
      ProjectName: projectMap[appointment.project as keyof typeof projectMap],
      IdCategory: appointment.category,
      CategoryName:
        categoryMap[appointment.category as keyof typeof categoryMap],
      InformedDate: appointment.date,
      StartTime: appointment.initialTime,
      EndTime: appointment.finalTime,
      // Envolvemos em <p> para simular o Summernote e evitar problemas de formatação
      Description: `<p>${appointment.description}</p>`,
      NotMonetize: false,
    })),
  };

  try {
    const response = await axios.post(
      'https://luby-timesheet.azurewebsites.net/Worksheet/UpdateMultiple',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
          // MVC geralmente espera o token neste header para chamadas AJAX
          RequestVerificationToken: verificationToken,
        },
      }
    );

    // O backend retorna 200 mesmo com erro de negócio (ex: validação)
    // Precisamos checar a flag .success
    if (response.data?.success) {
      console.log('✅ Sucesso! Apontamentos criados.');

      return { success: true, data: response.data };
    } else {
      console.warn(
        '⚠️ Request aceito, mas backend recusou:',
        response.data?.message
      );
      if (response.data?.messageFailed) {
        console.table(response.data.messageFailed);
      }

      return { success: false, errors: response.data };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Erro HTTP: ${error.response?.status}`);
    } else {
      console.error('❌ Erro desconhecido:', error);
    }

    return { success: false, error };
  }
};

export const sendWithAPI = async (): Promise<void> => {
  console.log('1. Autenticando...');

  const cookies = await loadTimesheetCookies();

  if (cookies.length === 0) {
    console.error('Falha no login.');

    return;
  }

  console.log('2. Obtendo Token Anti-Forgery...');

  const token = await getRequestVerificationToken(cookies);

  if (!token) {
    console.error('Falha ao obter token.');

    return;
  }

  console.log(`3. Enviando ${allAppointments.length} apontamentos...`);
  await sendAppointments(cookies, token, allAppointments);
};
