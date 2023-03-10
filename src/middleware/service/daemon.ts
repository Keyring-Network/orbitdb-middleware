import { RPC }  from "./rpc.js"

import OrbitDB from "orbit-db"
import { IPFS, Options as IPFSOptions } from "ipfs-core"

import type { Multiaddr } from '@multiformats/multiaddr'

import Logger from 'logplease'
const logger = Logger.create('daemon-service')

export type DaemonConfig = {
    ipfs: IPFSOptions & {
        peers: string[] // Multiaddr[]
    },
    manifest: {
        address: string,
        options: {}
    },
    store: {
        options: {
            timeout: number
        }
    }
}

export class Daemon {
    constructor(
        public config: DaemonConfig,
        public orbitdb: OrbitDB,
        public manifest: OrbitDB.KeyValueStore,
        public rpc: RPC,
    ) { }
    
    async start() {
        this.manifest.events.on('replicated', () => this.handleManifestReplication())
        this.manifest.events.on('write', () => this.handleManifestReplication())
        this.manifest.events.on('ready', () => this.handleManifestReplication())
    
        return Promise.all([
            this.manifest.load(),
        ])
    }
    
    async stop() {
        return Promise.all([
            this.orbitdb.stop(),
            this.rpc.stop()
        ])
    }
    
    async handleManifestReplication() {
        const storeAddrs = Object.keys(this.manifest.all)
        
        const existingStoreAddrs = Object.keys(this.orbitdb.stores)
        
        const removedStoreAddrs = existingStoreAddrs.filter(address => address !== this.config.manifest.address && !storeAddrs.includes(address))
        const removedStoreClose = Promise.all(removedStoreAddrs.map(address => this.orbitdb.stores[address].close()))
        
        const newStoreAddrs = storeAddrs.filter(address => !existingStoreAddrs.includes(address))
        const newStores = Promise.all(newStoreAddrs.map(address => this.orbitdb.open(address, this.config.store.options).catch((e: Error) => {
            logger.error(e.toString())
        })))
        
        logger.info(`Unfollowing ${removedStoreAddrs.length} stores`)
        logger.info(`Following ${newStoreAddrs.length} new stores`)
        
        return Promise.all([
            removedStoreClose,
            newStores,
        ]).then(() => Promise.all(Object.entries(this.manifest.all)
            .map((address, heads) => this.orbitdb.stores[address]?._replicator._addToQueue(heads))
        )).then(() => this.rpc.refresh(newStoreAddrs, removedStoreAddrs))
    }
}
