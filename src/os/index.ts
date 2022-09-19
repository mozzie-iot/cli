import * as ports from './ports';
import { OS_Port } from './ports/type';

export class OS_Handler {
  private handler: OS_Port | null = null;

  constructor(version: string) {
    // eslint-disable-next-line guard-for-in
    for (const port in ports) {
      const Os_port = (ports as any)[port];

      if (Os_port.version === version) {
        this.handler = new Os_port();
      }
    }
  }

  public get_available_wifi_interfaces(): Promise<string[]> {
    if (!this.handler) {
      throw new Error('OS version not supported');
    }

    return this.handler.get_available_wifi_interfaces();
  }
}
