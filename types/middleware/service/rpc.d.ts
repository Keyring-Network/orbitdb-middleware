import OrbitDB from "orbit-db";
export type RPCConfig = {
    api: {
        listen: Array<any>;
    };
};
export declare class RPC {
    config: RPCConfig;
    orbitdb: OrbitDB;
    constructor(config: RPCConfig, orbitdb: OrbitDB);
    start(): Promise<void>;
    stop(): Promise<void>;
}
