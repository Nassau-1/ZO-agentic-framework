const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
  console.log('[ZAF Control] Editor Extension activated.');

  // 1. Register Sidebar Webview Provider
  class ZafSidebarProvider {
    resolveWebviewView(webviewView) {
      webviewView.webview.options = {
        enableScripts: true
      };

      webviewView.webview.html = getWebviewHtml();

      // Listen for command events sent from webviews
      webviewView.webview.onDidReceiveMessage(message => {
        switch (message.command) {
          case 'runTicket':
            vscode.commands.executeCommand('zaf.runTicket', message.ticketId, message.role, message.harness);
            break;
        }
      });
    }
  }

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('zaf-sidebar-panel', new ZafSidebarProvider())
  );

  // 2. Command: Run Ticket (Terminal Multiplexing)
  let runTicketCommand = vscode.commands.registerCommand('zaf.runTicket', (ticketId, role, harness) => {
    if (!ticketId) {
      vscode.window.showErrorMessage('❌ Error: No ticket ID specified for launch.');
      return;
    }

    const config = vscode.workspace.getConfiguration('zaf');
    const finalHarness = harness || config.get('defaultHarness') || 'claude';
    const finalRole = role || 'engineering';

    vscode.window.showInformationMessage(`🚀 ZAF Terminal: Spawning ${finalHarness} harness for ${ticketId}...`);

    // Create VSCode multiplex terminal
    const terminal = vscode.window.createTerminal(`ZAF-${finalHarness}-${ticketId}`);
    
    // Execute CLI command directly inside the terminal session
    terminal.sendText(`node cli/zo.js run ${finalRole} --ticket ${ticketId} --harness ${finalHarness}`);
    terminal.show(true);
  });

  context.subscriptions.push(runTicketCommand);

  // 3. Editor Gutter Indicators (Active Code Telemetry)
  const zafIconUri = vscode.Uri.file(path.join(context.extensionPath, 'resources', 'zaf-icon.svg'));

  const activeTicketDecorationType = vscode.window.createTextEditorDecorationType({
    gutterIconPath: zafIconUri,
    gutterIconSize: 'contain',
    overviewRulerColor: '#10b981',
    overviewRulerLane: vscode.OverviewRulerLane.Left,
    light: {
      gutterIconPath: zafIconUri
    },
    dark: {
      gutterIconPath: zafIconUri
    }
  });

  let activeEditor = vscode.window.activeTextEditor;

  function updateDecorations() {
    if (!activeEditor) return;
    
    const document = activeEditor.document;
    const activeFileName = path.basename(document.fileName);

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return;

    const rootPath = workspaceFolders[0].uri.fsPath;
    const activeDir = path.join(rootPath, 'WIP', 'tickets', 'ACTIVE');

    if (!fs.existsSync(activeDir)) {
      activeEditor.setDecorations(activeTicketDecorationType, []);
      return;
    }

    try {
      const ticketFiles = fs.readdirSync(activeDir).filter(f => f.endsWith('.md'));
      const decorations = [];

      for (const tFile of ticketFiles) {
        const filePath = path.join(activeDir, tFile);
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // Parse yaml front-matter using robust custom logic
        const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
        if (!match) continue;

        const yamlText = match[1];
        const data = {};
        for (const line of yamlText.split('\n')) {
          const colonIdx = line.indexOf(':');
          if (colonIdx !== -1) {
            const key = line.slice(0, colonIdx).trim();
            const val = line.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
            data[key] = val;
          }
        }

        const ticketId = data.id || path.basename(tFile, '.md');
        const status = data.status || 'OPEN';
        const role = data.roles || 'antigravity-ide';
        const repo = data.repo || '';

        // If the open file is within the ticket's repo context, render gutter decoration warning
        if (rootPath.toLowerCase().includes(repo.toLowerCase()) && repo !== '') {
          const range = new vscode.Range(0, 0, 0, 0); // gutter icon on first line
          const hoverMessage = new vscode.MarkdownString();
          
          hoverMessage.isTrusted = true;
          hoverMessage.appendMarkdown(`### 🔴 **ZAF Active Context Lock**\n\n`);
          hoverMessage.appendMarkdown(`*   **Ticket ID**: \`${ticketId}\`\n`);
          hoverMessage.appendMarkdown(`*   **Title**: *${data.title || 'N/A'}*\n`);
          hoverMessage.appendMarkdown(`*   **Status**: \`${status}\` (Assigned: \`${role}\`)\n\n`);
          hoverMessage.appendMarkdown(`> **Warning**: A sovereign AI agent harness session matches this file. Code edits might conflict with concurrent background operations.\n\n`);
          hoverMessage.appendMarkdown(`--- \n`);
          hoverMessage.appendMarkdown(`[▶ Launch Sovereign subshell](command:zaf.runTicket?${encodeURIComponent(JSON.stringify([ticketId, role]))})`);

          decorations.push({
            range,
            hoverMessage
          });
        }
      }

      activeEditor.setDecorations(activeTicketDecorationType, decorations);
    } catch (err) {
      console.error('[ZAF Control] Failed decorating editor gutters:', err);
    }
  }

  if (activeEditor) {
    updateDecorations();
  }

  vscode.window.onDidChangeActiveTextEditor(editor => {
    activeEditor = editor;
    if (editor) {
      updateDecorations();
    }
  }, null, context.subscriptions);

  vscode.workspace.onDidChangeTextDocument(event => {
    if (activeEditor && event.document === activeEditor.document) {
      updateDecorations();
    }
  }, null, context.subscriptions);
}

function getWebviewHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZO Active Board</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: #0f0f11;
      color: #a0a0a0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
    }
    .container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }
    .header {
      padding: 10px 12px;
      border-bottom: 1px solid #1a1a20;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #111115;
    }
    .title {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #dfdfdf;
      display: flex;
      align-items: center;
    }
    .title-dot {
      width: 6px;
      height: 6px;
      background-color: #10b981;
      border-radius: 50%;
      margin-right: 6px;
      box-shadow: 0 0 8px #10b981;
    }
    iframe {
      border: none;
      flex-grow: 1;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title"><span class="title-dot"></span>ZAF Control Plane</div>
    </div>
    <iframe src="http://localhost:4242" id="dashboard-iframe"></iframe>
  </div>
</body>
</html>`;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
