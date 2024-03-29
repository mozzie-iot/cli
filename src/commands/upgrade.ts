import { Command, Flags } from '@oclif/core';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { Octokit } from 'octokit';
import * as inquirer from 'inquirer';

export default class Update extends Command {
  static description = 'Update Huebot to latest version'

  static flags = {
    force: Flags.boolean({ char: 'f' }),
  }

  async run(): Promise<void> {
    const octokit = new Octokit();

    const github = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
      owner: 'huebot-iot',
      repo: 'huebot',
    });

    const dataRaw = readFileSync('/usr/local/bin/huebot/runner/lerna.json', { encoding: 'utf-8' });

    const data = JSON.parse(dataRaw);

    if (data.version === github.data.tag_name) {
      this.log(`Running latest version (${github.data.tag_name})`);
      return;
    }

    const { flags } = await this.parse(Update);

    if (!flags.force) {
      const { confirm } = await inquirer.prompt({
        type: 'confirm',
        name: 'confirm',
        message: `Update hub to latest version (${github.data.tag_name})?`,
        default: true,
      });

      if (!confirm) {
        this.log('Update exited');
        return;
      }
    }

    // eslint-disable-next-line unicorn/prefer-module
    const cli_scripts_path = `${__dirname}/../../scripts`;

    spawn(
      `${cli_scripts_path}/upgrade-root.sh`,
      [github.data.tag_name, cli_scripts_path],
      { stdio: [process.stdin, process.stdout, process.stderr], shell: true },
    );
  }
}
