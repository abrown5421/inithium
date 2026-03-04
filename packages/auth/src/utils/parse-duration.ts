import type { SignOptions } from 'jsonwebtoken';
const UNIT_TO_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export function parseDuration(value: SignOptions['expiresIn']): number {
  if (value == null) {
    throw new Error('Duration is required');
  }

  if (typeof value === 'number') {
    return value * 1000;
  }

  const trimmed = value.trim();
  const match = /^(\d+)\s*(ms|s|m|h|d)$/i.exec(trimmed);

  if (!match) {
    throw new Error(`Invalid duration: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const unitMs = UNIT_TO_MS[unit];

  if (!Number.isFinite(amount) || amount <= 0 || !unitMs) {
    throw new Error(`Invalid duration: ${value}`);
  }

  return amount * unitMs;
}