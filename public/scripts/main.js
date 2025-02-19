const form = document.getElementById('attackForm');
const logBox = document.getElementById('logs');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const target = document.getElementById('target').value;
    const delay = document.getElementById('delay').value;
    const kbSize = document.getElementById('kbSize').value;

    const response = await fetch(`/attack?target=${encodeURIComponent(target)}&delay=${delay}&kbSize=${kbSize}`);
    const result = await response.text();
    logBox.textContent += `Attack started on ${target} with delay ${delay}ms and ${kbSize}KB payload\n`;
});
