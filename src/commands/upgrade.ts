import { Command, Flags, ux } from '@oclif/core';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { Octokit } from 'octokit';

export default class Update extends Command {
  static description = 'Update Huebot to latest version'

  static flags = {
    force: Flags.boolean({ char: 'f' }),
  }

  async run(): Promise<void> {
    const octokit = new Octokit();

    const github = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
      owner: 'huebot-iot',
      repo: 'hub-runner',
    });

    const dataRaw = readFileSync('/usr/local/bin/huebot/runner/package.json', { encoding: 'utf-8' });

    const data = JSON.parse(dataRaw);

    if (data.version === github.data.tag_name) {
      this.log(`Running latest version (${github.data.tag_name})`);
      return;
    }

    const { flags } = await this.parse(Update);

    if (!flags.force) {
      const confirm = await ux.confirm(`Update hub to latest version (${github.data.tag_name})? [y/n]`);
      if (!confirm) {
        this.log('Update exited');
      }
    }

    const child = spawn(
      `${__dirname}/../../scripts/upgrade.sh`,
      [github.data.tag_name],
      { detached: true, shell: true },
    );

    child.stdout.on('data', (data) => process.stdout.write(data));
    child.stderr.on('data', (data) => process.stderr.write(data));
  }
}
