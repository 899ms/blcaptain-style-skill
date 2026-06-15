import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const WIDTH = 3840;
const HEIGHT = 2160;

const groups = [
  {
    id: "still-paper",
    name: "Still Paper",
    output: "docs/theme-series-still-paper.png",
    background: "warm",
    cards: [
      "local-tests/sp-mf-r01-field-photo-cover/output/SP-MF-R01-field-photo-cover-accepted-v12.png",
      "local-tests/sp-mf-r02-full-photo-thesis/output/SP-MF-R02-full-photo-thesis-accepted-v6.png",
      "local-tests/sp-mf-r03-object-observation/output/SP-MF-R03-object-observation-accepted-v7.png",
      "local-tests/sp-mf-r04-night-lake-note/output/SP-MF-R04-night-lake-note-accepted-v1.png",
      "local-tests/sp-mf-r05-daily-record/output/SP-MF-R05-daily-record-accepted-v5.png",
      "local-tests/sp-mf-r06-quote-photo/output/SP-MF-R06-quote-photo-accepted-v11.png",
      "local-tests/sp-mf-r07-essay-split/output/SP-MF-R07-essay-split-r07k-pexels-v13.png",
      "local-tests/sp-mf-r08-gear-list/output/SP-MF-R08-gear-list-accepted-v10.png"
    ],
    placements: [
      { x: -300, y: -260, w: 710, r: 7.6, z: 2 },
      { x: 500, y: -120, w: 710, r: 4.8, z: 5 },
      { x: 1280, y: -250, w: 710, r: 8.7, z: 4 },
      { x: 2050, y: -80, w: 710, r: 5.6, z: 7 },
      { x: 2820, y: -260, w: 710, r: 9.4, z: 3 },
      { x: 150, y: 900, w: 710, r: 5.1, z: 6 },
      { x: 1050, y: 820, w: 710, r: 8.2, z: 8 },
      { x: 1950, y: 940, w: 710, r: 6.5, z: 5 }
    ]
  },
  {
    id: "signal-proof",
    name: "Signal Proof",
    output: "docs/theme-series-signal-proof.png",
    background: "cool",
    cards: [
      "local-tests/sl-plan-e2e/deckA-deck/output/01-hero.png",
      "local-tests/sl-plan-e2e/deckA-deck/output/02-sl-ev-insight.png",
      "local-tests/sl-plan-e2e/deckA-deck/output/03-sl-ev-data.png",
      "local-tests/sl-plan-e2e/deckA-deck/output/04-sl-ev-workflow.png",
      "local-tests/sl-plan-e2e/deckA-deck/output/05-sl-ev-compare.png"
    ],
    placements: [
      { x: -110, y: -160, w: 760, r: -4.2, z: 3 },
      { x: 700, y: -40, w: 760, r: -1.3, z: 5 },
      { x: 1510, y: -170, w: 760, r: -5.1, z: 7 },
      { x: 2350, y: -20, w: 760, r: -2.4, z: 6 },
      { x: 1180, y: 860, w: 760, r: -4.7, z: 4 }
    ]
  },
  {
    id: "bridge-canvas",
    name: "Bridge Canvas",
    output: "docs/theme-series-bridge-canvas.png",
    background: "dark",
    cards: [
      "local-tests/bc-noir-proof/deck/output/01-noir-cn.png",
      "local-tests/bc-noir-proof/deck/output/02-noir-mix.png",
      "local-tests/bc-noir-proof/deck/output/03-noir-en.png",
      "local-tests/bc-noir-proof/deck2/output/04-split-mix.png",
      "local-tests/bc-noir-proof/deck2/output/05-manifesto.png",
      "local-tests/bc-noir-proof/deck-cool-weave/output/01-bc.png"
    ],
    placements: [
      { x: -180, y: -190, w: 770, r: 5.4, z: 2 },
      { x: 590, y: -80, w: 770, r: 2.1, z: 5 },
      { x: 1360, y: 70, w: 770, r: 6.8, z: 7 },
      { x: 2140, y: -50, w: 770, r: 3.2, z: 6 },
      { x: 2920, y: 100, w: 730, r: 6.1, z: 3 },
      { x: 1180, y: 860, w: 730, r: 4.3, z: 4 }
    ]
  }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function assertInputsExist() {
  for (const group of groups) {
    for (const cardPath of group.cards) {
      await fs.access(path.join(rootDir, cardPath));
    }
  }
}

function cardHtml(group, cardPath, placement, index) {
  const src = pathToFileURL(path.join(rootDir, cardPath)).href;
  const style = [
    `--x:${placement.x}px`,
    `--y:${placement.y}px`,
    `--w:${placement.w}px`,
    `--r:${placement.r}deg`,
    `--z:${placement.z}`
  ].join(";");

  return `<article class="card" style="${style}" aria-label="${escapeHtml(group.name)} card ${index + 1}">
    <img src="${src}" alt="" />
  </article>`;
}

function backgroundCss(kind) {
  if (kind === "dark") {
    return `
      background:
        radial-gradient(circle at 28% 12%, rgba(255,255,255,.08), transparent 30%),
        radial-gradient(circle at 78% 88%, rgba(198,164,102,.13), transparent 32%),
        repeating-linear-gradient(0deg, rgba(255,255,255,.018), rgba(255,255,255,.018) 1px, transparent 1px, transparent 8px),
        #141719;`;
  }

  if (kind === "cool") {
    return `
      background:
        radial-gradient(circle at 16% 10%, rgba(255,255,255,.96), transparent 34%),
        radial-gradient(circle at 82% 82%, rgba(194,210,225,.38), transparent 38%),
        repeating-linear-gradient(0deg, rgba(35,55,78,.018), rgba(35,55,78,.018) 1px, transparent 1px, transparent 8px),
        #eff3f4;`;
  }

  return `
      background:
        radial-gradient(circle at 18% 8%, rgba(255,255,255,.98), transparent 36%),
        radial-gradient(circle at 80% 84%, rgba(225,222,211,.44), transparent 42%),
        repeating-linear-gradient(0deg, rgba(61,54,43,.016), rgba(61,54,43,.016) 1px, transparent 1px, transparent 8px),
        #f4f2eb;`;
}

function buildHtml(group) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=${WIDTH}, initial-scale=1" />
<title>${escapeHtml(group.name)} Series Canvas</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  body {
    ${backgroundCss(group.background)}
  }
  .stage {
    position: relative;
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    overflow: hidden;
    isolation: isolate;
  }
  .stage::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    background:
      linear-gradient(108deg, rgba(255,255,255,.34), transparent 22%, transparent 78%, rgba(255,255,255,.22)),
      linear-gradient(180deg, rgba(255,255,255,.18), transparent 48%, rgba(31,33,30,.08));
    pointer-events: none;
  }
  .stage::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 40;
    background:
      linear-gradient(90deg, rgba(29,30,28,.035), transparent 13%, transparent 87%, rgba(29,30,28,.035)),
      linear-gradient(180deg, rgba(255,255,255,.08), transparent 48%, rgba(29,30,28,.045));
    mix-blend-mode: multiply;
    pointer-events: none;
  }
  .card {
    position: absolute;
    left: var(--x);
    top: var(--y);
    z-index: var(--z);
    width: var(--w);
    height: calc(var(--w) * 1.333333);
    padding: 12px;
    background: #fdfdf9;
    border: 1px solid rgba(25,25,23,.12);
    box-shadow:
      0 42px 76px rgba(38,41,37,.18),
      0 11px 24px rgba(38,41,37,.12),
      inset 0 1px 0 rgba(255,255,255,.92);
    transform: perspective(7200px) rotateX(1.2deg) rotate(var(--r));
    transform-origin: 50% 50%;
    overflow: hidden;
  }
  .card::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(135deg, rgba(255,255,255,.12), transparent 42%, rgba(35,35,31,.035));
    mix-blend-mode: multiply;
  }
  .card img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #f5f3eb;
    filter: saturate(.985) contrast(.995) sepia(.01);
  }
</style>
</head>
<body>
  <main class="stage">
    ${group.cards.map((cardPath, index) => cardHtml(group, cardPath, group.placements[index], index)).join("\n    ")}
  </main>
</body>
</html>`;
}

function buildSourcesMarkdown() {
  const sections = groups.map(group => {
    const rows = group.cards.map(cardPath => `| ${group.name} | \`${cardPath}\` |`).join("\n");
    return `## ${group.name}\n\n| 主题 | 本地路径 |\n|---|---|\n${rows}`;
  }).join("\n\n");

  return `# 三组主题横向画布来源清单

输出：

- \`docs/theme-series-still-paper.png\`
- \`docs/theme-series-signal-proof.png\`
- \`docs/theme-series-bridge-canvas.png\`

边界：

- 三张图都是展示用横向画布，不是生产 proof。
- 卡片内容来自本地 PNG，只做摆放、缩放、旋转、阴影和桌面摄影合成。
- 不从展示画布反裁生产素材。

${sections}
`;
}

async function renderGroup(browser, group, tempDir) {
  const outputPath = path.join(rootDir, group.output);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  const tempHtmlPath = path.join(tempDir, `${group.id}.html`);
  await fs.writeFile(tempHtmlPath, buildHtml(group), "utf8");

  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1
  });

  await page.goto(pathToFileURL(tempHtmlPath).href, { waitUntil: "networkidle" });
  await page.waitForFunction(() => {
    return Array.from(document.images).every(img => img.complete && img.naturalWidth > 0);
  });
  await page.screenshot({ path: outputPath, fullPage: false });
  await page.close();

  console.log(`wrote ${path.relative(rootDir, outputPath)}`);
}

async function render() {
  await assertInputsExist();
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "blcaptain-theme-series-"));
  const browser = await chromium.launch({
    args: ["--allow-file-access-from-files"]
  });

  for (const group of groups) {
    await renderGroup(browser, group, tempDir);
  }

  await browser.close();
  await fs.writeFile(path.join(rootDir, "docs/theme-series-sources.md"), buildSourcesMarkdown(), "utf8");
  await fs.rm(tempDir, { recursive: true });
  console.log("wrote docs/theme-series-sources.md");
}

render().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
