// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

function copyMethodName() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) return;

	const doc = editor.document;
	if (doc.languageId !== "python") return;

	const position = editor.selection.active;

	vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', doc.uri).then(symbols => {
		if (!symbols) return;

		for (const symbol of symbols) {
			if (symbol.kind === vscode.SymbolKind.Method || symbol.kind === vscode.SymbolKind.Function) {
				const range = symbol.range;
				if (range.contains(position)) {
					vscode.env.clipboard.writeText(symbol.name);
					return;
				}
			}
		}
	});
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable = vscode.commands.registerCommand('handy-dandy.multiCursorNumber', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const selections = editor.selections;
			editor.edit((editBuilder) => {
				for (let i = 0; i < selections.length; i++) {
					editBuilder.insert(selections[i].active, (i + 1).toString());
				}
			});
		}
	});

	let copyMethodNameDisposable = vscode.commands.registerCommand('handy-dandy.copyMethodName', copyMethodName);

	context.subscriptions.push(disposable);
	context.subscriptions.push(copyMethodNameDisposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
