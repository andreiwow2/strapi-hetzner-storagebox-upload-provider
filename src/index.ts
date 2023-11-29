import type { ReadStream } from 'node:fs';
import { Readable } from 'stream';
import { HetznerStorageBox, HetznerStorageBoxConfig } from './hetznerStorageBoxClass';

interface File {
    name: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
    formats?: Record<string, unknown>;
    hash: string;
    ext?: string;
    mime: string;
    size: number;
    url: string;
    previewUrl?: string;
    path?: string;
    provider?: string;
    provider_metadata?: Record<string, unknown>;
    stream?: ReadStream;
    buffer?: Buffer;
}

interface ProviderOptions {
    boxUrl: string;
    destinationPath: string;
    /**
     * Defaults to 23
     */
    sshPort?: number;
    auth: {
        user: string;
        password: string;
    }
}

const int = ({ destinationPath, boxUrl, auth, sshPort = 23 }: ProviderOptions) => {
    const sshConfig: HetznerStorageBoxConfig = {
        host: boxUrl,
        port: sshPort,
        username: auth.user,
        password: auth.password,
    }

    const uploadToHetznerBox = async (file: File, fileStream: ReadStream) => {
        const filePath = `${destinationPath}/${file.name}`;
        await new HetznerStorageBox(sshConfig).uploadFile(fileStream, filePath);
    }

    return {
        upload(file: File) {
            if (!file.buffer) throw new Error('No buffer found');
            return uploadToHetznerBox(file, Readable.from(file.buffer) as ReadStream);
        },
        uploadStream(file: File) {
            if (!file.stream) throw new Error('No stream found');
            return uploadToHetznerBox(file, file.stream);
        },
        delete(file: File) {},
        getSignedUrl(file: File) {},
    }
}

module.exports = {
    int
}