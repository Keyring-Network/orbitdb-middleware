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
    manifest: OrbitDB.KeyValueStore;
    rpc: RPC;
    constructor(config: DaemonConfig, orbitdb: OrbitDB, manifest: OrbitDB.KeyValueStore, rpc: RPC);
    start(): Promise<[any]>;
    stop(): Promise<[any, unknown]>;
    handleManifestReplication(): Promise<void>;
}
