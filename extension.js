// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

function multiCursorNumber() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const selections = editor.selections;
    editor.edit((editBuilder) => {
      for (let i = 0; i < selections.length; i++) {
        if (!selections[i].isEmpty) {
          editBuilder.delete(selections[i]);
        }

        editBuilder.insert(selections[i].active, (i + 1).toString());
      }
    });
  }
}

function copyMethodName() {
  const editor = vscode.window.activeTextEditor;
	if (!editor) return;

  const doc = editor.document;
  if (doc.languageId !== "python") return;

  const position = editor.selection.active;

  vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', doc.uri).then(symbols => {
		if (!symbols || !Array.isArray(symbols)) return;

		for (const symbol of symbols) {
			if (symbol.children) {
				for (const childSymbol of symbol.children) {
					if ((childSymbol.kind === vscode.SymbolKind.Method || childSymbol.kind === vscode.SymbolKind.Function) && childSymbol.range.contains(position)) {
						vscode.env.clipboard.writeText(childSymbol.name);
						return;
					}
				}
			}
		}
  });
}

function setUpSvgClass() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const doc = editor.document;
  if (!doc.fileName.endsWith(".svg.jinja")) return;

  const content = doc.getText();

  const svgRegex = /<svg([^>]+)? class="([^"]+)"([^>]+)?>/;
  if (svgRegex.test(content)) {
    const newContent = content.replace(svgRegex,
`{% if not class %}
  {% set class = "$2" %}
{% endif %}

<svg class="{{ class }}"$1$3>`
    );

    editor.edit(editBuilder => {
      const fullRange = new vscode.Range(doc.positionAt(0), doc.positionAt(content.length));
      editBuilder.replace(fullRange, newContent);
    });
  }
}


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let mcnDisposable = vscode.commands.registerCommand('handy-dandy.multiCursorNumber', multiCursorNumber);
	let cmnDisposable = vscode.commands.registerCommand('handy-dandy.copyMethodName', copyMethodName);
	let sscDisposable = vscode.commands.registerCommand('handy-dandy.setupSvgClass', setUpSvgClass);

	context.subscriptions.push(mcnDisposable);
	context.subscriptions.push(cmnDisposable);
	context.subscriptions.push(sscDisposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
