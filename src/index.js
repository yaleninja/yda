require('dotenv').config(); // Load env first

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const routes = require('./routes');
const db = require('./db/connection');
const { setupCronJobs, setupTestCron } = require('./cron/jobs');

const app = express();
const PORT = process.env.PORT || 4000;

// Security & perf
app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());

// Body parsing
app.use(express.json());

// 🔐 CORS — allows ANY origin (including file:// / Origin: null)
app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser / server-side calls (no Origin header)
    // and file:// (Origin 'null')
    if (!origin || origin === 'null') {
      return callback(null, true);
    }

    // If you literally want to allow ANY web origin:
    return callback(null, true);

    // If later you want to restrict:
    // const allowedOrigins = ['https://eatyale.io', 'https://some-other.site'];
    // if (allowedOrigins.includes(origin)) {
    //   return callback(null, true);
    // }
    // return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
}));

// Routes
app.use('/api', routes);

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'YalDiningApp backend is running',
    status: 'online',
    database: 'connected',
    cronMode: process.env.CRON_MODE || 'disabled',
    endpoints: { dining: '/api/dining', halls: '/api/dining/halls' }
  });
});

app.get('/d43129d', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Support Our Work – A/B Test</title>

  <!-- GA4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-2GN1DX6608"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-2GN1DX6608');
  </script>

  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }
    h1, h2 { color: #111827; }
    ul { padding-left: 1.25rem; }
    #abtest {
      margin-top: 1rem;
      padding: 0.6rem 1.2rem;
      border-radius: 999px;
      border: 1px solid #111827;
      background: #111827;
      color: #fff;
      font-size: 1rem;
      cursor: pointer;
    }
    #abtest:hover {
      background: #374151;
    }
  </style>
</head>
<body>
  <h1>Team Members</h1>
  <ul>
    <li>perfect-stork</li>
    <li>inquisitive-jaguar</li>
  </ul>

  <h2>Support Our Work</h2>
  <button id="abtest">Click Here</button>

  <!-- A/B test logic -->
  <script>
    // Randomly assign the user to Group A or Group B
    let variant_name;
    if (Math.random() < 0.5) {
      variant_name = 'thanks'; // Group A
    } else {
      variant_name = 'kudos';  // Group B
    }

    // Messages for each variant
    const messages = {
      'thanks': 'Thank you!',
      'kudos': 'Kudos!'
    };

    // --- Exposure Tracking ---
    // User was assigned and saw this variant
    gtag('event', 'ab_test_exposure', {
      test_name: 'button_copy_test',
      variant: variant_name
    });

    // --- Click Tracking (Goal) ---
    document.getElementById('abtest').addEventListener('click', function () {
      // Track using the variant name, not the button label
      gtag('event', 'button_click_goal', {
        button_type: variant_name,      // 'kudos' or 'thanks'
        test_name: 'button_copy_test',
        click_location: 'ab_test_endpoint'
      });

      const prompt_message = messages[variant_name];
      console.log('Variant:', variant_name);
      alert(prompt_message);
    });
  </script>
</body>
</html>`);
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await db.testConnection();
    res.json({
      status: 'healthy',
      database: 'connected',
      cronMode: process.env.CRON_MODE || 'disabled',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message
    });
  }
});



// Cron init
const cronMode = process.env.CRON_MODE;
if (cronMode === 'test') {
  console.log('🧪 Starting in TEST mode - cron runs every minute');
  setupTestCron();
} else if (cronMode === 'production') {
  console.log('🚀 Starting in PRODUCTION mode - cron runs at 1 AM daily');
  setupCronJobs();
} else {
  console.log('⏸️  Cron jobs disabled (set CRON_MODE=test or CRON_MODE=production)');
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM: closing DB pool');
  await db.closePool();
  process.exit(0);
});
process.on('SIGINT', async () => {
  console.log('SIGINT: closing DB pool');
  await db.closePool();
  process.exit(0);
});

// Start
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════╗
║   YalDiningApp Backend Server          ║
╠════════════════════════════════════════╣
║   🚀 Port: ${PORT}                         
║   🗄️  Database: ${process.env.DB_NAME || 'MySQL'}
║   📡 API: /api                         
║   ❤️  Health: /health                  
║   ⏰ Cron: ${cronMode || 'disabled'}                    
╚════════════════════════════════════════╝
`);
});

module.exports = app;
