import {
  composeBlockContent,
  extractBlock,
  extractMarkdownCodeBlock,
  parseBlock,
  executeBlock,
} from "./datacore-publisher";
import { DatacoreApi } from "@blacksmithgu/datacore";

const TEST_TEXT = `
Necessitatibus quisquam veritatis eos dolor hic totam sapiente necessitatibus est. Eaque maxime nisi velit fugiat sint. Non natus nam illo. Dolorum earum esse quod vitae autem.

%% DATACORE_PUBLISHER: start
\`\`\`datacorejs
const tasks = dc.query("@task");
let markdown = "| Task | File |\\n";
markdown +=    "|------|------|\\n";
for (const task of tasks) {
    markdown += \`| \${task.$text} | \${task.$file} |\\n\`;
}
return markdown;
\`\`\`
%%
| Task | File |
|------|------|
| Task 1 | file1.md |
| Task 2 | file2.md |
%% DATACORE_PUBLISHER: end %%

Necessitatibus quisquam veritatis eos dolor hic totam sapiente necessitatibus est. Eaque maxime nisi velit fugiat sint. Non natus nam illo. Dolorum earum esse quod vitae autem.
`;

const TEST_BLOCK = `%% DATACORE_PUBLISHER: start
\`\`\`datacorejs
const tasks = dc.query("@task");
let markdown = "| Task | File |\\n";
markdown +=    "|------|------|\\n";
for (const task of tasks) {
    markdown += \`| \${task.$text} | \${task.$file} |\\n\`;
}
return markdown;
\`\`\`
%%
| Task | File |
|------|------|
| Task 1 | file1.md |
| Task 2 | file2.md |
%% DATACORE_PUBLISHER: end %%`;

describe("operations", () => {
  it("parseBlock", () => {
    const parsed = parseBlock(TEST_BLOCK);
    expect(parsed).toEqual({
      content: TEST_BLOCK,
      startBlock: `%% DATACORE_PUBLISHER: start
\`\`\`datacorejs
const tasks = dc.query("@task");
let markdown = "| Task | File |\\n";
markdown +=    "|------|------|\\n";
for (const task of tasks) {
    markdown += \`| \${task.$text} | \${task.$file} |\\n\`;
}
return markdown;
\`\`\`
%%`,
      query: `const tasks = dc.query("@task");
let markdown = "| Task | File |\\n";
markdown +=    "|------|------|\\n";
for (const task of tasks) {
    markdown += \`| \${task.$text} | \${task.$file} |\\n\`;
}
return markdown;`,
      language: "datacorejs",
      output: `| Task | File |
|------|------|
| Task 1 | file1.md |
| Task 2 | file2.md |`,
      endBlock: "%% DATACORE_PUBLISHER: end %%",
    });
  });

  it("extractBlock", () => {
    const blocks = extractBlock(TEST_TEXT);
    expect(blocks.length).toBe(1);
    expect(blocks).toEqual([
      TEST_BLOCK
    ]);
  });
});

describe("executeBlock", () => {
  it("should execute a datacorejs block and return markdown", async () => {
    const block = {
      language: "datacorejs",
      query: `
        const tasks = dc.query("@task");
        let markdown = "| Task | File |\\n";
        markdown +=    "|------|------|\\n";
        for (const task of tasks) {
            markdown += \`| \${task.$text} | \${task.$file} |\\n\`;
        }
        return markdown;
      `,
    };
    const dc = {
      query: (q: string) => [
        { $text: "Task 1", $file: "file1.md" },
        { $text: "Task 2", $file: "file2.md" },
      ],
    } as unknown as DatacoreApi;

    const result = await executeBlock(block as any, dc);
    expect(result).toEqual(`| Task | File |
|------|------|
| Task 1 | file1.md |
| Task 2 | file2.md |`);
  });
});
