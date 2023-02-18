#!/usr/bin/env node

import { cli } from "./dist/middleware/cli/index.js";
import { create as createIpfs } from "ipfs"
import { multiaddr } from '@multiformats/multiaddr'
import Logger from 'logplease'

import events from "events"
events.setMaxListeners(100)

/**
 * @param {any} err
 * @param {string} origin
 */
const onUncaughtException = (err, origin) => {
  if (!origin || origin === 'uncaughtException') {
    console.error(err)
    process.exit(1)
  }
}

/**
 * Handle any uncaught errors
 *
 * @param {any} err
 */
const onUnhandledRejection = (err) => {
  console.error(err)
  process.exit(1)
}

process.once('uncaughtException', onUncaughtException)
process.once('unhandledRejection', onUnhandledRejection)

async function main(argv) {
    let exitCode = 0
    let ctx = {
        getStdin: () => process.stdin,
        cleanup: () => {},
        ipfs: undefined
    }
    
    const command = argv.slice(2)
    
    try {
        await cli(command, async (argv) => {
            if(argv.logLevel) {
                Logger.setLogLevel(argv.logLevel)
            }
        
            const ipfs = await createIpfs(argv.ipfs)
            if(argv.ipfs.peers) {
                await Promise.all(argv.ipfs.peers.map((address) => ipfs.swarm.connect(multiaddr(address))))
            }
            
            ctx = {
                ...ctx,
                ipfs,
                config: argv
            }
        
            argv.ctx = ctx
        })
    } catch (/** @type {any} */ err) {
        // Handle yargs errors
        if (err.code === 'ERR_YARGS') {
            err.yargs.showHelp()
            console.log('\n')
            console.log(`Error: ${err.message}`)
        } else {
            throw err
        }
        
        exitCode = 1
    }
    
    if (command[0] === 'daemon') {
        // don't shut down the daemon process
        return
    }
    
    process.exit(exitCode)
}

main(process.argv)
