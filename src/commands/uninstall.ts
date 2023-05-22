import { Command } from '@oclif/core';
import * as inquirer from 'inquirer';
import { spawn } from 'node:child_process';

export default class Uninstall extends Command {
  static description = 'Uninstall Huebot environment'

  async run(): Promise<void> {
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
    this.log('\nUninstalling Huebot system environment!\n');

    // eslint-disable-next-line unicorn/prefer-module
    const cli_scripts_path = `${__dirname}/../../scripts`;

    spawn(
      `${cli_scripts_path}/uninstall-root.sh`,
      [cli_scripts_path],
      { stdio: [process.stdin, process.stdout, process.stderr], shell: true },
    );
  }
}
