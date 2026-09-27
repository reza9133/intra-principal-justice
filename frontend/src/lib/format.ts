// GEN uses 18 decimals, same as ETH.
const WEI_PER_GEN = 1e18;

export function formatGen(wei: number | undefined | null): string {
  if (!wei) return '0';
  const gen = wei / WEI_PER_GEN;
  return gen.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export function shortAddr(addr: string | undefined | null): string {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatCountdown(deadlineSecs: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = deadlineSecs - now;
  if (diff <= 0) return 'closed';
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}
