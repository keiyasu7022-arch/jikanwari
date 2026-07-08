import { Lesson, Period } from "@/types";

export interface LessonBlock {
  key: string;
  lane: number;
  startIndex: number; // PERIODS配列上のindex
  span: number; // 連続して繋がっているコマ数
  teacherId: string | null;
  subject: string;
  entries: { period: Period; lesson: Lesson }[];
}

interface ActiveLane {
  teacherId: string | null;
  subject: string;
  lastIndex: number;
  block: LessonBlock;
}

// 同じ講師・同じ科目のコマが直後のコマに続いている場合は同じブロックとして連結する。
// 生徒が入れ替わっても（studentIdsが異なっても）連結対象になる。
export function buildDayBlocks(
  dateLessons: Lesson[],
  periods: Period[]
): { blocks: LessonBlock[]; laneCount: number } {
  const byPeriod = new Map<number, Lesson[]>();
  for (const lesson of dateLessons) {
    const arr = byPeriod.get(lesson.periodId) ?? [];
    arr.push(lesson);
    byPeriod.set(lesson.periodId, arr);
  }

  const lanes: (ActiveLane | null)[] = [];
  const blocks: LessonBlock[] = [];

  periods.forEach((period, idx) => {
    const lessonsHere = byPeriod.get(period.id) ?? [];
    const usedLanes = new Set<number>();
    const remaining: Lesson[] = [];

    // 1. 直前のコマから継続できるレーンを探す
    for (const lesson of lessonsHere) {
      let matched = false;
      for (let laneIdx = 0; laneIdx < lanes.length; laneIdx++) {
        const lane = lanes[laneIdx];
        if (
          lane &&
          !usedLanes.has(laneIdx) &&
          lane.lastIndex === idx - 1 &&
          lane.teacherId === lesson.teacherId &&
          lane.subject === lesson.subject
        ) {
          lane.lastIndex = idx;
          lane.block.span += 1;
          lane.block.entries.push({ period, lesson });
          usedLanes.add(laneIdx);
          matched = true;
          break;
        }
      }
      if (!matched) remaining.push(lesson);
    }

    // 2. 継続できなかったコマは空いているレーンに新規ブロックとして配置する
    for (const lesson of remaining) {
      let laneIdx = lanes.findIndex((_, i) => !usedLanes.has(i));
      if (laneIdx === -1) {
        lanes.push(null);
        laneIdx = lanes.length - 1;
      }
      const block: LessonBlock = {
        key: lesson.id,
        lane: laneIdx,
        startIndex: idx,
        span: 1,
        teacherId: lesson.teacherId,
        subject: lesson.subject,
        entries: [{ period, lesson }],
      };
      blocks.push(block);
      lanes[laneIdx] = {
        teacherId: lesson.teacherId,
        subject: lesson.subject,
        lastIndex: idx,
        block,
      };
      usedLanes.add(laneIdx);
    }
  });

  return { blocks, laneCount: Math.max(1, lanes.length) };
}
