# order-log

Public append-only log of every order the Noir matching engine processes.

Every order the engine sees, in the exact sequence it saw them, is written here. You don't have to believe the matching was fair — you can replay it and prove it.

## Structure

Each entry is a JSON line:

```json
{
  "seq": 1042,
  "type": "trade",
  "payload": { "asset": "AAPL/USD", "price": 195.50, "size": 60, ... },
  "prevHash": "a3f9...",
  "hash": "b7c2...",
  "timestamp": 1719878400000
}
```

The `hash` of each entry is `sha256(entry without hash field)`. The `prevHash` chains entries together. Any tampering breaks the chain.

## Verify

```typescript
import { OrderLog, verifyLog } from '@noirprotocol/order-log';

const log = new OrderLog('./noir.log');
const entries = log.read();
const result = verifyLog(entries);

console.log(result);
// { valid: true, entries: 10482, firstSeq: 0, lastSeq: 10481 }
```

## License

MIT
