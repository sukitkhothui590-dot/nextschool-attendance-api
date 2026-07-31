const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function waitForUrl(url, { timeoutMs = 120_000, label = url } = {}) {
  const deadline = Date.now() + timeoutMs;
  let lastError = 'not reachable';
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }
    await delay(2_000);
  }
  throw new Error(`Timed out waiting for ${label}: ${lastError}`);
}
