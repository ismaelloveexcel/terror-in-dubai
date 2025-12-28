const { spawn } = require('child_process');
const path = require('path');

// Start server
const server = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '../server'),
  shell: true,
  stdio: 'inherit'
});

// Start client
const client = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '../client'),
  shell: true,
  stdio: 'inherit'
});

process.on('SIGINT', () => {
  server.kill();
  client.kill();
  process.exit();
});
