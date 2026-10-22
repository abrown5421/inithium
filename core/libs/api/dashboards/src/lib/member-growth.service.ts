import type { MemberGrowth, MemberGrowthPoint, MemberGrowthRange, MemberGrowthUnit } from '@inithium/shared-contracts';
import { UserModel } from '@inithium/api-users';

// Calendar days are handled as `YYYY-MM-DD` strings in the viewer's time zone, and their arithmetic is done at UTC
// midnight, where every day is 24 hours long.
const DAY_MS = 86_400_000;

const fromDay = (day: string) => Date.parse(`${day}T00:00:00Z`);
const toDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const addDays = (day: string, days: number) => toDay(fromDay(day) + days * DAY_MS);

function addMonths(day: string, months: number): string {
  const date = new Date(fromDay(day));
  date.setUTCMonth(date.getUTCMonth() + months);
  return toDay(date.getTime());
}

/** The first day of the period holding `day`: itself, its week's Monday or its month's 1st. */
export function startOfPeriod(day: string, unit: MemberGrowthUnit): string {
  if (unit === 'day') return day;
  if (unit === 'month') return `${day.slice(0, 7)}-01`;
  const sinceMonday = (new Date(fromDay(day)).getUTCDay() + 6) % 7;
  return addDays(day, -sinceMonday);
}

function nextPeriod(start: string, unit: MemberGrowthUnit): string {
  return unit === 'day' ? addDays(start, 1) : unit === 'week' ? addDays(start, 7) : addMonths(start, 1);
}

/** Whether the runtime knows this IANA time zone, e.g. 'Europe/London'. */
export function isTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** The calendar day `now` falls on in a time zone, as `YYYY-MM-DD`. */
export function dayIn(timeZone: string, now: Date): string {
  const parts = new Intl.DateTimeFormat('en', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (type: string) => parts.find((entry) => entry.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

/** How a range is grouped and where it starts, given today and (for all time) the first member's join day. */
export function rangeWindow(range: MemberGrowthRange, today: string, firstDay: string | undefined): { unit: MemberGrowthUnit; start: string } {
  switch (range) {
    case 'week':
      return { unit: 'day', start: addDays(today, -6) };
    case 'month':
      return { unit: 'day', start: addDays(today, -29) };
    case 'quarter':
      return { unit: 'week', start: startOfPeriod(addDays(today, -7 * 12), 'week') };
    case 'half-year':
      return { unit: 'week', start: startOfPeriod(addDays(today, -7 * 25), 'week') };
    case 'year':
      return { unit: 'month', start: addMonths(startOfPeriod(today, 'month'), -11) };
    case 'all': {
      const first = firstDay && firstDay < today ? firstDay : today;
      const days = (fromDay(today) - fromDay(first)) / DAY_MS;
      // Enough points to draw a line, but never thousands of them.
      const unit: MemberGrowthUnit = days < 60 ? 'day' : days < 730 ? 'week' : 'month';
      return { unit, start: startOfPeriod(first, unit) };
    }
  }
}

/**
 * The series from members' join days (`{ day: count }`): every period from the range's start to today, each with the
 * members who joined in it and the running total by its end.
 */
export function buildMemberGrowth(range: MemberGrowthRange, today: string, joinsByDay: Record<string, number>): MemberGrowth {
  const days = Object.keys(joinsByDay).sort();
  const { unit, start } = rangeWindow(range, today, days[0]);

  let before = 0;
  const joinedByPeriod = new Map<string, number>();
  for (const day of days) {
    const count = joinsByDay[day] ?? 0;
    if (day < start) before += count;
    else if (day <= today) {
      const period = startOfPeriod(day, unit);
      joinedByPeriod.set(period, (joinedByPeriod.get(period) ?? 0) + count);
    }
  }

  const points: MemberGrowthPoint[] = [];
  let total = before;
  for (let period = start; period <= today; period = nextPeriod(period, unit)) {
    const joined = joinedByPeriod.get(period) ?? 0;
    total += joined;
    points.push({ date: period, joined, total });
  }
  return { range, unit, total, joined: total - before, points };
}

/**
 * Members (`user` accounts; staff are left out) by the day they joined, in the viewer's time zone, over a range
 * (decision 0120). Deleted accounts aren't counted, so the history only shows members who are still here.
 */
export async function memberGrowth(range: MemberGrowthRange, timeZone: string, now = new Date()): Promise<MemberGrowth> {
  const groups: { _id: string; count: number }[] = await UserModel.aggregate([
    { $match: { role: 'user' } },
    { $group: { _id: { $dateToString: { date: '$createdAt', format: '%Y-%m-%d', timezone: timeZone } }, count: { $sum: 1 } } },
  ]);
  const joinsByDay = Object.fromEntries(groups.map((group) => [group._id, group.count]));
  return buildMemberGrowth(range, dayIn(timeZone, now), joinsByDay);
}
