// =============================================================================
// GenLayer Client — Real Network Interaction (Studionet)
// Uses genlayer-js SDK v1.1.0 API with external Web3 wallet injection.
// =============================================================================

import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { getAccounts } from './wallet/client';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export const CONTRACT_ADDRESS: string =
  import.meta.env.VITE_CONTRACT_ADDRESS || '';

// ---------------------------------------------------------------------------
// Client Setup
// ---------------------------------------------------------------------------

let client = createClient({
  chain: studionet,
});

/**
 * Update the GenLayer client whenever the active Web3 wallet changes.
 */
export async function refreshClient() {
  if (typeof window === 'undefined') return client;
  try {
    const accounts = await getAccounts();
    const address = accounts[0];
    
    // In GenLayer JS v1.x, passing an address as the account tells the client
    // to use the active window.ethereum provider for transaction signing.
    client = createClient({
      chain: studionet,
      account: address ? (address as `0x${string}`) : undefined,
    });
  } catch (error) {
    console.error('Failed to refresh GenLayer client:', error);
  }
  return client;
}

// ---------------------------------------------------------------------------
// Contract reads (view methods — no signing required)
// ---------------------------------------------------------------------------

export async function readContract<T = unknown>(
  functionName: string,
  args: unknown[] = [],
): Promise<T> {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      'VITE_CONTRACT_ADDRESS is not set. Configure your .env file.',
    );
  }

  // Refresh client to ensure it has latest active address
  await refreshClient();

  const result = await client.readContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName,
    args: args as string[],
  });

  return result as T;
}

// ---------------------------------------------------------------------------
// Contract writes (state-changing — uses the injected Web3 wallet)
// ---------------------------------------------------------------------------

export interface WriteResult {
  txHash: string;
  status: string;
}

export async function writeContract(
  functionName: string,
  args: unknown[] = [],
): Promise<WriteResult> {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      'VITE_CONTRACT_ADDRESS is not set. Configure your .env file.',
    );
  }

  await refreshClient();

  const callParams = {
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName,
    args: args as string[],
  };

  // Submit the transaction via injected Web3 provider
  const txHash = await client.writeContract({
    ...callParams,
    value: 0n,
  } as Parameters<typeof client.writeContract>[0]);

  // Wait for the transaction receipt
  // @ts-ignore - safe fallback if types disagree slightly
  const receipt = await client.waitForTransactionReceipt({ hash: txHash });

  const status = (receipt as any).status;
  
  if (status === 'reverted' || status === 'error') {
    throw new Error(
      `Transaction failed: ${(receipt as any).statusName ?? status ?? 'UNKNOWN'}`,
    );
  }

  return {
    txHash: String(txHash),
    status: status || 'FINALIZED',
  };
}
