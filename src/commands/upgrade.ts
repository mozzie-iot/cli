import { Command, Flags } from '@oclif/core';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { Octokit } from 'octokit';
import * as inquirer from 'inquirer';
import * as path from 'node:path';
import * as url from 'node:url';

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

    const cli_scripts_path = `${path.dirname(url.fileURLToPath(import.meta.url))}/../../scripts`;

    const child = spawn(
      `${cli_scripts_path}/upgrade.sh`,
      [github.data.tag_name, cli_scripts_path],
      { detached: true, shell: true },
    );

    child.stdout.on('data', (data) => process.stdout.write(data));
    child.stderr.on('data', (data) => process.stderr.write(data));
  }
}
