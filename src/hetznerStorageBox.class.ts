import { ReadStream } from 'node:fs';
import { Client } from 'ssh2';

export interface HetznerStorageBoxConfig {
    host: string;
    port: number;
    username: string;
    password: string;
}

export class HetznerStorageBox {
  private client: Client;

  constructor(private config: HetznerStorageBoxConfig) {
    this.client = new Client();
  }

  public async uploadFile(fileStream: ReadStream, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
        this.client
            .on('ready', () => {
            this.client.sftp((err, sftp) => {
                if (err) {
                reject(err);
                }

                const writeStream = sftp.createWriteStream(path);
                writeStream.on('close', () => {
                    this.client.end();
                    resolve();
                });

                fileStream.pipe(writeStream);
            });
            })
            .connect(this.config);

        this.client.on('error', (err) => {
            reject(err);
        });
    });
  }
}