import { green, red } from "colors";
import { startMaster } from "./cluster";

/**
 * This is a CLI tool helps you do execute cmds per given folder. If you try to do the same
 * with a normal cd command, it will do it in the wrong folder. So this tool simply
 * navigates to the proper folders and does `your command`. That's it. #ez #boring
 */
export async function eisd(
    commandToExecute: string,
    directoriesToUse: string[],
    allowFailures = false,
    aSynchronous = false,
    envVariable = "",
    verbose: boolean = false
) {
    // Prevent triggering eisd twice because the cluster-worker will rerun all the code
    if (process.env._runnedBefore) return;
    process.env._runnedBefore = true;

    if (!commandToExecute) {
        process.stdout.write(red("ERROR: No command given..\n"));
        throw new Error("No command found.");
    }

    if (envVariable) {
        if (!process.env[envVariable]) {
            process.stdout.write(red(`ERROR: No environment value found on "process.env.${envVariable}"..\n`));
            throw new Error(`Invalid env variable given "${envVariable}".`);
        }

        const directories = (process.env[envVariable] as string).split(" ");
        directoriesToUse.push(...directories);
    }

    if (!directoriesToUse.length) {
        process.stdout.write(red("ERROR: No directories given..\n"));
        throw new Error("No directories found.");
    }

    if (verbose) {
        console.log("Directories:", directoriesToUse);
        process.stdout.write("\n");
    }

    const { directoriesSucces, directoriesFailed } = await startMaster(
        commandToExecute,
        directoriesToUse,
        allowFailures,
        aSynchronous,
        verbose
    );

    if (verbose && directoriesSucces.length) {
        process.stdout.write(green(`Done executing '${commandToExecute}' in the following directories:`));
        process.stdout.write("\n");
        process.stdout.write(directoriesSucces.join(", "));
        process.stdout.write("\n");
    }

    if (directoriesFailed.length) {
        process.stdout.write("\n");
        process.stdout.write(red(`Error(s) while executing '${commandToExecute}' in the following directories:`));
        process.stdout.write("\n");
        process.stdout.write(directoriesFailed.join(", "));
        process.stdout.write("\n");
        if (!allowFailures) process.exit(1);
    }
}
