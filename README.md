# order-log

Public append-only log of every order the Pool matching engine processes — book fills and pool fills alike.

Every order the engine sees, in the exact sequence it saw them, is written here. The log captures both direct book matches and Uniswap v4 pool routing events, so you get full transparency on how each order was filled. You don't have to believe the matching was fair — you can replay it and prove it.

## Structure

Each entry is a JSON line:

```json
{
  "seq": 1042,
  "type": "trade",
  "fillType": "book",
  "payload": { "asset": "AAPL/USD", "price": 195.50, "size": 60, ... },
  "prevHash": "a3f9...",
  "hash": "b7c2...",
  "timestamp": 1719878400000
}
```

```json
{
  "seq": 1043,
  "type": "trade",
  "fillType": "pool",
  "payload": { "asset": "AAPL/USD", "price": 195.48, "size": 40, "pool": "v4", ... },
  "prevHash": "b7c2...",
  "hash": "d1e5...",
  "timestamp": 1719878400001
}
```

The `fillType` field indicates whether the fill came from a resting limit order on the book (`"book"`) or from the Uniswap v4 pool on Robinhood Chain (`"pool"`).

The `hash` of each entry is `sha256(entry without hash field)`. The `prevHash` chains entries together. Any tampering breaks the chain.

## Verify

```typescript
import { OrderLog, verifyLog } from '@poolprotocol/order-log';

const log = new OrderLog('./pool.log');
const entries = log.read();
const result = verifyLog(entries);

console.log(result);
// { valid: true, entries: 10482, firstSeq: 0, lastSeq: 10481 }
```

## License

MIT