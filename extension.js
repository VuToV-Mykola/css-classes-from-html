const vscode = require("vscode");
const htmlParser = require("./modules/htmlParser");
const cssGenerator = require("./modules/cssGenerator");
const commentManager = require("./modules/commentManager");
const FigmaService = require("./modules/figmaService");

function activate(ctx) {
  const cmd = vscode.commands.registerCommand(
    "cssclassesfromhtml.generateCSS",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return vscode.window.showErrorMessage("No active editor!");

      const cfg = vscode.workspace.getConfiguration("cssclassesfromhtml");
      const sel = editor.selection;
      const html = sel.isEmpty
        ? editor.document.getText()
        : editor.document.getText(sel);

      commentManager.setLanguage(cfg.get("language", "uk"));

      const { classes, classParents, classTags } =
        htmlParser.extractClasses(html);
      if (!classes.length)
        return vscode.window.showWarningMessage("No classes found!");

      let tokens = null;
      if (cfg.get("figmaEnabled")) {
        try {
          const link = await vscode.window.showInputBox({
            prompt: "Figma link (opt)",
          });
          const key = link && new FigmaService("").extractFileKeyFromLink(link);
          if (key) {
            const token = await vscode.window.showInputBox({
              prompt: "Figma token",
              password: true,
            });
            if (token)
              tokens = await new FigmaService(token).parseDesignTokens(
                await new FigmaService(token).getFile(key),
                await new FigmaService(token).getStyles(key)
              );
          }
        } catch (e) {}
      }

      const dict = cssGenerator.createClassDictionary(
        classes,
        {
          responsive: cfg.get("responsive", true),
          darkMode: cfg.get("darkMode", true),
          designTokens: tokens,
        },
        classParents,
        classTags
      );

      const css = cssGenerator.generateCSS(
        classes,
        dict,
        cfg.get("includeGlobal", true),
        cfg.get("includeReset", true),
        tokens,
        sel.isEmpty
          ? null
          : [
              ...new Set(
                html
                  .match(/<(\w+)[^>]*class=/g)
                  ?.map((x) => x.match(/<(\w+)/)[1])
              ),
            ]
      );

      vscode.workspace
        .openTextDocument({ language: "css", content: css })
        .then((d) => vscode.window.showTextDocument(d));
    }
  );
  ctx.subscriptions.push(cmd);
}

function deactivate() {}
module.exports = { activate, deactivate };
