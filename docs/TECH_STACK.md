# Technology Stack

## Overview

StockTracker is built with a simple, lightweight technology stack:
- **Frontend**: Vanilla HTML, CSS, JavaScript + jQuery
- **Database**: Firebase Realtime Database
- **API**: Finnhub (stock market data)
- **Charting**: Chart.js
- **Hosting**: Firebase Hosting

---

## Frontend

### Core Technologies

#### HTML5
- Semantic markup
- Form elements
- Modal templates
- Responsive meta viewport
- No JSX, templating, or transpilation

#### CSS3
- Responsive design (mobile-first)
- Flexbox and Grid layouts
- CSS custom properties (variables)
- Media queries for breakpoints
- Organized into separate files:
  - `style.css` - Main styles
  - `responsive.css` - Mobile/tablet rules
  - `components.css` - Reusable component styles
  - `dark-mode.css` - Dark theme

#### Vanilla JavaScript (ES6+)
- No build process required
- Direct browser execution
- Modular code structure
- Arrow functions, const/let, template literals
- Async/await for asynchronous operations
- Fetch API or jQuery AJAX for HTTP requests

**File Organization:**
```
js/
├── app.js (main initialization)
├── config.js (configuration)
├── firebase-service.js (Firebase operations)
├── finnhub-api.js (Finnhub API client)
├── storage-service.js (caching layer)
├── dom-utils.js (DOM helpers)
├── formatting.js (utilities)
├── pages/
│   ├── search.js
│   ├── watchlist.js
│   ├── wallet.js
│   └── settings.js
└── components/
    ├── stock-card.js
    ├── price-chart.js
    ├── modals.js
    ├── notifications.js
    └── forms.js
```

### External Libraries

#### jQuery
- **Version**: 3.6.0+
- **CDN**: `code.jquery.com`
- **Usage**: DOM manipulation, event handling, AJAX
- **Why**: Simplifies DOM queries and manipulation
- **Include**: `<script src="..."></script>` in HTML

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
```

#### Chart.js
- **Version**: 4.0.0+
- **CDN**: `cdn.jsdelivr.net`
- **Usage**: Interactive price history charts
- **Why**: Lightweight, no dependencies, great for financial charts
- **Include**: `<script src="..."></script>` in HTML

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

#### Moment.js (Optional)
- **Version**: 2.29.4+
- **Usage**: Date/time parsing and formatting
- **Why**: Simplifies date handling in forms and displays
- **Include**: `<script src="..."></script>` in HTML

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js"></script>
```

---

## Backend & Database

### Firebase Realtime Database

**Why Firebase:**
- ✅ No backend server needed
- ✅ Real-time data synchronization
- ✅ Built-in user authentication
- ✅ Automatic backups
- ✅ Easy to scale
- ✅ Generous free tier
- ✅ Directly accessible from JavaScript

**Services Used:**
1. **Authentication** - User signup, login, logout
2. **Realtime Database** - Data storage and sync
3. **Hosting** - Static file serving
4. **Security Rules** - Data access control

**Database Structure:**
```
users/{userId}/
  ├── profile/
  ├── watchlist/
  ├── holdings/
  ├── transactions/
  └── soldStocks/
```

See [DATA_MODEL.md](DATA_MODEL.md) for full schema.

### Firebase SDK

**Installation**: Include via CDN
```html
<script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js"></script>
```

**Configuration** (config.js):
```javascript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  // ...
};

firebase.initializeApp(firebaseConfig);
```

---

## APIs

### Finnhub Stock API

**Type**: REST API for real-time stock market data

**Endpoints Used:**
- `/search` - Search stocks by ticker/name
- `/quote` - Get current stock price
- `/stock/candle` - Get historical price data
- `/company-profile2` - Get company information

**Rate Limits (Free Tier):**
- 60 requests per minute
- Sufficient for personal portfolio tracking

**Authentication**: API key in request URL

**Why Finnhub:**
- ✅ Real-time data
- ✅ Generous free tier
- ✅ Good documentation
- ✅ Reliable service

See [API_SELECTION.md](API_SELECTION.md) for comparison with other APIs.

---

## Caching Strategy

### Multi-Layer Caching

1. **Browser Cache (localStorage)**
   - Stock prices: 5-15 minute TTL
   - Company info: 24 hour TTL
   - Implementation: storage-service.js

2. **Firebase Real-time Listeners**
   - User data cached in memory
   - Auto-updates on changes
   - Offline support via Firebase SDK

3. **API Response Caching**
   - Cache Finnhub responses locally
   - Check cache before making API calls
   - Reduce API rate limit usage

---

## Development Environment

### Requirements

- **Text Editor**: VS Code, Sublime, or any editor
- **Browser**: Chrome, Firefox, Safari, or Edge
- **Node.js** (optional): Only needed for Firebase CLI deployment
- **Git**: For version control

### No Build Process

Unlike React/Vue/Angular apps:
- ✅ No npm install needed
- ✅ No webpack/bundler configuration
- ✅ No transpilation required
- ✅ Just open HTML files in browser
- ✅ Use local server for testing (python, node, etc)

**Simple local server:**
```bash
# Python 3
python -m http.server 8000

# Node.js (if installed)
npx http-server

# PHP (if installed)
php -S localhost:8000
```

Then visit: `http://localhost:8000`

---

## Deployment

### Firebase Hosting (Recommended)

**Setup:**
```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

**Advantages:**
- ✅ Integrated with Firebase backend
- ✅ Free tier with generous limits
- ✅ Automatic HTTPS
- ✅ CDN distribution
- ✅ Environment management

### Alternative Hosting

1. **Vercel** - Great for static sites, free tier
2. **Netlify** - Similar to Vercel, easy setup
3. **GitHub Pages** - Free, good for portfolios
4. **Any static web server** - Works with simple HTML/CSS/JS

---

## Performance Considerations

### Optimization Strategies

1. **Minimize API Calls**
   - Cache prices for 5-15 minutes
   - Batch requests where possible
   - Monitor Finnhub usage

2. **Optimize Assets**
   - Minify CSS and JavaScript (optional)
   - Optimize images (company logos)
   - Use CDN for libraries

3. **Firebase Optimization**
   - Use listeners efficiently
   - Denormalize data for performance
   - Index frequently queried fields

4. **DOM Performance**
   - Batch jQuery DOM updates
   - Use event delegation
   - Avoid repeated DOM queries

### Target Metrics

- Page Load Time: < 3 seconds
- API Response: < 2 seconds
- Firebase Sync: < 1 second
- Mobile FCP: < 3 seconds

---

## Security

### Frontend Security

1. **API Keys**
   - Finnhub API key in .env file
   - Firebase config is public (safe)
   - Never hardcode in production

2. **Input Validation**
   - Validate form inputs client-side
   - Sanitize user inputs
   - Use parameterized queries

3. **Authentication**
   - Firebase handles password security
   - Use HTTPS only (automatic with Firebase)
   - Store auth token securely

### Firebase Security Rules

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

See [DATA_MODEL.md](DATA_MODEL.md) for full security rules.

---

## Comparison with React Stack

| Aspect | Vanilla JS | React |
|--------|-----------|-------|
| **Setup** | Minutes | 15+ minutes (build setup) |
| **Bundle Size** | ~50KB (jQuery+Chart) | 150KB+ (React+Redux) |
| **Build Process** | None | Webpack/Vite |
| **Learning Curve** | Easy | Moderate |
| **Debugging** | Direct browser DevTools | React DevTools + transpiler |
| **Deployment** | Simple (just HTML/CSS/JS) | Build step required |
| **State Management** | Simple object + Firebase | Redux/Context/Zustand |
| **Maintenance** | Simpler for small projects | Better for large projects |

---

## Library Versions

### Current Recommendations

```
jQuery:         3.6.0 or latest
Chart.js:       4.0.0 or latest
Firebase:       10.0.0 or latest
Moment.js:      2.29.4 or latest (optional)
```

### Using npm (Optional)

If you prefer npm over CDN:

```json
{
  "dependencies": {
    "jquery": "^3.6.0",
    "chart.js": "^4.0.0",
    "firebase": "^10.0.0",
    "moment": "^2.29.4"
  }
}
```

Then import:
```javascript
import $ from 'jquery';
import Chart from 'chart.js/auto';
import { initializeApp } from 'firebase/app';
import moment from 'moment';
```

---

## Browser Compatibility

### Desktop
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile
- iOS Safari 12+
- Chrome Android 90+
- Firefox Android 88+

### Fallbacks
- Use vanilla JS with jQuery (no modern framework quirks)
- Responsive CSS works on all modern browsers
- Firebase SDK supports older browsers

---

## Why This Stack?

### Advantages
1. **Simple**: Vanilla JS is easier to understand
2. **Fast**: No framework overhead
3. **Lightweight**: Small bundle size
4. **Real-time**: Firebase provides sync
5. **Scalable**: Firebase scales automatically
6. **Cost-effective**: Free tier for both Firebase and APIs
7. **Easy to deploy**: Just HTML/CSS/JS files
8. **Easy to maintain**: Clear, modular code structure

### Trade-offs
- Not as feature-rich as React ecosystem
- No built-in component reusability patterns
- Requires more manual DOM management
- Testing is more manual (no Jest/RTL)

---

## Future Tech Considerations

### If You Need to Scale

1. **Add TypeScript** - Type safety without full framework
2. **Add Build Process** - Webpack/Parcel for minification
3. **Add Testing** - Jest/Mocha for unit tests
4. **Add Backend** - Node.js/Express if Firebase not enough
5. **Add Mobile App** - React Native or Flutter

### Current Tech is Sufficient For

- MVP and first year of development
- Personal portfolio tracker
- Small to medium user base
- Simple to moderate feature set

---

## Support & Resources

### Documentation
- [Firebase Docs](https://firebase.google.com/docs)
- [jQuery Docs](https://api.jquery.com)
- [Chart.js Docs](https://www.chartjs.org/docs)
- [Finnhub API Docs](https://finnhub.io/docs/api)

### Tutorials
- [Firebase Tutorial](https://firebase.google.com/codelabs)
- [jQuery Learning](https://learn.jquery.com)
- [MDN Web Docs](https://developer.mozilla.org)

---

**Last Updated**: 2026-08-27  
**Tech Stack Decision**: Vanilla HTML/CSS/JS + jQuery + Firebase
