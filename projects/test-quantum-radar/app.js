// Test Quantum Radar Client Logic
function executeAction() {
  const input = document.getElementById('action-input');
  const feed = document.getElementById('terminal-feed');
  if (!input.value.trim()) return;

  const p = document.createElement('p');
  p.className = 'term-line';
  p.textContent = '> [JARVIS EXEC] ' + input.value;
  feed.appendChild(p);

  setTimeout(() => {
    const resp = document.createElement('p');
    resp.className = 'term-line';
    resp.style.color = '#00f0ff';
    resp.textContent = '< [SYSTEM ACK] Directive "' + input.value + '" executed successfully.';
    feed.appendChild(resp);
    feed.scrollTop = feed.scrollHeight;
  }, 300);

  input.value = '';
  feed.scrollTop = feed.scrollHeight;
}

console.log("Test Quantum Radar initialized by Stark Autonomous Agent Swarm.");