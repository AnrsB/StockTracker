# User Stories & Requirements

## User Personas

### Persona 1: Casual Investor
- **Name**: Sarah
- **Profile**: Beginner investor, tracks 5-10 stocks
- **Needs**: Simple interface, watchlist to monitor interests, easy portfolio tracking
- **Pain Points**: Doesn't want complex features, wants quick overview
- **Tech Savvy**: Medium

### Persona 2: Active Trader
- **Name**: Mike
- **Profile**: Day/swing trader, tracks 50+ stocks
- **Needs**: Real-time data, detailed analytics, price alerts, historical analysis
- **Pain Points**: Needs accurate data, doesn't want to pay for pro versions
- **Tech Savvy**: High

### Persona 3: Long-term Investor
- **Name**: Jessica
- **Profile**: Buy-and-hold investor, tracks 15-30 stocks
- **Needs**: Portfolio performance, tax-friendly gain/loss tracking, historical records
- **Pain Points**: Wants to see ROI, understand portfolio allocation
- **Tech Savvy**: Medium

---

## User Stories

### Search Page Features

#### US-1: Search for a Stock by Ticker
**As a** user  
**I want to** search for a stock using its ticker symbol (e.g., "AAPL")  
**So that** I can quickly find stocks I'm interested in

**Acceptance Criteria:**
- [ ] Search box accepts ticker input
- [ ] Results show matching stocks
- [ ] Can see company name, sector, current price
- [ ] Search is case-insensitive
- [ ] Results appear within 1 second

**Additional Notes:**
- Debounce search after 300ms of user input
- Show "no results" message if no matches
- Prioritize exact matches over partial matches

---

#### US-2: Search for a Stock by Company Name
**As a** user  
**I want to** search for a stock using company name (e.g., "Apple")  
**So that** I can find stocks when I don't know the ticker

**Acceptance Criteria:**
- [ ] Search box accepts company name input
- [ ] Results show matching companies
- [ ] Results include ticker, sector, price
- [ ] Partial matches are supported
- [ ] Most relevant results appear first

**Additional Notes:**
- Return top 10 results
- Highlight search term in results
- Show company logo if available

---

#### US-3: View Stock Details
**As a** user  
**I want to** view detailed information about a stock  
**So that** I can make informed decisions about adding it to my watchlist/wallet

**Acceptance Criteria:**
- [ ] Can click on a stock to open details modal
- [ ] Details include: name, ticker, current price, 52w high/low
- [ ] Display market cap, P/E ratio, volume, dividend yield
- [ ] Show company description
- [ ] Display trading status (open/closed)
- [ ] Modal can be closed by clicking X or outside modal

**Additional Notes:**
- Data refreshes every 15 minutes
- Handle market hours vs after-hours displays
- Show data source attribution

---

#### US-4: View Price History Chart
**As a** user  
**I want to** view price history in a chart with multiple time periods  
**So that** I can see trends and make better investment decisions

**Acceptance Criteria:**
- [ ] Chart displays with default 1-month view
- [ ] Can select: 24h, 1w, 1m, 1y, all-time
- [ ] Chart updates smoothly when changing timeframe
- [ ] Can see exact prices on hover
- [ ] X-axis shows dates, Y-axis shows prices
- [ ] Chart is responsive and readable

**Additional Notes:**
- Use candlestick chart option
- Show volume bars below chart
- Add loading indicator while fetching data
- Cache historical data locally

---

#### US-5: Add Stock to Watchlist
**As a** user  
**I want to** add a stock to my watchlist  
**So that** I can monitor stocks without owning them

**Acceptance Criteria:**
- [ ] "Add to Watchlist" button visible on stock details
- [ ] Clicking button shows success confirmation
- [ ] Stock appears in Watchlist page immediately
- [ ] Duplicate adds are prevented (hide button if already watching)
- [ ] Can add from search or details view

**Additional Notes:**
- Show toast notification on success
- Add optional notes/reminder field
- No page refresh needed

---

#### US-6: Add Stock to Wallet
**As a** user  
**I want to** add a stock to my wallet to track my purchase  
**So that** I can monitor my investments and calculate gains/losses

**Acceptance Criteria:**
- [ ] "Add to Wallet" button visible on stock details
- [ ] Clicking opens modal with form
- [ ] Form requires: date, time, quantity, price, currency
- [ ] All fields must be filled (validation)
- [ ] Stock is added to wallet after form submission
- [ ] Confirm success with toast

**Additional Notes:**
- Date picker should default to today
- Time picker should be optional but recommended
- Show current market price as reference
- Allow multiple buys of same stock

---

### Watchlist Features

#### US-7: View Watchlist
**As a** user  
**I want to** see a list of all stocks I'm watching  
**So that** I can monitor my interests in one place

**Acceptance Criteria:**
- [ ] Watchlist page shows all watched stocks
- [ ] Display: ticker, company name, current price, change, date added
- [ ] View updates every 15 minutes
- [ ] Can switch between table and card view
- [ ] Empty state message if no stocks watched

**Additional Notes:**
- Show time of last price update
- Indicate if market is open/closed
- Add "Start watching stocks" prompt when empty

---

#### US-8: Sort and Filter Watchlist
**As a** user  
**I want to** sort and filter my watchlist  
**So that** I can find specific stocks quickly

**Acceptance Criteria:**
- [ ] Can sort by: price, % change, alphabetical, date added
- [ ] Ascending/descending toggle
- [ ] Can filter by sector (if data available)
- [ ] Search/filter input for quick lookup
- [ ] Sorting preference persists

**Additional Notes:**
- Default sort: most recently added
- Show sort indicator (↑ or ↓)
- Consider performance with large lists

---

#### US-9: View Stock Details from Watchlist
**As a** user  
**I want to** click on a watchlist stock to see full details  
**So that** I can analyze before deciding to invest

**Acceptance Criteria:**
- [ ] Clicking stock opens details modal (same as search)
- [ ] Modal shows all stock information and charts
- [ ] Can add to wallet from modal
- [ ] Modal closes with X button or click outside

**Additional Notes:**
- Reuse stock details component
- Maintain watchlist in background

---

#### US-10: Remove Stock from Watchlist
**As a** user  
**I want to** remove a stock from my watchlist  
**So that** I can keep only relevant stocks

**Acceptance Criteria:**
- [ ] "Remove" button on each watchlist item
- [ ] Confirmation dialog appears before removal
- [ ] Stock is removed immediately after confirmation
- [ ] Toast confirms removal
- [ ] Undo option (30 seconds) (optional)

**Additional Notes:**
- Show confirmation message
- Option to add back if accidentally removed

---

#### US-11: Add to Wallet from Watchlist
**As a** user  
**I want to** add a watched stock to my wallet directly  
**So that** I don't have to search for it again

**Acceptance Criteria:**
- [ ] "Add to Wallet" button on each watchlist item
- [ ] Opens add transaction modal
- [ ] Stock ticker is pre-filled
- [ ] Form requires purchase details (date, quantity, price)
- [ ] Can add and stay on watchlist or add and remove from watchlist

**Additional Notes:**
- Current price shown as reference
- Ask if user wants to remove from watchlist after adding to wallet

---

### My Wallet Features

#### US-12: View My Holdings
**As a** user  
**I want to** see all stocks I own with current values  
**So that** I can track my portfolio performance

**Acceptance Criteria:**
- [ ] Holdings page shows all active stocks owned
- [ ] Display: ticker, company, quantity, avg buy price, current price
- [ ] Show total cost basis and current value
- [ ] Show gain/loss ($) and gain/loss (%)
- [ ] Color code: green for gains, red for losses
- [ ] Last update time displayed
- [ ] Empty state if no holdings

**Additional Notes:**
- Sort by largest holding by default
- Sum totals at top or bottom
- Real-time price updates every 5 minutes

---

#### US-13: Add Stock Purchase
**As a** user  
**I want to** record a stock purchase  
**So that** I can track my investment basis and returns

**Acceptance Criteria:**
- [ ] Click "Add Stock" or "Buy Stock" button
- [ ] Modal form with fields:
  - Stock search/dropdown
  - Date bought (date picker)
  - Time bought (time picker, optional)
  - Quantity
  - Price per share
  - Currency (USD, EUR, etc.)
  - Notes/broker (optional)
- [ ] All required fields validated
- [ ] Stock added after submission
- [ ] Can add multiple purchases of same stock
- [ ] Success confirmation

**Additional Notes:**
- Current market price shown for reference
- Date defaults to today
- Currency field defaults to USD
- Allow decimal quantities (fractional shares)

---

#### US-14: View Transaction History
**As a** user  
**I want to** see all my past buy transactions  
**So that** I can verify purchase prices and dates

**Acceptance Criteria:**
- [ ] Expandable section showing transaction history
- [ ] Display: date, time, quantity, price, total cost
- [ ] Can sort by date (newest first)
- [ ] Can filter by stock
- [ ] Hover shows full details (optional)
- [ ] Can delete transaction (with confirmation)

**Additional Notes:**
- Total cost calculated: quantity × price
- Show running average price
- Allow editing transactions (optional)

---

#### US-15: Sell Stock (Partial or Full)
**As a** user  
**I want to** record a stock sale  
**So that** I can track gains/losses and complete positions

**Acceptance Criteria:**
- [ ] "Sell" button on each holding
- [ ] Modal form with fields:
  - Quantity to sell
  - Date sold
  - Time sold
  - Price per share
  - Currency
  - Notes/broker (optional)
- [ ] Quantity validation (can't exceed owned amount)
- [ ] Calculate gain/loss at sale
- [ ] Move to "Sold Stocks" section
- [ ] Update portfolio totals

**Additional Notes:**
- Show current market price as reference
- Calculate % gain/loss for user info
- If partial sale, update holding quantity
- If full sale, move to sold stocks

---

#### US-16: View Sold Stocks History
**As a** user  
**I want to** see all stocks I've sold  
**So that** I can review my investment performance

**Acceptance Criteria:**
- [ ] Separate "Sold Stocks" tab/section
- [ ] Display: ticker, quantity, buy date, sell date, cost basis
- [ ] Show gain/loss ($), gain/loss (%), holding period
- [ ] Sort by date sold (newest first)
- [ ] Can search/filter sold stocks
- [ ] Shows total gained/lost across all sales

**Additional Notes:**
- Color code: green for gains, red for losses
- Calculate holding period in days
- Allow filtering by year (for tax purposes)
- Show transaction details on hover

---

#### US-17: View Portfolio Summary
**As a** user  
**I want to** see an overview of my entire portfolio  
**So that** I can understand my overall investment performance

**Acceptance Criteria:**
- [ ] Summary dashboard at top of Wallet page
- [ ] Display:
  - Total portfolio value (sum of all holdings current value)
  - Total invested (sum of all cost basis)
  - Total gain/loss amount
  - Total gain/loss percentage
- [ ] Best performing stock
- [ ] Worst performing stock
- [ ] Update when prices change
- [ ] Color coded gain/loss

**Additional Notes:**
- Show pie chart of asset allocation (optional)
- Add performance chart over time (optional)
- Show diversification metrics (optional)

---

#### US-18: View Asset Allocation
**As a** user  
**I want to** see how my portfolio is allocated  
**So that** I can ensure proper diversification

**Acceptance Criteria:**
- [ ] Pie chart showing % of each stock in portfolio
- [ ] Legend showing ticker and % allocation
- [ ] Update when holdings change
- [ ] Click on segment to see details (optional)
- [ ] Color-coded by sector (optional)

**Additional Notes:**
- Show top holdings (e.g., top 5)
- Collapse small holdings into "Other"
- Allow view by company or sector

---

### General Features

#### US-19: Data Persistence
**As a** user  
**I want to** have my data saved automatically  
**So that** I don't lose my watchlist or portfolio when I close the browser

**Acceptance Criteria:**
- [ ] Watchlist data persists across sessions
- [ ] Wallet/transaction data persists
- [ ] Data syncs if using multiple browsers (future)
- [ ] Clear data option in settings (optional)

**Additional Notes:**
- Use LocalStorage initially
- Plan for cloud sync in future
- Regular backup notifications (optional)

---

#### US-20: Error Handling
**As a** user  
**I want to** see clear error messages  
**So that** I understand what went wrong

**Acceptance Criteria:**
- [ ] API errors show user-friendly messages
- [ ] Network errors are handled gracefully
- [ ] Form validation errors are clear
- [ ] No blank error states
- [ ] Suggestions for fixing common issues

**Additional Notes:**
- Retry option for failed API calls
- Error boundary catches crashes
- Detailed errors in console for debugging

---

#### US-21: Responsive Design
**As a** mobile user  
**I want to** use the app on my phone  
**So that** I can check my portfolio on the go

**Acceptance Criteria:**
- [ ] App works on mobile screens (375px+)
- [ ] Touch-friendly buttons and inputs
- [ ] Navigation works on mobile
- [ ] Charts readable on small screens
- [ ] Tables convertible to card view on mobile

**Additional Notes:**
- Test on common devices (iPhone, Android)
- Consider mobile-first design
- Future: native mobile app

---

## Feature Requirements Summary

### MVP Requirements (Phase 1-4)
| Feature | Search | Watchlist | Wallet |
|---------|--------|-----------|--------|
| View stocks | ✅ | ✅ | ✅ |
| Search function | ✅ | ❌ | ❌ |
| Price history chart | ✅ | ⚠️ | ❌ |
| Stock details modal | ✅ | ✅ | ✅ |
| Add/remove | ✅ | ✅ | ✅ |
| Buy transactions | ❌ | ❌ | ✅ |
| Sell transactions | ❌ | ❌ | ✅ |
| Gain/loss calculations | ❌ | ❌ | ✅ |
| Portfolio analytics | ❌ | ❌ | ✅ |

✅ = Included | ⚠️ = Limited | ❌ = Not included

### Phase 2 Enhancements
- Price alerts/notifications
- Export data (CSV/PDF)
- Dark mode
- Advanced charts
- Dividend tracking

---

## Acceptance Criteria Checklist

### Each Feature Must Have
- [ ] Clear user story written
- [ ] Acceptance criteria defined
- [ ] Edge cases considered
- [ ] Error cases handled
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] Tests written
- [ ] Documentation updated

