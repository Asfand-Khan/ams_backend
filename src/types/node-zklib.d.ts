declare module "node-zklib" {
  export class ZKLib {
    constructor(ip: string, port?: number, timeout?: number);
    createSocket(): Promise<void>;
    getTime(): Promise<Date>;
    getAttendance(): Promise<{ enrollNumber: string; date: string }[]>;
    disconnect(): void;
  }
}
