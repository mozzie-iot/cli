import { Command } from '@oclif/core';
import { spawn } from 'node:child_process';
import { Octokit } from 'octokit';
import * as fs from 'node:fs';
import * as os from 'node:os';

export default class Install extends Command {
  static description = 'Install and run Huebot environment'

  async run(): Promise<void> {
    const install_path = '/usr/local/bin/huebot';

    const user = os.userInfo();

    if (user.uid !== 0) {
      console.error("This command must be run as root ('sudo huebot install')!");
      return;
    }

    const octokit = new Octokit();

    const github = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
      owner: 'huebot-iot',
      repo: 'hub-runner',
    });

    // Check if Huebot CLI is already installed
    if (fs.existsSync(`${install_path}/.install`)) {
      const install_status = fs.readFileSync(`${install_path}/.install`, 'utf8');

      // Already installed successfully - let's check version for suggested next steps
      if (Number.parseInt(install_status, 10) === 0) {
        const runner_file = fs.readFileSync(`${install_path}/runner/package.json`, 'utf8');

        if (!runner_file) {
          throw new Error('Already installed but cannot find runner package.json!');
        }

        const runner_file_json = JSON.parse(runner_file);

        // Latest version already installed - nothing to do
        if (runner_file_json.version === github.data.tag_name) {
          console.log('Huebot already installed successfully!');
          return;
        }

        // Suggest upgrading to latest version
        console.log(`Huebot already installed (upgrade to version ${github.data.tag_name} using 'huebot upgrade' command)!`);
        return;
      }
    }

    this.log(`Installing version: ${github.data.tag_name}`);

    const child = spawn(
      // eslint-disable-next-line unicorn/prefer-module
      `${__dirname}/../../scripts/install.sh`,
      [github.data.tag_name],
      { detached: true, shell: true },
    );

    child.stdout.on('data', (data) => process.stdout.write(data));
    child.stderr.on('data', (data) => process.stderr.write(data));
  }
}
