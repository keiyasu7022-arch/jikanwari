import { Lesson, Period } from "@/types";

export interface LessonBlock {
  key: string;
  lane: number;
  startIndex: number; // PERIODS配列上のindex
  span: number; // 連続して繋がっているコマ数
  teacherId: string | null;
  entries: { period: Period; lessons: Lesson[] }[];
}

interface ActiveLane {
  teacherId: string | null;
  lastIndex: number;
  block: LessonBlock;
}

const UNDECIDED_KEY = "__undecided__";

// 同じ講師のコマは、同じ時間帯であれば1つにまとめ、直後のコマに続いている場合も
// 同じブロックとして連結する（科目や生徒が異なっていてもまとめる）。
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

    // 同じ講師のコマをこの時限内でまとめる
    const byTeacher = new Map<string, { teacherId: string | null; lessons: Lesson[] }>();
    for (const lesson of lessonsHere) {
      const key = lesson.teacherId ?? UNDECIDED_KEY;
      const group = byTeacher.get(key);
      if (group) {
        group.lessons.push(lesson);
      } else {
        byTeacher.set(key, { teacherId: lesson.teacherId, lessons: [lesson] });
      }
    }

    const usedLanes = new Set<number>();
    const remaining: { teacherId: string | null; lessons: Lesson[] }[] = [];

    // 1. 直前のコマから継続できるレーンを探す
    for (const group of byTeacher.values()) {
      let matched = false;
      for (let laneIdx = 0; laneIdx < lanes.length; laneIdx++) {
        const lane = lanes[laneIdx];
        if (
          lane &&
          !usedLanes.has(laneIdx) &&
          lane.lastIndex === idx - 1 &&
          lane.teacherId === group.teacherId
        ) {
          lane.lastIndex = idx;
          lane.block.span += 1;
          lane.block.entries.push({ period, lessons: group.lessons });
          usedLanes.add(laneIdx);
          matched = true;
          break;
        }
      }
      if (!matched) remaining.push(group);
    }

    // 2. 継続できなかったコマは空いているレーンに新規ブロックとして配置する
    for (const group of remaining) {
      let laneIdx = lanes.findIndex((_, i) => !usedLanes.has(i));
      if (laneIdx === -1) {
        lanes.push(null);
        laneIdx = lanes.length - 1;
      }
      const block: LessonBlock = {
        key: group.lessons[0].id,
        lane: laneIdx,
        startIndex: idx,
        span: 1,
        teacherId: group.teacherId,
        entries: [{ period, lessons: group.lessons }],
      };
      blocks.push(block);
      lanes[laneIdx] = {
        teacherId: group.teacherId,
        lastIndex: idx,
        block,
      };
      usedLanes.add(laneIdx);
    }
  });

  return { blocks, laneCount: Math.max(1, lanes.length) };
}
