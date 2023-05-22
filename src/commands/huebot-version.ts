import { Command } from '@oclif/core';
import { readFileSync } from 'node:fs';
import { Octokit } from 'octokit';
import * as fs from 'node:fs';

export default class HubVersion extends Command {
  static description = 'Huebot version'

  private async is_installed(): Promise<boolean> {
    const install_path = '/usr/local/bin/huebot';
    if (!fs.existsSync(`${install_path}/.install`)) {
        return false;
    }

    const install_status = fs.readFileSync(`${install_path}/.install`, 'utf8');

    if (Number.parseInt(install_status, 10) !== 0) {
        return false;
    }

    return true;
  }

  async run(): Promise<void> {
    const is_installed = await this.is_installed();

    if (!is_installed) {
        console.error('Huebot must be installed before using this command!');
        return;
    }

    const octokit = new Octokit();

    const github = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
      owner: 'huebot-iot',
      repo: 'huebot',
    });

      const dataRaw = readFileSync('/usr/local/bin/huebot/runner/lerna.json', { encoding: 'utf-8' });
      const data = JSON.parse(dataRaw);
      const context = data.version === github.data.tag_name ? 'latest version' : `update available: ${github.data.tag_name}`;

      this.log(`Running Huebot version: ${data.version} (${context})`);
  }
}
