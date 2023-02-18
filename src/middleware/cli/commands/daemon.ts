import os from 'os'
import fs from 'fs'

import {
    Daemon, DaemonConfig,
    RPC, RPCConfig
} from "../../service/index.js"

import OrbitDB from "orbit-db"

import Logger from 'logplease'
const logger = Logger.create('daemon')

const command = {
    command: 'daemon',
    describe: 'Start the long-running daemon process',
    
    builder(yargs) {
    
        return yargs
    },
    
    async handler({ ctx: { ipfs, config } }) {
    
        logger.info('Starting OrbitDB Middleware...')
        logger.info(`System version: ${os.arch()}/${os.platform()}`)
        logger.info(`Node.js version: ${process.versions.node}`)
        logger.info(`IPFS Peer ID: ${(await ipfs.id()).id}`)
        
        const orbitdb = await OrbitDB.createInstance(ipfs, config.orbitdb)
        const rpc = new RPC(
            config,
            orbitdb
        )
        
        const daemon = new Daemon(
            config,
            orbitdb,
            rpc
        )
        
        logger.info(`OrbitDB Identity: ${orbitdb.identity.id} (${orbitdb.identity.publicKey})`)
        
        await daemon.start()
        
        logger.info('OrbitDB Middleware daemon is ready')
        process.on('SIGUSR2', () => daemon.handleManifestReplication())
        
        const cleanup = async () => {
            logger.info('Received interrupt signal, shutting down...')
            await daemon.stop()
            process.exit(0)
        }

        // listen for graceful termination
        process.on('SIGTERM', cleanup)
        process.on('SIGINT', cleanup)
        process.on('SIGHUP', cleanup)
    }
}

export default command
