import Logger from "logplease";
const logger = Logger.create("api-service");

import OrbitDB from "orbit-db"
import Store from "orbit-db-store"
import { Server } from "socket.io"

export type RPCConfig = {
    socketio: any
}

export class RPC {
    public io: Server

    constructor(
        public config: RPCConfig,
        public orbitdb: OrbitDB,
        public manifest: OrbitDB.KeyValueStore
    ) {
        this.io = new Server(config.socketio)
        
        this.io.on("connection", (socket) => this.connection(socket))
        Object.keys(this.manifest.all).map((address) => this.registerDatabase(address))
    }
    
    async refresh(newAddrs: string[], removedAddrs: string[]) {
        for(const address of removedAddrs) {
            this.io.emit("database:remove", address)
            this.io.socketsLeave(address)
        }
        
        for(const address of newAddrs) {
            this.io.emit("database:new", address)
            
            this.registerDatabase(address)
        }
    }
    
    async stop() {
        return new Promise((resolve) => this.io.close(resolve))
    }
    
    registerDatabase(address: string) {
        const store = this.orbitdb.stores[address]
        if(!store) {
            return
        }
        
        store.events.on("replicate", (address, entry) => this.io.of(address).emit("replicate", address, entry.hash))
        store.events.on("replicated", (address, entries) => this.io.of(address).emit("replicated", address, entries))
        store.events.on("log.op", (op, address, hash) => this.io.of(address).emit("log.op", address, op, hash))
        
        this.io.on("connection", (socket) => {
            const store = this.orbitdb.stores[address]
            
            socket.on(`${address}:put`, (key, value, callback) => this.op(store, store.put, [key, value], callback))
            socket.on(`${address}:add`, (data, callback) => this.op(store, store.add, [data], callback))
            socket.on(`${address}:get`, (key, callback) => this.op(store, store.get, [key], callback))
            socket.on(`${address}:del`, (key, callback) => this.op(store, store.del, [key], callback))
            socket.on(`${address}:remove`, (key, callback) => this.op(store, store.remove, [key], callback))
            socket.on(`${address}:inc`, (value, callback) => this.op(store, store.inc, [value], callback))
            socket.on(`${address}:all`, (callback) => this.op(store, store.all, [], callback))
            socket.on(`${address}:value`, (callback) => this.op(store, store.value, [], callback))
            socket.on(`${address}:iterator`, (options, callback) => this.iterator(store, store.iterator, options, callback))
        })
    }
    
    connection(socket) {
        socket.on("database", (address, callback) => {
            if(this.orbitdb.stores[address]) {
                socket.join(address)
                callback(true)
            } else {
                callback(false)
            }
        })
        
        socket.on("manifest:add", (address, heads, callback) => {
            this.manifest.put(address, heads || [])
        })
        
        socket.on("manifest:remove", (address, callback) => {
            this.manifest.del(address).then(() => {
                callback(true)
            }).catch(() => {
                callback(false)
            })
        })
        
        socket.on("database:create", (name, type, options, callback) => {
            this.orbitdb.create(name, type, options || {}).then((store) => {
                this.manifest.put(store.id, [])
                socket.join(store.id)
                callback(store.id)
            }).catch((e) => {
                callback(false)
            })
        })
    }
    
    op(store: Store, op: Function, op_params, callback) {
        Promise.resolve(op.apply(store, op_params)).then(callback).catch(() => callback(false))
    }
    
    iterator(store: Store, op: Function, options, callback) {
        try {
            Promise.resolve(op.apply(store, [options]).collect()).then((entries) => {
                callback(entries.map((entry) => ({ hash: entry.hash, payload: entry.payload })))
            }).catch(() => callback(false))
        } catch(e) {
            callback(false)
        }
    }
}
