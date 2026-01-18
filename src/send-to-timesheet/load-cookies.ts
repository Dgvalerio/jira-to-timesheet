import { env } from '@/lib/@t3-oss/env';

import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import type { SerializedCookie } from 'tough-cookie';
import { CookieJar } from 'tough-cookie';

export const loadTimesheetCookies = async (): Promise<SerializedCookie[]> => {
  try {
    const response = await axios.get(
      'https://luby-timesheet.azurewebsites.net/Account/Login'
    );

    const regex = /value="([\S\s]+?)??" \/>/g;
    const regexResponse = regex.exec(response.data);

    if (!regexResponse) return [];

    const token = regexResponse[1];

    const setCookie = response.headers['set-cookie'];

    if (!setCookie) return [];

    const requestVerificationToken = setCookie.find((ck) =>
      ck.includes('__RequestVerificationToken')
    );

    if (!requestVerificationToken) return [];

    const verificationToken = requestVerificationToken
      .split(';')[0]
      .split('=')[1];

    const cookieJar = new CookieJar();

    wrapper(axios);

    await axios.post(
      'https://luby-timesheet.azurewebsites.net/Account/Login',
      `__RequestVerificationToken=${token}&Login=${env.TIMESHEET_LOGIN}&Password=${env.TIMESHEET_PASSWORD}`,
      {
        headers: { cookie: `__RequestVerificationToken=${verificationToken};` },
        jar: cookieJar,
        withCredentials: true,
      }
    );

    const json = cookieJar.toJSON();

    if (!json) return [];

    return json.cookies;
  } catch (e) {
    console.error('Error on "loadCookies":', e);

    return [];
  }
};
