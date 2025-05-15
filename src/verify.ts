import { createHash } from 'crypto';
import { LogEntry } from './log.js';

export interface VerifyResult {
  valid: boolean;
  entries: number;
  firstSeq: number;
  lastSeq: number;
  error?: string;
}

export function verifyLog(entries: LogEntry[]): VerifyResult {
  if (entries.length === 0) {
    return { valid: true, entries: 0, firstSeq: 0, lastSeq: 0 };
  }

  let prevHash = '0'.repeat(64);

  for (const entry of entries) {
    if (entry.prevHash !== prevHash) {
      return {
        valid: false,
        entries: entries.length,
        firstSeq: entries[0].seq,
        lastSeq: entries[entries.length - 1].seq,
        error: `chain break at seq ${entry.seq}: prevHash mismatch`,
      };
    }

    const { hash, ...rest } = entry;
    const computed = createHash('sha256')
      .update(JSON.stringify(rest))
      .digest('hex');

    if (computed !== hash) {
      return {
        valid: false,
        entries: entries.length,
        firstSeq: entries[0].seq,
        lastSeq: entries[entries.length - 1].seq,
        error: `hash mismatch at seq ${entry.seq}`,
      };
    }

    prevHash = hash;
  }

  return {
    valid: true,
    entries: entries.length,
    firstSeq: entries[0].seq,
    lastSeq: entries[entries.length - 1].seq,
  };
}
