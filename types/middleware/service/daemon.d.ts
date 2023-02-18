import { RPC } from "./rpc.js";
import OrbitDB from "orbit-db";
import { Options as IPFSOptions } from "ipfs-core";
export type DaemonConfig = {
    ipfs: IPFSOptions & {
        peers: string[];
    };
    manifest: {
        address: string;
        options: {};
    };
    store: {
        options: {
            timeout: number;
        };
    };
};
export declare class Daemon {
    config: DaemonConfig;
    orbitdb: OrbitDB;
    rpc: RPC;
    manifest: OrbitDB.KeyValueStore;
    constructor(config: DaemonConfig, orbitdb: OrbitDB, rpc: RPC);
    start(): Promise<[any, void]>;
    stop(): Promise<[any, void]>;
    handleManifestReplication(): Promise<any[]>;
}
