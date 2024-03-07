const fs = require('fs');
const config = {
    loadBalancerUrl: process.env.LOAD_BALANCER_URL
};

fs.writeFileSync('public/config.js', `window.config = ${JSON.stringify(config)};`);
