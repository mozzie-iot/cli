import { Command,  ux } from '@oclif/core';
import { spawn } from 'node:child_process';
import { Octokit } from 'octokit';
import * as fs from 'node:fs';
import * as gp from 'generate-password';

interface SetupArgs {
  redis_password: string;
  session_secret: string;
  mqtt_username: string;
  mqtt_password: string
}

export default class Install extends Command {
  static description = 'Install and run Huebot environment'

  async run(): Promise<void> {
    const install_path = '/usr/local/bin/huebot';

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

    const setupArgs: SetupArgs = {
      redis_password: gp.generate({
        length: 30,
        numbers: true,
      }),
      session_secret: gp.generate({
        length: 30,
        numbers: true,
      }),
      mqtt_username: '',
      mqtt_password: '',
    };

    if (!setupArgs.mqtt_username) {
      let mqtt_username = await ux.prompt('Enter MQTT broker username (leave blank to auto-generate)', { required: false });

      if (!mqtt_username) {
        mqtt_username = gp.generate({
          length: 20,
          numbers: true,
        });
      }

      setupArgs.mqtt_username = mqtt_username;
    }

    if (!setupArgs.mqtt_password) {
      let mqtt_password = await ux.prompt('Enter MQTT broker password (leave blank to auto-generate)', { required: false });

      if (!mqtt_password) {
        mqtt_password = gp.generate({
          length: 20,
          numbers: true,
        });
      }

      setupArgs.mqtt_password = mqtt_password;
    }

    const child = spawn(
      // eslint-disable-next-line unicorn/prefer-module
      `${__dirname}/../../scripts/install.sh`,
      [github.data.tag_name, setupArgs.redis_password, setupArgs.session_secret, setupArgs.mqtt_username, setupArgs.mqtt_password],
      { detached: true, shell: true },
    );

    child.stdout.on('data', (data) => process.stdout.write(data));
    child.stderr.on('data', (data) => process.stderr.write(data));
  }
}
