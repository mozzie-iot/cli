export abstract class OS_Port {
  abstract get_available_wifi_interfaces(): Promise<string[]>;
}
