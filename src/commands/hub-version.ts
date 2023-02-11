import { Command } from '@oclif/core';
import { readFileSync } from 'node:fs';
import { Octokit } from 'octokit';

export default class HubVersion extends Command {
  static description = 'Huebot hub version'

  async run(): Promise<void> {
    const octokit = new Octokit();

    const github = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
      owner: 'huebot-iot',
      repo: 'hub-runner',
    });

    const dataRaw = readFileSync('/usr/local/bin/huebot/runner/package.json', { encoding: 'utf-8' });

    const data = JSON.parse(dataRaw);

    const context = data.version === github.data.tag_name ? 'latest version' : `update available: ${github.data.tag_name}`;

    this.log(`Huebot Hub version: ${data.version} (${context})`);
  }
}
