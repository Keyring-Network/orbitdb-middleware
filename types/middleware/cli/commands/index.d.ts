export declare const commandList: {
    command: string;
    describe: string;
    builder(yargs: any): any;
    handler({ ctx: { ipfs, config }, overwrite, add }: {
        ctx: {
            ipfs: any;
            config: any;
        };
        overwrite: any;
        add: any;
    }): Promise<void>;
}[];
