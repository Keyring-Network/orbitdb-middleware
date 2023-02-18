import os from 'os'
import fs from 'fs'

import OrbitDB from "orbit-db"

import Logger from 'logplease'
const logger = Logger.create('daemon')

const command = {
    command: 'init',
    describe: 'Initialize the replication process',
    
    builder(yargs) {
        yargs.option('overwrite', {
            description: 'Overwrite existing OrbitDB manifest database',
            type: 'boolean',
            default: false
        })
        
        yargs.option('add', {
            description: 'Add a new database to the manifest',
            type: 'array',
            nargs: 1,
        })
    
        return yargs
    },
    
    async handler({ ctx: { ipfs, config }, overwrite, add }) {
    
        logger.info('Initializing OrbitDB Middleware...')
        logger.info(`System version: ${os.arch()}/${os.platform()}`)
        logger.info(`Node.js version: ${process.versions.node}`)
        logger.info(`IPFS Peer ID: ${(await ipfs.id()).id}`)
        
        const orbitdb = await OrbitDB.createInstance(ipfs, config.orbitdb)
        
        logger.info(`OrbitDB Identity: ${orbitdb.identity.id} (${orbitdb.identity.publicKey})`)
        
        const manifest = await orbitdb.open("middleware", {
            ...config.manifest.options,
            type: "keyvalue",
            overwrite: overwrite,
            create: true,
            replicate: false,
        })
        
        logger.info('Manifest database opened', manifest.address.toString())
        
        if(add.length > 0) {
            await Promise.all(add.map((address) => manifest.set(address, [])))
        }
    }
}

export default command
