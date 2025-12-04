const express = require('express');
const diningRoutes = require('./dining');

const router = express.Router();

router.get('/hello', (req, res) => {
  res.json({ message: 'Hello World' });
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/dining', diningRoutes);


router.get('/d43129d', (req, res) => {
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

module.exports = router;