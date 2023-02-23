import OrbitDB from "orbit-db";
import Store from "orbit-db-store";
import { Server } from "socket.io";
export type RPCConfig = {
    socketio: any;
};
export declare class RPC {
    config: RPCConfig;
    orbitdb: OrbitDB;
    manifest: OrbitDB.KeyValueStore;
    io: Server;
    constructor(config: RPCConfig, orbitdb: OrbitDB, manifest: OrbitDB.KeyValueStore);
    refresh(newAddrs: string[], removedAddrs: string[]): Promise<void>;
    stop(): Promise<unknown>;
    registerDatabase(address: string): void;
    connection(socket: any): void;
    op(store: Store, op: Function, op_params: any, callback: any): void;
    iterator(store: Store, op: Function, options: any, callback: any): void;
}
