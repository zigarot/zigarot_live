const canvas = document.getElementById('matrix');

if (canvas && getComputedStyle(canvas).display !== 'none') {
  const ctx = canvas.getContext('2d');

  const chars = 'ZIGAROT';
  const fontSize = 14;
  const fps = 20;
  const interval = 1000 / fps;
  let columns, drops, lastTime = 0;

  function init() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = Array(columns).fill(1);
  }

  function draw() {
    ctx.fillStyle = 'rgba(17, 21, 26, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${fontSize}px 'Barlow Condensed'`;

    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      ctx.fillStyle = y === 1 ? '#ffffff' : '#61F21D';
      ctx.fillText(char, x, y * fontSize);

      if (y * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    });
  }

  function loop(timestamp) {
    requestAnimationFrame(loop);
    if (timestamp - lastTime < interval) return;
    lastTime = timestamp;
    draw();
  }

  init();
  window.addEventListener('resize', init);
  requestAnimationFrame(loop);
}