#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createHash } from "node:crypto";

function readArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]?.replace(/^--/, "");
    const value = argv[index + 1];
    if (!key || !value) throw new Error("옵션은 --이름 값 형식으로 입력해 주세요.");
    args[key] = value;
  }
  return args;
}

function markdown(source) {
  return { cell_type: "markdown", metadata: {}, source: source.split(/(?<=\n)/) };
}

function code(source) {
  return {
    cell_type: "code",
    execution_count: null,
    metadata: {},
    outputs: [],
    source: source.split(/(?<=\n)/),
  };
}

function notebook(date, title, notionUrls) {
  const displayDate = date.replaceAll("-", ".");
  const notionLinks = notionUrls.length
    ? notionUrls.map((url, index) => `- [Notion 수업 노트${notionUrls.length > 1 ? ` ${index + 1}` : ""}](${url})`).join("\n")
    : "- Notion 수업 노트: 링크를 입력하세요.";
  return {
    cells: [
      markdown(`# ${displayDate} · ${title}\n\n${notionLinks}\n`),
      markdown(`## 수업 기록\n\n> 같은 날짜·주제의 Notion 기록을 이 셀에 Markdown으로 합쳐 넣습니다.\n`),
      markdown(`## 실습 코드\n`),
      code(`# 공통 분석 환경\nfrom pathlib import Path\n\nDATA_DIR = Path("../data")\nASSET_DIR = Path("assets")\nASSET_DIR.mkdir(parents=True, exist_ok=True)\n`),
      code(`# 실습 목적과 판단 기준은 주석으로 짧게 남깁니다.\n# 실습 코드를 작성하세요.\n`),
    ],
    metadata: {
      kernelspec: { display_name: "Python 3", language: "python", name: "python3" },
      language_info: { name: "python", version: "3" },
    },
    nbformat: 4,
    nbformat_minor: 5,
  };
}

function addCellIds(notebookData, seed) {
  notebookData.cells.forEach((cell, index) => {
    cell.id = createHash("sha1").update(`${seed}:${index}`).digest("hex").slice(0, 8);
  });
  return notebookData;
}

try {
  const args = readArgs(process.argv.slice(2));
  const week = String(Number(args.week)).padStart(2, "0");
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const slugPattern = /^[a-z0-9_]+$/;

  if (!args.week || Number.isNaN(Number(args.week)) || Number(args.week) < 1 || Number(args.week) > 16) {
    throw new Error("--week에는 1부터 16까지의 숫자를 입력해 주세요.");
  }
  if (!datePattern.test(args.date ?? "")) throw new Error("--date는 YYYY-MM-DD 형식이어야 합니다.");
  if (!slugPattern.test(args.slug ?? "")) throw new Error("--slug는 영문 소문자·숫자·밑줄만 사용할 수 있습니다.");
  if (!args.title?.trim()) throw new Error("--title을 입력해 주세요.");

  const notionUrls = [args.notion, args.notion2].filter(Boolean);
  if (notionUrls.some((url) => !/^https:\/\/(www\.)?(notion\.so|app\.notion\.com)\//.test(url))) {
    throw new Error("--notion과 --notion2에는 Notion 페이지 URL을 입력해 주세요.");
  }

  const repoRoot = path.resolve(import.meta.dirname, "..");
  const weekDir = path.join(repoRoot, `week${week}`);
  const outputPath = path.join(weekDir, `${args.date}_${args.slug}.ipynb`);

  if (!fs.existsSync(weekDir)) throw new Error(`폴더를 찾을 수 없습니다: ${weekDir}`);
  if (fs.existsSync(outputPath)) throw new Error(`이미 존재하는 파일입니다: ${outputPath}`);

  fs.mkdirSync(path.join(weekDir, "assets"), { recursive: true });
  const notebookData = addCellIds(notebook(args.date, args.title.trim(), notionUrls), outputPath);
  fs.writeFileSync(outputPath, `${JSON.stringify(notebookData, null, 2)}\n`, "utf8");
  console.log(path.relative(repoRoot, outputPath));
} catch (error) {
  console.error(`노트북 생성 실패: ${error.message}`);
  process.exitCode = 1;
}
