import { describe, expect, it } from 'vitest';
import { buildMemberGrowth, dayIn, isTimeZone, rangeWindow, startOfPeriod } from './member-growth.service';

describe('member growth periods', () => {
  it('starts weeks on Monday and months on the 1st', () => {
    // 2026-10-21 is a Wednesday.
    expect(startOfPeriod('2026-10-21', 'week')).toBe('2026-10-19');
    expect(startOfPeriod('2026-10-19', 'week')).toBe('2026-10-19');
    expect(startOfPeriod('2026-10-25', 'week')).toBe('2026-10-19');
    expect(startOfPeriod('2026-10-21', 'month')).toBe('2026-10-01');
    expect(startOfPeriod('2026-10-21', 'day')).toBe('2026-10-21');
  });

  it('gives each range its grouping and first period', () => {
    expect(rangeWindow('week', '2026-10-21', undefined)).toEqual({ unit: 'day', start: '2026-10-15' });
    expect(rangeWindow('month', '2026-10-21', undefined)).toEqual({ unit: 'day', start: '2026-09-22' });
    expect(rangeWindow('quarter', '2026-10-21', undefined)).toEqual({ unit: 'week', start: '2026-07-27' });
    expect(rangeWindow('year', '2026-10-21', undefined)).toEqual({ unit: 'month', start: '2025-11-01' });
  });

  it('groups all time by how long the site has had members', () => {
    expect(rangeWindow('all', '2026-10-21', '2026-10-01').unit).toBe('day');
    expect(rangeWindow('all', '2026-10-21', '2026-01-10')).toEqual({ unit: 'week', start: '2026-01-05' });
    expect(rangeWindow('all', '2026-10-21', '2022-03-15')).toEqual({ unit: 'month', start: '2022-03-01' });
    expect(rangeWindow('all', '2026-10-21', undefined)).toEqual({ unit: 'day', start: '2026-10-21' });
  });

  it('reads the calendar day in the viewer’s time zone', () => {
    const now = new Date('2026-10-21T23:30:00Z');
    expect(dayIn('UTC', now)).toBe('2026-10-21');
    expect(dayIn('Asia/Tokyo', now)).toBe('2026-10-22');
    expect(isTimeZone('Europe/London')).toBe(true);
    expect(isTimeZone('Mars/Olympus')).toBe(false);
  });
});

describe('buildMemberGrowth', () => {
  it('runs a total from the members before the range, with every period present', () => {
    const growth = buildMemberGrowth('week', '2026-10-21', { '2026-10-01': 5, '2026-10-16': 2, '2026-10-21': 1 });
    expect(growth.unit).toBe('day');
    expect(growth.points).toHaveLength(7);
    expect(growth.points[0]).toEqual({ date: '2026-10-15', joined: 0, total: 5 });
    expect(growth.points[1]).toEqual({ date: '2026-10-16', joined: 2, total: 7 });
    expect(growth.points.at(-1)).toEqual({ date: '2026-10-21', joined: 1, total: 8 });
    expect(growth).toMatchObject({ total: 8, joined: 3 });
  });

  it('adds joins into their week or month', () => {
    const growth = buildMemberGrowth('year', '2026-10-21', { '2026-10-02': 1, '2026-10-20': 2, '2025-01-01': 4 });
    expect(growth.points).toHaveLength(12);
    expect(growth.points.at(-1)).toEqual({ date: '2026-10-01', joined: 3, total: 7 });
    expect(growth.points[0]).toEqual({ date: '2025-11-01', joined: 0, total: 4 });
  });

  it('shows one empty point for a site with no members', () => {
    expect(buildMemberGrowth('all', '2026-10-21', {})).toEqual({
      range: 'all',
      unit: 'day',
      total: 0,
      joined: 0,
      points: [{ date: '2026-10-21', joined: 0, total: 0 }],
    });
  });
});
