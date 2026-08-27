# Data Models

This document defines the data structures and database schema for the StockTracker application.

## Core Data Models

### 1. Stock
Represents a stock listing in the market.

```
Stock {
  id: string (unique)
  ticker: string (e.g., "AAPL")
  companyName: string (e.g., "Apple Inc.")
  sector: string (e.g., "Technology")
  industry: string (e.g., "Consumer Electronics")
  description: string
  website: string
  logo: string (URL)
  country: string
  currency: string (e.g., "USD")
}
```

---

### 2. StockPrice
Real-time and historical price data.

```
StockPrice {
  id: string (unique)
  ticker: string (foreign key to Stock)
  price: number (current price)
  priceChange: number (change amount)
  priceChangePercent: number (change percentage)
  timestamp: datetime (when price was recorded)
  open: number
  high: number
  low: number
  close: number
  volume: number (trading volume)
  marketCap: number
  peRatio: number
  dividendYield: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
}
```

---

### 3. PriceHistory
Historical price data for charting.

```
PriceHistory {
  id: string (unique)
  ticker: string (foreign key to Stock)
  date: date
  open: number
  high: number
  low: number
  close: number
  volume: number
  adjustedClose: number
}
```

---

### 4. Watchlist
User's watchlist of stocks.

```
Watchlist {
  id: string (unique)
  userId: string (foreign key to User)
  ticker: string (foreign key to Stock)
  addedDate: datetime
  notes: string (optional user notes)
}
```

---

### 5. WalletHolding
Represents a current stock holding in user's wallet.

```
WalletHolding {
  id: string (unique)
  userId: string (foreign key to User)
  ticker: string (foreign key to Stock)
  quantity: number (shares owned)
  averageBuyPrice: number (weighted average purchase price)
  totalCostBasis: number (quantity × averageBuyPrice)
  createdDate: datetime (when first added)
  lastUpdatedDate: datetime
  isActive: boolean (false if fully sold)
}
```

---

### 6. Transaction
Individual buy/sell transaction for portfolio tracking.

```
Transaction {
  id: string (unique)
  userId: string (foreign key to User)
  ticker: string (foreign key to Stock)
  transactionType: enum ["BUY", "SELL"]
  quantity: number
  pricePerShare: number
  totalAmount: number (quantity × pricePerShare)
  transactionDate: date
  transactionTime: time (optional)
  currency: string (e.g., "USD")
  broker: string (optional, which broker/exchange)
  notes: string (optional user notes)
  fees: number (optional transaction fees)
  createdDate: datetime
}
```

---

### 7. SoldStock
Record of completed positions (for history and tax purposes).

```
SoldStock {
  id: string (unique)
  userId: string (foreign key to User)
  ticker: string (foreign key to Stock)
  quantity: number
  buyDate: date
  averageBuyPrice: number
  sellDate: date
  averageSellPrice: number
  totalGainLoss: number (calculated)
  gainLossPercent: number (calculated)
  holdingPeriodDays: number (calculated)
  notes: string (optional)
  createdDate: datetime
}
```

---

### 8. User
User account information.

```
User {
  id: string (unique)
  email: string (unique)
  username: string (unique)
  password: string (hashed)
  firstName: string
  lastName: string
  profilePicture: string (URL, optional)
  preferredCurrency: string (default "USD")
  theme: enum ["light", "dark"]
  createdDate: datetime
  lastLoginDate: datetime
}
```

---

## Calculated Fields

These fields are derived from other data and should be calculated on-the-fly or cached:

### On WalletHolding:
```
currentValue = quantity × currentPrice
gainLossAmount = currentValue - totalCostBasis
gainLossPercent = (gainLossAmount / totalCostBasis) × 100
```

### On SoldStock:
```
totalCostBasis = quantity × averageBuyPrice
totalSaleProceeds = quantity × averageSellPrice
totalGainLoss = totalSaleProceeds - totalCostBasis
gainLossPercent = (totalGainLoss / totalCostBasis) × 100
```

### On User/Portfolio:
```
totalPortfolioValue = SUM(currentValue of all active holdings)
totalInvested = SUM(totalCostBasis of all holdings + fees)
totalGainLoss = totalPortfolioValue - totalInvested
portfolioGainLossPercent = (totalGainLoss / totalInvested) × 100
bestPerformer = holding with highest gainLossPercent
worstPerformer = holding with lowest gainLossPercent
```

---

## Database Schema Decisions

### Firebase Realtime Database (Chosen)

**Why Firebase:**
- ✅ Real-time synchronization across all user devices
- ✅ Built-in authentication system
- ✅ No backend server needed
- ✅ Generous free tier (100 concurrent connections)
- ✅ Automatic backups
- ✅ Easy to use from vanilla JavaScript
- ✅ Scales automatically
- ✅ Offline mode with sync on reconnect

### Firebase Database Structure

```
stocktracker/
├── users/
│   └── {userId}/
│       ├── profile/
│       │   ├── email: string
│       │   ├── username: string
│       │   ├── profilePicture: string (URL)
│       │   ├── preferredCurrency: string ("USD", "EUR", etc)
│       │   ├── theme: string ("light" or "dark")
│       │   ├── createdDate: timestamp
│       │   └── lastLoginDate: timestamp
│       │
│       ├── watchlist/
│       │   └── {watchlistId}/
│       │       ├── ticker: string
│       │       ├── addedDate: timestamp
│       │       ├── notes: string (optional)
│       │       └── isActive: boolean
│       │
│       ├── holdings/
│       │   └── {holdingId}/
│       │       ├── ticker: string
│       │       ├── quantity: number
│       │       ├── averageBuyPrice: number
│       │       ├── totalCostBasis: number
│       │       ├── createdDate: timestamp
│       │       ├── lastUpdatedDate: timestamp
│       │       └── isActive: boolean
│       │
│       ├── transactions/
│       │   └── {txnId}/
│       │       ├── ticker: string
│       │       ├── transactionType: string ("BUY" or "SELL")
│       │       ├── quantity: number
│       │       ├── pricePerShare: number
│       │       ├── totalAmount: number
│       │       ├── transactionDate: date
│       │       ├── transactionTime: time (optional)
│       │       ├── currency: string
│       │       ├── broker: string (optional)
│       │       ├── notes: string (optional)
│       │       ├── fees: number (optional)
│       │       └── createdDate: timestamp
│       │
│       └── soldStocks/
│           └── {soldId}/
│               ├── ticker: string
│               ├── quantity: number
│               ├── buyDate: date
│               ├── averageBuyPrice: number
│               ├── sellDate: date
│               ├── averageSellPrice: number
│               ├── totalGainLoss: number
│               ├── gainLossPercent: number
│               ├── holdingPeriodDays: number
│               ├── notes: string (optional)
│               └── createdDate: timestamp
│
└── stocks/ (Cache/reference data - optional)
    └── {ticker}/
        ├── companyName: string
        ├── sector: string
        ├── industry: string
        ├── lastUpdated: timestamp
        └── description: string
```

### Firebase Security Rules

```json
{
  "rules": {
    "users": {
      "$uid": {
        // User can only read/write their own data
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        
        "profile": {
          ".validate": "newData.hasChildren(['email', 'username'])"
        },
        
        "watchlist": {
          "$watchlistId": {
            ".validate": "newData.hasChildren(['ticker', 'addedDate'])"
          }
        },
        
        "holdings": {
          "$holdingId": {
            ".validate": "newData.hasChildren(['ticker', 'quantity'])"
          }
        },
        
        "transactions": {
          "$txnId": {
            ".validate": "newData.hasChildren(['ticker', 'quantity', 'pricePerShare'])"
          }
        }
      }
    },
    "stocks": {
      ".read": true
    }
  }
}
```

### Advantages of This Structure
1. **Organized by user** - Each user's data isolated and protected
2. **Real-time sync** - Changes propagate to all connected clients
3. **Queryable** - Can query transactions by date, ticker, etc
4. **Scalable** - Firebase handles millions of users
5. **Secure** - Security rules prevent unauthorized access
6. **Offline support** - Data syncs when connection restored

---

### Denormalization Patterns

Since Firebase is NoSQL, some data is intentionally duplicated for performance:

1. **Ticker in multiple collections** - Holdings, transactions, watchlist all store ticker
   - Why: Allows filtering by ticker without joins
   - Alternative: Would require cross-collection queries (slower)

2. **Average buy price stored with holding** - Calculated once, stored
   - Why: Avoids recalculating from all transactions every load
   - Trade-off: Must update when new transaction added

---

### Data Validation Layer (Client-side)

```javascript
// data-validators.js

const validators = {
  validateTransaction(txn) {
    if (!txn.ticker) throw new Error('Ticker required');
    if (txn.quantity <= 0) throw new Error('Quantity must be positive');
    if (txn.pricePerShare <= 0) throw new Error('Price must be positive');
    return true;
  },
  
  validateWatchlistItem(item) {
    if (!item.ticker) throw new Error('Ticker required');
    if (!item.addedDate) throw new Error('Date required');
    return true;
  }
};
```

### Caching Strategy with Firebase

```javascript
// storage-service.js

const StorageService = {
  // Cache stock prices (5 min TTL)
  setPriceCache(ticker, price, ttl = 5 * 60 * 1000) {
    localStorage.setItem(`price_${ticker}`, JSON.stringify({
      data: price,
      expires: Date.now() + ttl
    }));
  },
  
  getPriceCache(ticker) {
    const cached = JSON.parse(localStorage.getItem(`price_${ticker}`));
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }
    localStorage.removeItem(`price_${ticker}`);
    return null;
  },
  
  // Firebase handles primary storage, localStorage is just a cache
  syncFromFirebase(userId) {
    // This pulls from Firebase and caches locally
  }
};
```

---

## Relationships Diagram

```
User
├── WalletHolding (1:N)
├── Transaction (1:N)
├── SoldStock (1:N)
└── Watchlist (1:N)

Stock (Master Data)
├── StockPrice (1:N)
├── PriceHistory (1:N)
├── WalletHolding (1:N)
├── Transaction (1:N)
├── SoldStock (1:N)
└── Watchlist (1:N)
```

---

## API Response Caching Strategy

### Cache Levels

1. **Real-time Data** (Cache: 5-15 minutes)
   - Current price
   - Market cap
   - Volume
   - Change %

2. **Company Info** (Cache: 24 hours)
   - Company name
   - Sector
   - Industry
   - Description

3. **Historical Data** (Cache: Indefinitely)
   - Daily/weekly/monthly price history
   - Only update new dates

### Implementation
```javascript
const cache = {
  // Store: ticker -> {data, timestamp}
  stockPrice: {},
  companyInfo: {},
  priceHistory: {}
}

function isCacheExpired(timestamp, maxAge) {
  return Date.now() - timestamp > maxAge;
}
```

---

## Security Considerations

1. **User Authentication**: Hash passwords with bcrypt
2. **API Keys**: Store server-side, never expose to frontend
3. **Data Privacy**: User wallet data is personal/private
4. **Rate Limiting**: Implement to prevent abuse
5. **Input Validation**: Validate all user inputs

---

## Future Enhancements

- **Portfolio Performance Tracking**: Historical snapshots
- **Dividend Tracking**: Separate dividend_transaction model
- **Stock Split Handling**: Historical adjustment records
- **Cost Basis Methods**: FIFO, LIFO, Average cost tracking
- **Tax Reporting**: Capital gains reports by year
- **Alerts**: Price alerts, rebalancing alerts
- **Benchmarks**: Compare to S&P 500, etc.
