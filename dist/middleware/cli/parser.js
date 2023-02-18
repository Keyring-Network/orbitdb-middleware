import yargs from 'yargs';
import { commandList } from './commands/index.js';
export default () => {
    const args = yargs(process.argv.slice(2))
        .option('ipfs', {
        desc: 'IPFS multiaddr to use',
        string: true
    })
        .option('log-level', {
        string: true,
        desc: 'Log level to pass to logplease'
    })
        .env('MIDDLEWARE')
        .config({ extends: './config.default.json' })
        .config()
        .demandCommand(1, 'Please specify a command')
        .showHelpOnFail(false)
        .help()
        .completion();
    commandList.forEach(command => {
        args.command(command);
    });
    return args;
};
