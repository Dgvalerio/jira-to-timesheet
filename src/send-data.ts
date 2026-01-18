import { sendWithAPI } from '@/send-to-timesheet/send-with-api';

const sendData = async (): Promise<void> => {
  try {
    await sendWithAPI();
  } catch (error: any) {
    console.error('\nErro:', error.message);
    process.exit(1);
  }
};

void sendData();
