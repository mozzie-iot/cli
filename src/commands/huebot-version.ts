import { Command } from '@oclif/core';
import { readFileSync } from 'node:fs';
import { Octokit } from 'octokit';

export default class HubVersion extends Command {
  static description = 'Huebot version'

  async run(): Promise<void> {
    const octokit = new Octokit();

    const github = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
      owner: 'huebot-iot',
      repo: 'huebot',
    });

    try {
      const dataRaw = readFileSync('/usr/local/bin/huebot/runner/lerna.json', { encoding: 'utf-8' });
      const data = JSON.parse(dataRaw);
      const context = data.version === github.data.tag_name ? 'latest version' : `update available: ${github.data.tag_name}`;

      this.log(`Running Huebot version: ${data.version} (${context})`);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        this.log('Huebot not installed. Run \'sudo huebot install\'.');
        return;
      }

      this.log('Unknown error occurred');
    }
  }
}
