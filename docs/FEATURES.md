# Features Documentation

## 1. Search Page

### Overview
The Search Page serves as the main discovery and research tool where users can find and analyze any stock.

### Core Features

#### Stock Search
- **Search by Ticker**: Find stocks using ticker symbols (e.g., "AAPL")
- **Search by Company Name**: Find stocks using company name (e.g., "Apple Inc.")
- **Auto-complete/Suggestions**: Provide suggestions as user types
- **Search Filters** (Optional):
  - Market type (US, International, etc.)
  - Sector/Industry
  - Market cap range

#### Stock Data Display
- Current price
- Price change (amount and percentage)
- 52-week high/low
- Market cap
- P/E Ratio
- Dividend yield
- Volume
- Company description/overview
- Key metrics dashboard

#### Price History Charts
- Interactive chart visualization
- **Time Period Selectors**:
  - 24 hours
  - 1 week
  - 1 month
  - 1 year
  - All-time
- Candlestick or line chart options
- Zoom and pan functionality
- Hover tooltips showing exact values
- Add to comparison (compare multiple stocks)

#### Quick Actions
- **Add to Watchlist**: Save stock for monitoring
- **Add to My Wallet**: Record a purchase of this stock
- View company details
- Share stock link

---

## 2. Watchlist

### Overview
A personalized list of stocks the user is monitoring without owning them.

### Core Features

#### Watchlist Display
- Table/Card view of all watched stocks
- Columns: Ticker, Company Name, Current Price, Change ($ and %), 52w High/Low
- Sorting options: By price, by % change, alphabetically, most recently added
- Search/filter within watchlist

#### Stock Details Modal
- Open any stock from watchlist to see full details (same as Search Page)
- Price history charts with multiple timeframes
- Key metrics
- News/updates (optional)

#### Watchlist Management
- **Add to Wallet**: Convert watchlist item to owned stock
- **Remove from Watchlist**: Delete stock from watchlist
- **Set Price Alerts** (Optional Enhancement):
  - Alert when price goes above/below threshold
  - Alert when % change exceeds limit
- **Bulk Operations** (Optional Enhancement):
  - Remove multiple stocks at once
  - Create watchlist categories/folders

#### Analytics (Optional)
- Watchlist performance summary
- Total value if purchased equal amounts
- Most viewed stocks
- Stocks with biggest moves

---

## 3. My Wallet

### Overview
Track actual stock holdings with comprehensive portfolio analytics and history.

### Core Features

#### Holdings Display
- **Stock Table/Cards with**:
  - Ticker & Company Name
  - Number of shares owned
  - Average buy price
  - Current price
  - Total cost basis (shares × avg price)
  - Current value (shares × current price)
  - Gain/Loss amount ($)
  - Gain/Loss percentage (%)
  - Status indicator (up/down)

#### Color Coding
- Green for gains (positive)
- Red for losses (negative)
- Gray for break-even

#### Adding Stocks to Wallet
- Modal form with fields:
  - **Ticker/Company Name** (searchable dropdown)
  - **Date Bought** (date picker)
  - **Time Bought** (time picker - optional but useful for day traders)
  - **Quantity** (number of shares)
  - **Price Per Share** (purchase price)
  - **Currency** (USD, EUR, GBP, etc.)
  - **Broker/Notes** (optional)

#### Transaction History
- List of all buy transactions with dates and prices
- Filter/sort by date, price, quantity
- Edit past transactions (optional)
- Delete transactions (optional, with confirmation)

#### Selling Stocks
- **Mark as Sold** action on any holding
- Sell Modal with fields:
  - **Date Sold** (date picker)
  - **Time Sold** (time picker)
  - **Quantity Sold** (can be partial or full)
  - **Price Per Share** (selling price)
  - **Currency**
  - **Broker/Notes** (optional)
  - Automatically calculates gain/loss

#### Sold Stocks Section
- Separate tab/view for completed positions
- Shows: Original buy date/price, sell date/price, quantity, gain/loss amount, gain/loss %
- Historical performance review
- Filter/sort options

#### Portfolio Summary & Analytics
- **Total Portfolio Value**: Sum of all current holdings
- **Total Invested**: Sum of all capital invested
- **Total Gain/Loss**: Dollar amount and percentage
- **Best Performing Stock**: Highest gain%
- **Worst Performing Stock**: Lowest gain%
- **Diversification**: Pie chart showing asset allocation
- **Performance Over Time** (Optional):
  - Portfolio value over time graph
  - Monthly/yearly returns
  - Compare to market index (S&P 500, etc.)

#### Additional Features (Optional Enhancements)
- **Cost Basis Tracking**: Different methods (FIFO, LIFO, average cost)
- **Dividend Tracking**: Record received dividends
- **Stock Split Handling**: Adjust shares and prices for stock splits
- **Export Portfolio**: CSV/PDF export
- **Tax Reports** (Optional): Capital gains summary for tax season
- **Rebalancing Suggestions**: Alerts when allocation drifts

---

## Additional Considerations

### Data Requirements
- Real-time stock prices
- Historical price data
- Company information
- Market data (volume, market cap, etc.)

### User Experience Enhancements
- **Dark Mode**: Support light/dark theme
- **Responsive Design**: Mobile, tablet, desktop views
- **Notifications**: Price alerts, portfolio milestones
- **Search History**: Remember recent searches
- **Favorites**: Quick access to frequently viewed stocks
- **Performance Metrics**: Returns, sharpe ratio, etc.

### Data Persistence
- User authentication and accounts
- Local storage or cloud database for watchlist and wallet data
- Sync across devices

### Performance Considerations
- Cache stock data to reduce API calls
- Lazy load charts and data
- Optimize large portfolio displays

---

## Feature Priority (MVP vs. Future)

### MVP (Minimum Viable Product)
- ✅ Search page with basic stock data
- ✅ Price history charts (4 timeframes)
- ✅ Watchlist (add/remove)
- ✅ My Wallet (add/remove stocks)
- ✅ Basic gain/loss calculations
- ✅ Sold stocks tracking

### Phase 2 (Nice to Have)
- Portfolio analytics and charts
- Price alerts
- Export functionality
- Dividend tracking
- Dark mode

### Phase 3+ (Future Enhancements)
- Mobile app
- Social features
- Advanced analytics
- Tax reporting
- Multi-account support
