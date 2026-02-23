import type { IEditorPortInterface } from "@application/interface/port/editor-port.interface";

import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { ONE_CONSTANT, ZERO_CONSTANT } from "@domain/constant";

const EDITOR_DEFAULT_FILE_NAME_CONSTANT: string = "message.txt";
const EDITOR_TEMP_DIRECTORY_PREFIX_CONSTANT: string = "bean-editor-";

const parseEditorCommand = (input: string): { args: Array<string>; command: string } => {
	const parts: Array<string> = (input.match(/[^\s"]+|"[^"]+"/g) ?? []).map((part: string): string => {
		const isQuoted: boolean = part.startsWith('"') && part.endsWith('"');

		return isQuoted ? part.slice(ONE_CONSTANT, -ONE_CONSTANT) : part;
	});
	const command: string | undefined = parts.shift();

	if (command === undefined || command.length === ZERO_CONSTANT) {
		throw new Error("Editor command is empty.");
	}

	return {
		args: parts,
		command,
	};
};

export class NodeEditorAdapter implements IEditorPortInterface {
	public async open(input: { command: string; initialValue: string }): Promise<string> {
		const temporaryDirectoryPath: string = await mkdtemp(path.join(tmpdir(), EDITOR_TEMP_DIRECTORY_PREFIX_CONSTANT));
		const temporaryFilePath: string = path.join(temporaryDirectoryPath, EDITOR_DEFAULT_FILE_NAME_CONSTANT);

		try {
			await writeFile(temporaryFilePath, input.initialValue, { encoding: "utf8" });
			await this.runEditorCommand({
				command: input.command,
				filePath: temporaryFilePath,
			});

			return await readFile(temporaryFilePath, { encoding: "utf8" });
		} finally {
			await rm(temporaryFilePath, { ["force"]: true });
			await rm(temporaryDirectoryPath, { ["force"]: true, ["recursive"]: true });
		}
	}

	private async runEditorCommand(input: { command: string; filePath: string }): Promise<void> {
		const parsedCommand: { args: Array<string>; command: string } = parseEditorCommand(input.command);

		await new Promise<void>((resolve: () => void, reject: (error: Error) => void): void => {
			const editorProcess: ReturnType<typeof spawn> = spawn(parsedCommand.command, [...parsedCommand.args, input.filePath], {
				stdio: "inherit",
			});

			editorProcess.once("error", (error: Error): void => {
				reject(error);
			});
			editorProcess.once("exit", (code: null | number): void => {
				if (code === ZERO_CONSTANT) {
					resolve();

					return;
				}

				reject(new Error(`Editor process exited with code ${code === null ? "unknown" : String(code)}`));
			});
		});
	}
}
