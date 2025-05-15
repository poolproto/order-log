import { createHash } from 'crypto';
import { appendFileSync, readFileSync, existsSync } from 'fs';

export interface LogEntry {
  seq: number;
  type: 'order' | 'trade' | 'cancel';
  payload: unknown;
  hash: string;
  prevHash: string;
  timestamp: number;
}

export class OrderLog {
  private seq = 0;
  private lastHash = '0'.repeat(64);

  constructor(private readonly path: string) {
    if (existsSync(path)) {
      const lines = readFileSync(path, 'utf8').trim().split('\n').filter(Boolean);
      if (lines.length > 0) {
        const last: LogEntry = JSON.parse(lines[lines.length - 1]);
        this.seq = last.seq + 1;
        this.lastHash = last.hash;
      }
    }
  }

  append(type: LogEntry['type'], payload: unknown): LogEntry {
    const entry: Omit<LogEntry, 'hash'> = {
      seq: this.seq++,
      type,
      payload,
      prevHash: this.lastHash,
      timestamp: Date.now(),
    };
    const hash = createHash('sha256')
      .update(JSON.stringify(entry))
      .digest('hex');
    const full: LogEntry = { ...entry, hash };
    appendFileSync(this.path, JSON.stringify(full) + '\n', 'utf8');
    this.lastHash = hash;
    return full;
  }

  read(): LogEntry[] {
    if (!existsSync(this.path)) return [];
    return readFileSync(this.path, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(l => JSON.parse(l) as LogEntry);
  }
}
