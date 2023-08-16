import { Editor, EditorPosition, MarkdownView, Plugin, Vault, Workspace, App, getAllTags } from 'obsidian';


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
	const project = `things:///add-project?title=${title}&notes=${deepLink}&tags=obsidian&x-success=obsidian://things-project-id`
	window.open(project);
}

function getTagsFromFile() {
   	// 获取当前活动文件对象
	const file = this.app.workspace.getActiveFile();

	// 获取当前文件的元数据
	const fileCache = this.app.metadataCache.getFileCache(file)
	const title = file.name
	const fileName = title.replace(/\.md$/, '')
	const tags = getAllTags(fileCache)
    return tags
}

function createTask(line: string, deepLink: string) {

	let taskUrl = `things:///add?title=${line}&notes=${deepLink}&tags=obsidian&x-success=obsidian://things-task-id`

	// 判断当前文件的标签中是否包含 #things-project 标签
	if (tags.includes('#things-project')) {
		// task url 中添加 project 参数
        // 对应的 todo 会添加到相应的 project 列表中
		taskUrl += '&list=' + encodeURIComponent(fileName)
	}

	window.open(taskUrl);
}


export default class ThingsLink extends Plugin {

	async onload() {
		this.registerObsidianProtocolHandler("things-project-id", async (id) => {
			const projectID = id['x-things-id'];
			const workspace = this.app.workspace;
			const view = workspace.getActiveViewOfType(MarkdownView);
			if (view == null) {
				return;
			} else {
				const editor = view.editor
				const thingsDeepLink = `things:///show?id=${projectID}`;
				let startRange: EditorPosition = {
					line: 0,
					ch: 0
				}
				let endRange: EditorPosition = {
					line: 0,
					ch: 0
				}
				editor.replaceRange(`- [ ] [️Things-Project](${thingsDeepLink}) #things-project \n\n`, startRange, endRange);
			}
		});

		this.addCommand({
			id: 'create-things-project',
			name: 'Things: create things project',
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

		this.registerObsidianProtocolHandler("things-task-id", async (id) => {
			const taskID = id['x-things-id'];
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view == null) {
				return;
			} else {
				const editor = view.editor
				// 获取当前行的文本内容
				const lineText = editor.getLine(editor.getCursor().line);

				// 在当前行的末尾添加新的文本
				editor.replaceRange(` [🏗️ Things-todo](things:///show?id=${taskID}) #things-todo`, { line: editor.getCursor().line, ch: lineText.length });
			}
		});


		this.addCommand({
			id: 'create-things-task',
			name: 'Things: create things todo',
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

					let line = getCurrentLine(editor, view)
                    // 去除行文本中的 `- [ ] ` 字符串
                    line = line.replace(/- \[ \] /g, '');

					const task = prepareTask(line)
					createTask(task, encodedLink)
				}
			}
		});

	}


	onunload() {

	}


}
