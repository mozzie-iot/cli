import { Command } from '@oclif/core';
import * as fs from 'node:fs';
import * as dotenv from 'dotenv';

export default class MqttCredentials extends Command {
  static install_path = '/usr/local/bin/huebot'
  static description = 'Show MQTT broker credentials'

  private async is_installed(): Promise<boolean> {
    if (!fs.existsSync(`${MqttCredentials.install_path}/.install`)) {
        return false;
    }

    const install_status = fs.readFileSync(`${MqttCredentials.install_path}/.install`, 'utf8');

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

    const env_file = fs.readFileSync(`${MqttCredentials.install_path}/.env`, 'utf8');

    if (!env_file) {
      console.error('Failed to find Huebot config file!');
      return;
    }

    dotenv.config({ path: `${MqttCredentials.install_path}/.env` });

    console.log('****************************************************************************');
    console.log('\n         BE CARFUL - SENSETIVE CREDENTIALS. CLEAR CONSOLE ASAP!         \n');
    console.log('****************************************************************************\n');

    console.log(`Username: ${process.env.MQTT_USERNAME}`);
    console.log(`Password: ${process.env.MQTT_PASSWORD}`);
  }
}
