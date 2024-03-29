
import * as child_process from 'child_process';

export class CommandError {
    constructor(
        public command: string,
        public args: string[],
        public exec: child_process.ExecException,
        public error_message: string
    ) {}
}

export function getCommandOutput(command: string, args: string[]): Promise<string[] | undefined> {
    let options: child_process.ExecOptionsWithStringEncoding = {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 1024
    };

    return new Promise(
        (resolve, reject) => {
            let child = child_process.execFile(command, args, options,
                (err: child_process.ExecException, std_out, std_err) => {
                    if (err) {
                        console.log(`error: ${err}\n${std_err}`);
                        reject(new CommandError(command, args, err, std_err));
                        return;
                    }

                    resolve(std_out.split(/\n/));
                });
        });
}