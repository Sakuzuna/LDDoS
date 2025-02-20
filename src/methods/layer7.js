module.exports = {
    NORMAL: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\n\r\n`;
        socket.write(payload);
    },

    DGB: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\r\nAccept: */*\r\n\r\n`;
        socket.write(payload);
    },

    CFB: (socket, target, kbSize) => {
        const payload = `GET ${target.pathname} HTTP/1.1\r\nHost: ${target.hostname}\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\r\nAccept: */*\r\n\r\n`;
        socket.write(payload);
    },
};
