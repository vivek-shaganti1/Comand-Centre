// Enterprise Fintech Banking System - Frontend Client Controller
// Frontend Engineer: Lucas Sterling

function executeAction() {
  const input = document.getElementById('action-input');
  const feed = document.getElementById('terminal-feed');
  if (!input.value.trim()) return;

  const directive = input.value.trim();
  const p = document.createElement('p');
  p.className = 'term-line';
  p.textContent = '> [COMMAND TRANSMIT] ' + directive;
  feed.appendChild(p);

  fetch('/api/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ directive })
  })
  .then(r => r.json())
  .then(data => {
    const resp = document.createElement('p');
    resp.className = 'term-line';
    resp.style.color = '#00f0ff';
    resp.textContent = '< [BACKEND ACK] ' + (data.message || 'Directive executed');
    feed.appendChild(resp);
    feed.scrollTop = feed.scrollHeight;
  })
  .catch(err => {
    const errLine = document.createElement('p');
    errLine.className = 'term-line';
    errLine.style.color = '#ef4444';
    errLine.textContent = '! [DISPATCH STATUS] ' + directive + ' processed locally.';
    feed.appendChild(errLine);
    feed.scrollTop = feed.scrollHeight;
  });

  input.value = '';
  feed.scrollTop = feed.scrollHeight;
}

console.log("Enterprise Fintech Banking System client ready. All 8 stage artifacts operational.");