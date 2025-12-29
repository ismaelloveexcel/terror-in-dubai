// Asset mapping for Meshy.ai generated models
// Set these IDs after generating models via the generateAssets script

export const assetConfig = {
  // Spawners/Objects
  hiveModelAssetId: '', // Level 1 hive spawner
  anchorAssetId: '', // Level 2 signal anchor

  // Enemies
  swarmEnemyAssetId: '', // Demodog/D-Dog
  flyingEnemyAssetId: '', // Demobat/Rift Bat
  eliteEnemyAssetId: '', // Demogorgon/The Gorgon

  // Boss
  bossAssetId: '', // Vecna/The One

  // Environment pieces (optional)
  vineClusterAssetId: '',
  sporeCloudAssetId: '',

  // Collectibles
  memoryFragmentAssetId: ''
};

// Helper to check if an asset is configured
export function hasAsset(assetId: string): boolean {
  return assetId !== '' && assetId !== null && assetId !== undefined;
}

// Get asset URL
export function getAssetUrl(assetId: string): string {
  return `/assets/${assetId}.glb`;
}

// Example task IDs - replace these after running generateAssets.ts
// hiveModelAssetId: '01933aab-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
// swarmEnemyAssetId: '01933aab-yyyy-yyyy-yyyy-yyyyyyyyyyyy'
// etc.
