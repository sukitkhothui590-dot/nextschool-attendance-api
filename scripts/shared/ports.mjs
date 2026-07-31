import net from 'node:net';

export function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port, '127.0.0.1');
  });
}

export async function assertPortsAvailable(ports) {
  const unavailable = [];
  for (const port of ports) {
    if (!(await isPortAvailable(port))) unavailable.push(port);
  }
  if (unavailable.length) {
    throw new Error(
      `Port(s) already in use: ${unavailable.join(', ')}. Stop the conflicting service or change WEB_PORT/API_PORT in .env.demo.local.`,
    );
  }
}
