import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Vault, Workspace } from 'obsidian';

function getObsidianDeepLink(vault: Vault, workspace: Workspace) {
	const fileTitle = workspace.getActiveFile().name.split('.')[0].split(/\s/).join('%2520');
	const vaultName = vault.getName();
	const link = `obsidian://open?vault=${vaultName}%26file=${fileTitle}`;
	return link;
}



export default class MyPlugin extends Plugin {

	async onload() {

		this.addCommand({
			id: 'create-things-project',
			name: 'Create Things Project',
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view) {
					if (!checking) {

						const vault = this.app.vault;
						const workspace = this.app.workspace;

						const fileTitleForProject = workspace.getActiveFile().name.split('.')[0].split(/\s/).join('%20');

						const fileTitleForURL = workspace.getActiveFile().name.split('.')[0].split(/\s/).join('%2520');

						const vaultName = vault.getName();

						const obsidianDeepLink = `obsidian://open?vault=${vaultName}%26file=${fileTitleForURL}`;

						const thingsURL = `things:///add-project?title=${fileTitleForProject}&notes=${obsidianDeepLink}`;

						const thingsDeepLink = `things:///show?query=${fileTitleForProject}`;

						window.open(thingsURL);
						setTimeout(() => {
							window.open(thingsDeepLink);
						}, 500);

						async function getFileText(): Promise<string> {
							try {
								const text = await vault.read(workspace.getActiveFile())
								return text
							}
							catch (e) {
								console.log(e);
    							return null;
							}
						} 

						(async () => {
							const text = await getFileText();
							const lines = text.split('\n');
							const h1Index = lines.findIndex(line => line.startsWith('#'));
							if (h1Index !== -1) {
								lines.splice(h1Index + 1, 0, `\n[Things](${thingsDeepLink})`);
								const newText = lines.join('\n');

								vault.modify(workspace.getActiveFile(), newText);
							} else {
								lines.splice(0, 0, `\n[Things](${thingsDeepLink})`);
								const newText = lines.join('\n');

								vault.modify(workspace.getActiveFile(), newText);
							}
						})();
						
					}
					return true;
				}
				return false;
			}
		});

		this.registerObsidianProtocolHandler("things-id", async (id) => {
			console.log(id['x-things-id'])
		});
		
		this.addCommand({
			id: 'create-things-task',
			name: 'Create Things Task',
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view) {
					if (!checking) {

						function getCurrentLine() {
							const lineNumber = view.editor.getCursor().line
							const lineText = view.editor.getLine(lineNumber)
							return lineText
						}

						function prepareLine(line: string) {
							line = line.replace(/^-/gm, '')
							line = line.replace(/^\*/gm, '')
							line = line.replace(/^#/gm, '')
							line = line.replace(/^_/gm, '')
							line = line.replace(/^>/gm, '')
							line = line.replace(/^\t/gm, '')
							line = line.trim()
							return line
						}

						function encodeLine(line: string) {
							// return encodeURI(line)
							line = line.replace(/\s/g, '%20')
							line = line.replace(/\:/g, '%3A')
							line = line.replace(/\//g, '%2F')
							line = line.replace(/\?/g, '%3F')
							line = line.replace(/\=/g, '%3D')
							line = line.replace(/\#/g, '%23')
							line = line.replace(/\@/g, '%40')
							line = line.replace(/\$/g, '%24')
							line = line.replace(/\^/g, '%5E')
							line = line.replace(/\&/g, '%26')
							line = line.replace(/\+/g, '%2B')
							line = line.replace(/\:/g, '%3A')
							line = line.replace(/\;/g, '%3B')
							line = line.replace(/\</g, '%3C')
							line = line.replace(/\>/g, '%3E')
							return line
						}
						
						function createTask(line: string, deepLink: string) {
							const task = `things:///add?title=${line}&notes=${deepLink}&x-success=obsidian://things-id`
							window.open(task);
							
						}

						const vault = this.app.vault;
						const workspace = this.app.workspace;
						const obsidianDeepLink = getObsidianDeepLink(vault, workspace);
						
						const task = getCurrentLine()
						const cleanedLine = prepareLine(task)
						const encodedLine = encodeLine(cleanedLine)
						createTask(encodedLine, obsidianDeepLink)
						
					
					}
					return true
				}
				return false;
			}
		});
			
	}

	onunload() {

	}

	
}
