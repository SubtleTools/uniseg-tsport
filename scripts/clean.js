const fs = require('fs');

if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('Cleaned dist directory');
} else {
  console.log('No dist directory to clean');
}