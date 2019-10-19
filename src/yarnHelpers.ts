import * as sh from "shelljs";

export function checkYarnAvailability() {
    if (!sh.which("yarn")) {
        throw new Error("Sorry, this script requires Yarn!");
    }
}

export function getYarnWorkspaces() {
    const result = sh.exec("yarn workspaces info --json", { silent: true });

    if (result.stderr) {
        throw new Error("Yarn workspaces not found!");
    }

    try {
        const response = JSON.parse(result.stdout) as { type: "log"; data: string };

        const workspaces = JSON.parse(response.data) as { [packageName: string]: { location: string } };
        const workspacePaths = [];
        for (const iterator in workspaces) {
            workspacePaths.push(workspaces[iterator].location);
        }

        return workspacePaths;
    } catch {
        throw new Error("Something went wrong when trying to retrieve the yarn workspaces!");
    }
}
