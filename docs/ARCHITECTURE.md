# Technical Architecture

## System Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│              Frontend (Vanilla HTML/CSS/JS)                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Search Page  │  Watchlist  │  My Wallet  │  Settings  │  │
│  └────────────────────────────────────────────────────────┘  │
│              ↓ (jQuery Event Handlers)                        │
├──────────────────────────────────────────────────────────────┤
│                    API Service Layer                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Finnhub Client  │  Firebase Service  │  DOM Manager   │  │
│  └────────────────────────────────────────────────────────┘  │
│          ↓                          ↓                         │
│    ┌──────────────────┐    ┌─────────────────────┐           │
│    │  Finnhub API     │    │  Firebase Realtime  │           │
│    │  (Stock Data)    │    │  Database + Auth    │           │
│    └──────────────────┘    └─────────────────────┘           │
└──────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack

#### Vanilla JavaScript with jQuery
```
Core Technologies:
- HTML5 (semantic markup)
- CSS3 (responsive design, animations)
- Vanilla JavaScript (ES6+)
- jQuery (DOM manipulation, AJAX)

Libraries:
- Chart.js (data visualization)
- Firebase SDK (authentication & database)
- Bootstrap or custom CSS (responsive layout)
- Moment.js (date/time handling - optional)
```

### Why Vanilla JS + jQuery?
- **No build step required** - Direct file imports
- **Easy to understand** - Clear, readable code
- **jQuery simplifies** - DOM manipulation, AJAX calls, event handling
- **Lightweight** - Fast loading
- **Direct Firebase integration** - Real-time database updates
- **No dependency management overhead** - Just include script tags

### Key Advantages
✅ Simple deployment (just HTML/CSS/JS files)  
✅ Easier debugging (see exactly what's running)  
✅ Lower learning curve  
✅ Works on older browsers  
✅ Smaller bundle size  
✅ Firebase handles complex operations  

---

## Project Structure (Vanilla JS)

```
stock-tracker/
├── index.html (main page with navigation)
├── pages/
│   ├── search.html (Search page)
│   ├── watchlist.html (Watchlist page)
│   ├── wallet.html (My Wallet page)
│   └── settings.html (Settings - optional)
│
├── css/
│   ├── style.css (main styles)
│   ├── responsive.css (mobile/tablet)
│   ├── components.css (button, modal, card styles)
│   └── dark-mode.css (dark theme)
│
├── js/
│   ├── app.js (main app initialization)
│   ├── config.js (API keys, Firebase config)
│   ├── firebase-service.js (Firebase operations)
│   ├── finnhub-api.js (Finnhub API client)
│   ├── storage-service.js (Data caching)
│   ├── dom-utils.js (DOM manipulation helpers)
│   ├── formatting.js (Format prices, dates, etc)
│   │
│   ├── pages/
│   │   ├── search.js (Search page logic)
│   │   ├── watchlist.js (Watchlist logic)
│   │   ├── wallet.js (Wallet logic)
│   │   └── settings.js (Settings logic)
│   │
│   └── components/
│       ├── stock-card.js (Stock card component)
│       ├── price-chart.js (Chart rendering)
│       ├── modals.js (Modal handling)
│       ├── notifications.js (Toast messages)
│       └── forms.js (Form validation & handling)
│
├── lib/ (External libraries)
│   ├── jquery.min.js
│   ├── chart.js
│   ├── firebase-app.js
│   ├── firebase-auth.js
│   ├── firebase-database.js
│   └── bootstrap.min.css (optional)
│
├── images/ (logos, icons)
├── .env.example (configuration template)
├── .gitignore
├── firebase.json (Firebase config)
└── README.md
```

---

---

## Data Flow

### Search Flow (Vanilla JS)
```
User Types Query in Search Box
    ↓
jQuery Event: .on('input', function() { ... })
    ↓
Debounce search (300ms)
    ↓
finnhubApi.search(query)
    ↓
Check local cache (storageService.get())
    ├─ Cache Hit (< 15 min) → Return cached data
    └─ Cache Miss → Fetch from Finnhub API → Cache & Return
    ↓
storageService.set(key, data, 15 * 60 * 1000) [cache with TTL]
    ↓
jQuery: $('#searchResults').html(renderResults(data))
    ↓
Display results in DOM + Add click handlers
```

### Add to Watchlist Flow (Firebase)
```
User clicks "Add to Watchlist" button
    ↓
jQuery event handler: $(element).on('click', function() { ... })
    ↓
firebaseService.addToWatchlist(userId, ticker)
    ↓
firebase.database().ref('users/' + userId + '/watchlist').push({
  ticker: ticker,
  addedDate: new Date().toISOString(),
  notes: notes
})
    ↓
Firebase triggers real-time listener
    ↓
firebaseService.onWatchlistChange() callback updates DOM
    ↓
Show success toast notification via jQuery
```

### Portfolio Value Calculation Flow
```
User visits Wallet page
    ↓
firebaseService.loadWalletHoldings(userId)
    ↓
firebase.database().ref('users/' + userId + '/holdings').on('value', ...)
    ↓
For each holding: 
  ├─ Get current price via finnhubApi.getQuote(ticker)
  ├─ Check cache (5 min TTL)
  └─ Calculate: currentValue, gainLoss, gainLossPercent
    ↓
Calculate portfolio totals:
  - totalValue = SUM(currentValue)
  - totalInvested = SUM(costBasis)
  - totalGainLoss = totalValue - totalInvested
    ↓
Render Wallet page via jQuery DOM updates
    ↓
Display with color coding (green/red) and real-time updates
```

---

## State Management (Client-side)

### Global State Pattern (Vanilla JS)

```javascript
// app-state.js - Simple global state object
const AppState = {
  user: {
    id: null,
    email: null,
    isAuthenticated: false
  },
  search: {
    query: '',
    results: [],
    selectedStock: null,
    loading: false,
    error: null
  },
  watchlist: {
    items: [],
    loading: false,
    error: null
  },
  wallet: {
    holdings: [],
    transactions: [],
    soldStocks: [],
    loading: false,
    error: null
  },
  ui: {
    theme: 'light',
    modalsOpen: {
      addToWallet: false,
      sellStock: false,
      stockDetails: false
    }
  }
};

// Methods to update state
const updateState = (path, value) => {
  // Deep set in object by path (e.g., 'search.query')
  setNestedValue(AppState, path, value);
  renderUI(); // Re-render affected areas
};
```

**Why this approach?**
- Simple and transparent
- Easy to debug
- Firebase handles real-time sync (no Redux needed)
- Components pull from AppState as needed

---

## API Integration

### Finnhub API Calls Needed

```typescript
// Search stocks
GET /api/search?q=apple

// Get quote data
GET /api/quote?symbol=AAPL

// Get company profile
GET /api/company-profile2?symbol=AAPL

// Get historical data (daily)
GET /api/quote?symbol=AAPL (includes current)
// For historical, use daily/weekly candles

// Get market data
GET /api/stock/candle?symbol=AAPL&resolution=D&from=X&to=Y

// Get news
GET /api/company-news?symbol=AAPL&from=2024-01-01&to=2024-12-31
```

### Implementation
```typescript
// services/stockApi.ts
class StockApiClient {
  private apiKey = process.env.REACT_APP_FINNHUB_KEY
  private baseUrl = 'https://finnhub.io/api/v1'
  private cache = new Map()

  async searchStocks(query: string): Promise<Stock[]> {
    // API call to search
  }

  async getQuote(ticker: string): Promise<StockPrice> {
    // Check cache
    // If cached and fresh, return
    // Otherwise fetch and cache
  }

  async getPriceHistory(ticker: string, timeframe: string): Promise<PriceHistory[]> {
    // Fetch historical candles
  }
}
```

---

## Data Persistence Layer

### Firebase Realtime Database
```
Advantages for this project:
✅ Real-time synchronization across devices
✅ Built-in user authentication
✅ Free tier with generous limits
✅ No backend server needed
✅ Automatic backups
✅ Offline support with sync on reconnect
✅ Security rules to protect user data
✅ Easy to scale

Structure:
```
firebase/
  users/
    {userId}/
      profile/
        email, username, preferences
      watchlist/
        {watchlistId}: { ticker, addedDate, notes }
      holdings/
        {holdingId}: { ticker, quantity, avgPrice, ... }
      transactions/
        {txnId}: { ticker, date, qty, price, type, ... }
      soldStocks/
        {soldId}: { ticker, buyDate, sellDate, gain, ... }
```

### Caching Strategy

```javascript
// Local browser cache with Firebase backup
const CacheManager = {
  // Short-term cache (stock prices: 5 min TTL)
  priceCache: {},
  
  // Medium-term cache (company info: 24h TTL)
  companyCache: {},
  
  // IndexedDB for offline support
  offlineDB: null,
  
  set(key, value, ttlMs) {
    this.priceCache[key] = {
      data: value,
      expires: Date.now() + ttlMs
    };
  },
  
  get(key) {
    const cached = this.priceCache[key];
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }
    return null;
  }
};
```

### Firebase Setup (config.js)

```javascript
// config.js
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "stocktracker-xxx.firebaseapp.com",
  databaseURL: "https://stocktracker-xxx.firebaseio.com",
  projectId: "stocktracker-xxx",
  storageBucket: "stocktracker-xxx.appspot.com",
  messagingSenderId: "xxx",
  appId: "xxx"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references
const auth = firebase.auth();
const database = firebase.database();

module.exports = { auth, database };
```

### Security Rules

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "watchlist": {
          "$watchlistId": {
            ".validate": "newData.hasChildren(['ticker', 'addedDate'])"
          }
        },
        "holdings": {
          "$holdingId": {
            ".validate": "newData.hasChildren(['ticker', 'quantity'])"
          }
        }
      }
    }
  }
}
```

---

## External Dependencies

### Core Libraries (via CDN or npm)
```html
<!-- HTML includes -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js"></script>
```

### npm Dependencies (if using bundler)
```json
{
  "jquery": "^3.6.0",
  "chart.js": "^4.0.0",
  "firebase": "^10.0.0",
  "moment": "^2.29.4"
}
```

### Optional Utility Libraries
```
- Lodash (utility functions)
- Axios (HTTP requests - alternative to jQuery.ajax)
- Toastr (notifications)
- Popper.js (tooltips)
- SweetAlert2 (better modals)
```

---

## Development Workflow

### Phase 1: Setup & Foundation (Vanilla JS)
1. Create project folder structure
2. Create index.html with basic layout
3. Link external libraries (jQuery, Chart.js, Firebase)
4. Create CSS stylesheets
5. Setup Firebase project and get config
6. Create app.js initialization
7. Setup .env file for configuration

### Phase 2: Core Services
1. Create firebase-service.js (auth, CRUD operations)
2. Create finnhub-api.js (API client)
3. Create storage-service.js (caching)
4. Create dom-utils.js (helpers)
5. Create formatting.js (utilities)

### Phase 3: Search Page
1. Build search.html structure
2. Create search.js event handlers
3. Implement search-as-you-type with jQuery
4. Create stock-card.js component
5. Create price-chart.js (Chart.js integration)
6. Add add-to-watchlist/wallet buttons

### Phase 4: Watchlist
1. Build watchlist.html
2. Create watchlist.js logic
3. Setup real-time Firebase listeners
4. Implement jQuery event handlers (add/remove/view)
5. Create watchlist modal for details

### Phase 5: Wallet
1. Build wallet.html
2. Create wallet.js logic
3. Implement transaction forms
4. Create calculations module
5. Setup sold stocks section
6. Create modals for add/sell

### Phase 6: Polish & Deploy
1. Test all features
2. Mobile responsiveness
3. Error handling
4. Firebase deployment
5. Custom domain (optional)

---

## Testing Strategy

### Manual Testing (No test framework needed initially)
- Test each page in browser (Chrome, Firefox, Safari)
- Test on mobile devices (iPhone, Android)
- Test Firebase sync (multiple windows)
- Test offline mode

### jQuery-based Testing (Optional)
```javascript
// Simple manual test
function testSearchApi() {
  finnhubApi.search('AAPL').then(results => {
    console.log('Search results:', results);
    assert(results.length > 0, 'Results should not be empty');
  });
}
```

### Console Debugging
- Use browser console for testing functions
- Check network tab for API calls
- Monitor Firebase in Firebase console
- Use debugger statements

---

## Deployment

### Firebase Hosting (Recommended)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init

# Deploy
firebase deploy
```

**Advantages:**
- ✅ Integrated with Firebase backend
- ✅ Free tier with generous limits
- ✅ Automatic HTTPS
- ✅ CDN distribution
- ✅ Version history and rollback
- ✅ Environment management

### Alternative Hosting Options
1. **Vercel** - Static site hosting, free tier
2. **Netlify** - Similar to Vercel, easy setup
3. **GitHub Pages** - Free, good for portfolio
4. **AWS S3** - Good for scalability
5. **Any static web server** - Works with simple HTML/CSS/JS

### Pre-deployment Checklist
- [ ] Firebase project created and configured
- [ ] All API keys in .env file
- [ ] Build/minify assets (optional for vanilla JS)
- [ ] Test all features locally
- [ ] Security rules configured in Firebase
- [ ] Domain configured (optional)
- [ ] Analytics enabled (optional)

### Production Checklist
- [ ] Environment variables set correctly
- [ ] Firebase console monitoring setup
- [ ] Error logging enabled
- [ ] Performance monitoring enabled
- [ ] Backup strategy in place

---

## Backend Architecture (Firebase-based)

### Firebase Services Used
1. **Authentication** - User login/signup
2. **Realtime Database** - Data storage
3. **Hosting** - Static file serving
4. **Security Rules** - Data protection

### No Backend Server Needed
- Firebase handles all CRUD operations
- Real-time sync with all clients
- Scalable without additional infrastructure
- Pay-as-you-go pricing

### Alternative: Add Node.js Backend (Later)
If needed for complex operations:
- Express.js server
- Acts as middleware between app and APIs
- Handles rate limiting and caching
- Could add user-specific algorithms

---

## Architecture Benefits

**Vanilla JS + Firebase:**
- ✅ No build process (quick development)
- ✅ Transparent code (easy to debug)
- ✅ Real-time data (Firebase handles sync)
- ✅ Scalable (Firebase scales automatically)
- ✅ Cost-effective (free tier available)
- ✅ Easy to deploy (just HTML/CSS/JS)
- ✅ Works on any device/browser
- ✅ No dependency management headaches

---
