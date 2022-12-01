import { Command, Flags, CliUx } from '@oclif/core';
import { exec, spawn } from 'node:child_process';
import { access } from 'node:fs';
import { prompt } from 'inquirer';
import * as WGET from 'wget-improved';
import * as path from 'node:path'

import { OS_Handler } from '../os';


const INSTALL_FILE_PATH = '/tmp/install.sh';

interface Results {
  api_key: string;
  secret_key: string;
  type: string;
  ap_interface: string;
}

// const uuidValidator = (uuid: string): boolean => {
//   const regexExp = /^[\da-f]{8}(?:\b-[\da-f]{4}){3}\b-[\da-f]{12}$/gi;
//   return regexExp.test(uuid);
// };

export default class Install extends Command {
  static flags = {
    type: Flags.string({ options: ['production', 'development'] }),
  };

  private async get_os_version(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      exec('cat /etc/os-release', (error, stdout, stderr) => {
        if (error || stderr) {
          return reject(error || stderr);
        }

        const version = stdout.match(/VERSION_CODENAME=(.*)/);

        if (!version) {
          return resolve(null);
        }

        return resolve(version[1]);
      });
    });
  }

  private async version_support(version: string): Promise<boolean> {
    return new Promise((resolve, _reject) => {
      access(
        `${path.dirname(__filename)}/../os/ports/${version}`,
        function (error) {
          if (error) {
            return resolve(false);
          }

          return resolve(true);
        },
      );
    });
  }

  private async make_executable(): Promise<any> {
    return new Promise((resolve, reject) => {
      exec(`chmod +x ${INSTALL_FILE_PATH}`, (error, stdout, stderr) => {
        if (error || stderr) {
          return reject(error || stderr);
        }

        return resolve(stdout);
      });
    });
  }

  private run_install(results: Results): void {
    const install = spawn(
      INSTALL_FILE_PATH,
      [results.api_key, results.secret_key, results.type, results.ap_interface],
      { stdio: 'inherit' },
    );

    if (!install.stdout || !install.stderr) {
      return;
    }

    install.stdout.setEncoding('utf8');

    install.stdout.on('data', (data) => {
      this.log(data);
    });

    install.stderr.on('data', function (data) {
      console.log('Something went wrong:', data.toString());
    });

    install.on('exit', function (code) {
      if (code) {
        console.log('code ' + code.toString());
      }
    });
  }

  async run(): Promise<void> {
    const version = await this.get_os_version();

    if (!version) {
      this.log('Install failed. Unable to determine OS version.');
      return;
    }

    const is_version_supported = await this.version_support(version);

    if (!is_version_supported) {
      this.log(`Version (${version}) not supported.`);
      return
    }

    const os_handler = new OS_Handler(version);

    const available_interfaces =
      await os_handler.get_available_wifi_interfaces();

    if (available_interfaces.length === 0) {
      this.log('Install failed. At least one wifi interface required.');
      return;
    }

    const { flags } = await this.parse(Install);

    const results: Partial<Results> = {
      api_key: undefined,
      secret_key: undefined,
      type: flags.type,
      ap_interface: undefined,
    };

    if (!results.api_key) {
      const api_key = await CliUx.ux.prompt('Enter API key?');
      results.api_key = api_key;
    }

    if (!results.secret_key) {
      const secret_key = await CliUx.ux.prompt('Enter secret key?', {
        type: 'mask',
      });
      results.secret_key = secret_key;
    }

    if (!results.type) {
      const responses: any = await prompt([
        {
          name: 'type',
          message: 'Select type of install',
          type: 'list',
          default: 'production',
          choices: [{ name: 'production' }, { name: 'development' }],
        },
      ]);
      results.type = responses.type;
    }

    if (!results.ap_interface) {
      const choices = available_interfaces.map((int) => ({
        name: int,
      }));

      if (choices.length === 1) {
        const responses: any = await prompt([
          {
            name: 'ap_interface_confirm',
            message: `Only 1 wifi interface (${choices[0].name}) detected which will be used for MQTT communication (network connection via ethernet will be required). Continue?`,
            type: 'list',
            default: 'yes',
            choices: ['yes', 'no'],
          },
        ]);

        if (responses.ap_interface_confirm === 'no') {
          this.log('Install canceled');
          return;
        }

        results.ap_interface = choices[0].name;
      } else {
        const responses: any = await prompt([
          {
            name: 'ap_interface',
            message:
              'Multiple wifi interfaces detected - select which to use for MQTT communication',
            type: 'list',
            default: choices[0].name,
            choices,
          },
        ]);
        results.ap_interface = responses.ap_interface;
      }
    }

    this.log('Install instructions: ');
    console.log(results);

    const download = WGET.download(
      'https://raw.githubusercontent.com/huebot-iot/utilities/main/install.sh',
      INSTALL_FILE_PATH,
    );

    download.on('start', () => {
      this.log('Downloading install script');
    });

    download.on('error', (err: any) => {
      console.log(err);
      this.log('Download install script failed');
    });

    download.on('end', async () => {
      await this.make_executable();
      this.log('Running install. This will take a few minutes...');
      this.run_install(results as Results);
    });
  }
}
