import Logger from "logplease";
const logger = Logger.create("api-service");

import OrbitDB from "orbit-db"

export type RPCConfig = {
  api: {
    listen: Array<any>; // Arguments to Express.listen
  };
};

export class RPC {
  constructor(
    public config: RPCConfig,
    public orbitdb: OrbitDB
  ) { }
  
  async start() {
    
  }
  
  async stop() {
  
  }
}
