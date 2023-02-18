declare const command: {
    command: string;
    describe: string;
    builder(yargs: any): any;
    handler({ ctx: { ipfs, config } }: {
        ctx: {
            ipfs: any;
            config: any;
        };
    }): Promise<void>;
};
export default command;
