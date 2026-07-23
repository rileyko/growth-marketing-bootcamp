import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const inputPath = path.join(projectRoot, "curriculum.md");
const outputPath = path.join(projectRoot, "output", "notion", "growth_marketer_curriculum.csv");

const markdown = fs.readFileSync(inputPath, "utf8");
const lines = markdown.split(/\r?\n/);

const startDate = new Date("2026-07-21T00:00:00+09:00");
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const records = [];
let currentDate = "";

for (let index = 0; index < lines.length; index += 1) {
  const dateMatch = lines[index].match(/^## (\d{4}-\d{2}-\d{2})$/);
  if (dateMatch) {
    currentDate = dateMatch[1];
    continue;
  }

  const sessionMatch = lines[index].match(
    /^### (\d{2}:\d{2}) ~ (\d{2}:\d{2}) · (.+)$/,
  );
  if (!sessionMatch || !currentDate) continue;

  const [, startTime, endTime, category] = sessionMatch;
  let cursor = index + 1;
  while (cursor < lines.length && lines[cursor].trim() === "") cursor += 1;
  const topic = lines[cursor]?.startsWith("-") ? "" : (lines[cursor]?.trim() ?? "");

  const metadata = {};
  while (cursor < lines.length && !/^#{2,3} /.test(lines[cursor])) {
    const itemMatch = lines[cursor].match(/^- ([^:]+):\s*(.*)$/);
    if (itemMatch) metadata[itemMatch[1].trim()] = itemMatch[2].trim();
    cursor += 1;
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const durationHours = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60;
  const sessionDate = new Date(`${currentDate}T00:00:00+09:00`);
  const week = Math.floor((sessionDate - startDate) / (7 * 24 * 60 * 60 * 1000)) + 1;
  const scheduleStatus = category === "휴강"
    ? "휴강"
    : currentDate < today
      ? "완료"
      : currentDate === today
        ? "오늘"
        : "예정";

  records.push({
    이름: `${currentDate.replaceAll("-", ".")} ${startTime} · ${category}`,
    날짜: currentDate,
    시작: startTime,
    종료: endTime,
    시간: durationHours,
    주차: `${week}주차`,
    구분: category,
    "수업 주제": topic === "-" ? "" : topic,
    "주 강사": metadata["주 강사"] === "-" ? "" : (metadata["주 강사"] ?? ""),
    "보조 강사": metadata["보조 강사"] === "-" ? "" : (metadata["보조 강사"] ?? ""),
    "교육 장소": metadata["교육 장소"] === "-" ? "" : (metadata["교육 장소"] ?? ""),
    "일정 상태": scheduleStatus,
    "기록 상태": category === "휴강" ? "해당 없음" : "미작성",
    "학습 기록": category === "휴강"
      ? ""
      : "오늘의 핵심:\n\n배운 내용:\n\n실습:\n\n들으면서 든 생각:\n\n궁금한 점:\n\n배운 점과 다음 액션:",
    "자료 링크": "",
  });

  index = cursor - 1;
}

const headers = [
  "이름",
  "날짜",
  "시작",
  "종료",
  "시간",
  "주차",
  "구분",
  "수업 주제",
  "주 강사",
  "보조 강사",
  "교육 장소",
  "일정 상태",
  "기록 상태",
  "학습 기록",
  "자료 링크",
];

const escapeCsv = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const csv = [
  headers.map(escapeCsv).join(","),
  ...records.map((record) => headers.map((header) => escapeCsv(record[header])).join(",")),
].join("\n");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `\uFEFF${csv}\n`, "utf8");

if (records.length !== 158) {
  throw new Error(`예상 일정 158개와 변환 결과 ${records.length}개가 일치하지 않습니다.`);
}

console.log(`생성 완료: ${outputPath}`);
console.log(`일정 수: ${records.length}`);
console.log(`기간: ${records[0].날짜} ~ ${records.at(-1).날짜}`);
