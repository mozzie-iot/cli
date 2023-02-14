import { Command, Flags, ux } from '@oclif/core';
import { exec, spawn } from 'node:child_process';
import { prompt } from 'inquirer';
import { existsSync } from 'node:fs';
import { Octokit } from 'octokit';

interface Results {
  api_key: string;
  secret_key: string;
  type: string;
  ap_interface: string;
}

export default class Install extends Command {
  static description = 'Configure the OS environment to work with Huebot'

  static flags = {
    type: Flags.string({ options: ['production', 'development'] }),
  };

  private async available_wifi_interfaces(): Promise<string[]> {
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

  async run(): Promise<void> {
    const is_installed = existsSync('/usr/local/bin/huebot/runner/package.json')
    if (is_installed) {
      this.log('Install failed. Huebot already installed.');
      return;
    }

    const available_interfaces = await this.available_wifi_interfaces();

    if (available_interfaces.length === 0) {
      this.log('Install failed. At least one wifi interface required.');
      return;
    }

    const octokit = new Octokit();

    const github = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
      owner: 'huebot-iot',
      repo: 'hub-runner',
    });


    this.log(`Installing version: ${github.data.tag_name}`);

    const { flags } = await this.parse(Install);

    const results: Results = {
      api_key: '',
      secret_key: '',
      type: flags.type || '',
      ap_interface: '',
    };

    if (!results.api_key) {
      const api_key = await ux.prompt('Enter API key?');
      results.api_key = api_key;
    }

    if (!results.secret_key) {
      const secret_key = await ux.prompt('Enter secret key?', {
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

    const child = spawn(
      "scripts/install.sh",
      [github.data.tag_name, results.api_key, results.secret_key, results.type, results.ap_interface],
      { detached: true, shell: true }
    );

    child.stdout.on('data', (data) => process.stdout.write(data));
    child.stderr.on('data', (data) => process.stderr.write(data));

  }
}
