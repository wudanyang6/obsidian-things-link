import { Editor, EditorPosition, MarkdownView, Plugin, Vault, Workspace, App } from 'obsidian';


function getCurrentLine(editor: Editor, view: MarkdownView) {
	const lineNumber = editor.getCursor().line
	const lineText = editor.getLine(lineNumber)
	return lineText
}

function prepareTask(line: string) {
	line = line.trim()
	line = urlEncode(line)
	return line
}

function urlEncode(line: string) {
	line = encodeURIComponent(line)
	return line
}


function createProject(title: string, deepLink: string) {
	const project = `things:///add-project?title=${title}&notes=${deepLink}&tags=obsidian&x-success=obsidian://project-id`
	window.open(project);
}

function createTask(line: string, deepLink: string) {
	const task = `things:///add?title=${line}&notes=${deepLink}&tags=obsidian&x-success=obsidian://task-id`
	window.open(task);
}


export default class ThingsLink extends Plugin {

	async onload() {

		this.registerObsidianProtocolHandler("project-id", async (id) => {
			const projectID = id['x-things-id'];
			const workspace = this.app.workspace;
			const view = workspace.getActiveViewOfType(MarkdownView);
			if (view == null) {
				return;
			} else {
				const editor = view.editor
				const thingsDeepLink = `things:///show?id=${projectID}`;
				let fileText = editor.getValue()
				const lines = fileText.split('\n');
				const h1Index = lines.findIndex(line => line.startsWith('#'));
				if (h1Index !== -1) {
					let startRange: EditorPosition = {
						line: h1Index,
						ch:lines[h1Index].length
					}
					let endRange: EditorPosition = {
						line: h1Index,
						ch:lines[h1Index].length
					}
					editor.replaceRange(`\n\n[🏗️ Things-Project-Link](${thingsDeepLink})`, startRange, endRange);
				} else {
						let startRange: EditorPosition = {
						line: 0,
						ch:0
					}
					let endRange: EditorPosition = {
						line: 0,
						ch:0
					}
					editor.replaceRange(` #things-todo [🏗️ Project-Link](${thingsDeepLink})\n\n`, startRange, endRange);
				}
			}
		});
		
		this.addCommand({
			id: 'create-things-project',
			name: 'Create Things Project',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const workspace = this.app.workspace;
				const fileTitle = workspace.getActiveFile()
				if (fileTitle == null) {
					return;
				} else {
					let fileName = urlEncode(fileTitle.name)
					fileName = fileName.replace(/\.md$/, '')
					const obsidianDeepLink = (this.app as any).getObsidianUrl(fileTitle)
					const encodedLink = urlEncode(obsidianDeepLink)
					createProject(fileName, encodedLink);
				}
			}
		});

		this.registerObsidianProtocolHandler("task-id", async (id) => {
			const taskID = id['x-things-id'];
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view == null) {
				return;
			} else {
				const editor = view.editor
				// 获取当前行的文本内容
				const lineText = editor.getLine(editor.getCursor().line);
				// 在当前行的末尾添加新的文本
				editor.replaceRange(` [🏗️ Task-Link](things:///show?id=${taskID}) #things-todo `, {line: editor.getCursor().line, ch: lineText.length});
			}
		});
	
		
		this.addCommand({
			id: 'create-things-task',
			name: 'Create Things Task',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const workspace = this.app.workspace;
				const fileTitle = workspace.getActiveFile()
				if (fileTitle == null) {
					return;
				} else {
					let fileName = urlEncode(fileTitle.name)
					fileName = fileName.replace(/\.md$/, '')
					const obsidianDeepLink = (this.app as any).getObsidianUrl(fileTitle)
					const encodedLink = urlEncode(obsidianDeepLink)
					const line = getCurrentLine(editor, view)
					const task = prepareTask(line)
					createTask(task, encodedLink)
				}
			}
		});
	}
	onunload() {

	}

	
}
