const fs = require('fs');
const config = {
    load_balancer_url: process.env.LOAD_BALANCER_URL
};

fs.writeFileSync('public/config.js', `window.config = ${JSON.stringify(config)};`);
