import Logger from "logplease";
const logger = Logger.create("api-service");
export class RPC {
    config;
    orbitdb;
    constructor(config, orbitdb) {
        this.config = config;
        this.orbitdb = orbitdb;
    }
    async start() {
    }
    async stop() {
    }
}
