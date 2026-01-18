import type { AxiosRequestConfig } from 'axios';
import type { SerializedCookie } from 'tough-cookie';

export const axiosConfig = (
  cookies: SerializedCookie[]
): AxiosRequestConfig => {
  const cookie: string = cookies.reduce(
    (previous, { key, value }) => `${previous} ${key}=${value};`,
    ''
  );

  return {
    baseURL: 'https://luby-timesheet.azurewebsites.net',
    headers: {
      accept: 'application/json, text/javascript, */*; q=0.01',
      'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'sec-gpc': '1',
      'x-requested-with': 'XMLHttpRequest',
      cookie,
      Referer: 'https://luby-timesheet.azurewebsites.net/Worksheet/Read',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  };
};
