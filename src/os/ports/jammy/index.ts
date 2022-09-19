import { exec } from 'node:child_process';
import { OS_Port } from '../type';

export class OS_Jammy extends OS_Port {
  public static version = 'jammy';

  public async get_available_wifi_interfaces(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      exec('nmcli -t -f TYPE,DEVICE device', (error, stdout, stderr) => {
        if (error || stderr) {
          return reject(error || stderr);
        }

        // Filter out only wifi interfaces
        const interfaces = stdout
          .split('\n')
          .filter((int) => int.includes('wifi:'))
          .map((int) => int.split(':')[1]);

        if (interfaces.length === 0) {
          return resolve([]);
        }

        resolve(interfaces);
      });
    });
  }
}
