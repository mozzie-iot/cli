import { Command } from '@oclif/core';
import * as inquirer from 'inquirer';
import * as fs from 'node:fs';

export default class CreateAdmin extends Command {
  static description = 'Create admin user'

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
        console.error('Huebot must be installed before creating admin user!');
        return;
    }

    const prompt = await inquirer.prompt([
    {
        type: 'input',
        name: 'username',
        message: 'Enter username',
      },
    {
      type: 'password',
      message: 'Enter password',
      name: 'password',
      mask: '*',
    },
    {
      type: 'password',
      message: 'Confirm password',
      name: 'confirm_password',
      mask: '*',
      validate: (value, answers) => {
        if (value !== answers.password) {
          return "Passwords don't match";
        }

        return true;
      },
    },
  ]);

  const response = await fetch('http://localhost:3000/admin/user/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: prompt.username, password: prompt.password }),
  });

  const body = await response.text();

  if (!body) {
    console.log('\n\nAdmin account successfully created!\n');
    return;
  }

  console.log('\n\nFailed to create admin account:\n');
  const error = JSON.parse(body);

  if (error.statusCode === 400) {
    console.log(`- ${error.message}\n`);
    return;
  }

  if (error.error === 'Validation') {
    for (let i = 0; i < error.message.length; i++) {
      const constraints = Object.values(error.message[i].constraints);
      console.log(`- ${error.message[i].property} ${constraints[0]}`);
    }

    console.log('');
    return;
  }

  console.log('- Unexpected error occurred');
  }
}
