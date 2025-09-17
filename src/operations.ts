import type { Editor, TFile } from "obsidian";
import { Replacer, UnsafeApp } from "./types";
import { createReplacerFromContent } from "./datacore-publisher";
import { getDatacoreAPI } from "./datacore-utils";
import { DatacoreApi } from "@blacksmithgu/datacore";

export class Operator {
  app: UnsafeApp;
  dc: DatacoreApi;

  constructor(app: UnsafeApp) {
    this.app = app;
    const dc = getDatacoreAPI(app);
    if (!dc) {
      throw new Error(
        "Datacore API not found. Make sure the Datacore plugin is enabled."
      );
    }
    this.dc = dc;
  }

  private getActiveTFile(): TFile {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      throw new Error("No active file");
    }
    return activeFile;
  }

  async updateActiveFile(editor: Editor) {
    const cursor = editor.getCursor();
    const content = editor.getValue();

    const tfile = this.getActiveTFile();

    const replacer = await createReplacerFromContent(content, this.dc, tfile);

    // If there is no replacer, do nothing
    if (replacer.length === 0) {
      return;
    }

    const updatedContent = this.updateContent(content, replacer);

    editor.setValue(updatedContent);
    editor.setCursor(cursor);
  }

  updateFromSource(source: string) {
    const targetTfiles = this.retrieveTfilesFromSource(source);

    targetTfiles.forEach(async (tfile) => {
      await this.updateDatacorePublisherOutput(tfile);
    });
  }

  private retrievePathsFromSource(source: string): Array<string> {
    const pages = this.dc.query(source);
    if (!pages) {
      return [];
    }
    return pages.map((p: any) => p.file.path);
  }

  private retrieveTfilesFromSource(source: string): Array<TFile> {
    const paths = this.retrievePathsFromSource(source);
    const tfiles = paths
      .map((path) => this.app.vault.getFileByPath(path))
      .filter((tfile): tfile is TFile => tfile !== null);
    return tfiles;
  }

  private async updateDatacorePublisherOutput(tfile: TFile) {
    const content = await this.app.vault.cachedRead(tfile);

    const replacer = await createReplacerFromContent(content, this.dc, tfile);
    const updatedContent = this.updateContent(content, replacer);

    this.app.vault.process(tfile, () => updatedContent);
  }

  private updateContent(content: string, replacer: Replacer[]) {
    return replacer.reduce(
      (
        c: string,
        {
          searchValue,
          replaceValue,
        }: { searchValue: string; replaceValue: string }
      ) => {
        return c.replace(searchValue, replaceValue);
      },
      content
    );
  }
}
