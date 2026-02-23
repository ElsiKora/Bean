export interface IEditorPortInterface {
	open(input: { command: string; initialValue: string }): Promise<string>;
}
