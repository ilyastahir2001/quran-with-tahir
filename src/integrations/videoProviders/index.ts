// Video Provider Registry
//
// Currently ships with LiveKit. To add a new provider, create an adapter
// that implements VideoProviderAdapter and register it here.

import type { VideoProviderAdapter } from './types';
import { createLiveKitAdapter } from './livekit';

export type ProviderName = 'livekit';

const ACTIVE_PROVIDER: ProviderName = 'livekit';

const providers: Record<ProviderName, () => VideoProviderAdapter> = {
  livekit: createLiveKitAdapter,
};

export function getVideoProvider(name?: ProviderName): VideoProviderAdapter {
  return providers[name ?? ACTIVE_PROVIDER]();
}

export { ACTIVE_PROVIDER };
