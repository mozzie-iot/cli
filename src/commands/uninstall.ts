import { Command } from '@oclif/core';
import * as inquirer from 'inquirer';
import * as os from 'node:os';
import { spawn } from 'node:child_process';
import * as fs from 'node:fs';

export default class Uninstall extends Command {
  static description = 'Uninstall Huebot environment'

  async run(): Promise<void> {
    const user = os.userInfo();

    if (user.uid !== 0) {
      console.error("This command must be run as root ('sudo huebot uninstall')!");
      return;
    }

    const { confirm } = await inquirer.prompt({
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure? This action cannot be undone!',
      default: true,
    });

    if (!confirm) {
      return;
    }

    // Line break
    console.log('\nUninstalling Huebot system environment!\n');

    const child = spawn(
      '/home/tyler/hub-runner/scripts/uninstall.sh',
      { detached: true, shell: true },
    );

    child.stdout.on('data', (data) => process.stdout.write(data));
    child.stderr.on('data', (data) => process.stderr.write(data));

    child.on('close', (code) => {
      if (code === 0) {
        process.stdout.write('Removing directories...');
        fs.rmSync('/usr/local/bin/huebot', { recursive: true, force: true });
        fs.rmSync('/usr/local/bin/mosquitto', { recursive: true, force: true });
        process.stdout.write('Done.\n');

        process.stdout.write('\n\n\n************************ UNINSTALL COMPLETE ************************\n\n\n');
        process.stdout.write('Huebot system environment successfully uninstalled!\n');
        process.stdout.write('Note: APT packages installed with Huebot have not been uninstalled \n');
        process.stdout.write('and port configuration changes have not been reverted!\n');
        process.stdout.write('\n\n******************************************************************\n\n\n');
      }
    });
  }
}
