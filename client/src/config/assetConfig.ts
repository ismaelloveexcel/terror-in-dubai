// Asset Configuration - Save Ismael
// Premium PBR Asset Pipeline

// =============================================================================
// ASSET IDs - Populated after Meshy.ai generation
// =============================================================================

export const assetConfig = {
  // ═══════════════════════════════════════════════════════════════════════════
  // ENEMIES (Mapped from existing Meshy.ai assets)
  // ═══════════════════════════════════════════════════════════════════════════
  enemies: {
    demodog: '019b6990-91e3-78a2-a5b3-1291e610b633',      // Void Stalker - 3.7 MB
    demobat: '019b6990-9622-7588-8bb7-ef219121b5c1',      // Rift Flyer - 3.8 MB
    demogorgon: '019b6990-9a67-7072-a0fa-88c7b92b3b93',   // Void Reaper - 3.9 MB
    mindFlayer: '019b6a00-ef68-76eb-9820-97273eb1b774',   // Mind Flayer - 14.0 MB
    vecna: '019b6990-9eb0-78a7-b171-c6ae4467fce2',        // The Sovereign - 5.1 MB
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INFECTION PACK (Shared across all levels)
  // ═══════════════════════════════════════════════════════════════════════════
  infection: {
    vineSmall: '',
    vineMedium: '',
    vineLarge: '',
    vineHanging: '',
    vineCluster: '019b6990-a2f1-7072-9f02-cf6711208df2',   // Vine Cluster - 5.3 MB
    podSmall: '',
    podMedium: '',
    podLarge: '',
    podOpen: '',
    spreadFloor: '',
    spreadWall: '019b6990-afd0-7769-83c9-a0d490f8db36',    // Flesh Wall - 3.1 MB
    membraneDoor: '',
    growthCorner: '',
    hiveSmall: '019b6990-8959-78a0-b2bb-07a545d27f3c',     // Hive Spawner - 4.9 MB
    hiveLarge: '019b6a06-0bd9-7b86-9869-c8c152ed17d8',     // Corruption Node - 9.8 MB
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 1: IBN BATTUTA MALL
  // ═══════════════════════════════════════════════════════════════════════════
  level1: {
    hero: {
      persiaArch: '',      // Grand entrance arch
      fountainCorrupted: '', // Central fountain with black water
    },
    modular: {
      wallPlaster: '',
      wallPlasterDamaged: '',
      wallTilePattern: '',
      wallShopFront: '',
      wallShopFrontOpen: '',
      floorMarble: '',
      floorMarbleCracked: '',
      floorConcrete: '',
      pillarPersian: '',
      pillarPersianInfected: '',
      pillarConcrete: '',
      pillarConcreteInfected: '',
      ceilingOrnate: '',
      ceilingDome: '',
      ceilingParking: '',
      archPersian: '',
      doorwayMall: '',
      doorwayService: '',
      stairsMall: '',
      escalatorFrozen: '',
    },
    props: {
      benchMall: '',
      benchDamaged: '',
      chairFoodCourt: '',
      tableFoodCourt: '',
      trashCan: '',
      planterLarge: '',
      planterSmall: '',
      foodTray: '',
      signDirectory: '',
      signExit: '',
      signArabic: '',
      signParking: '',
      signEmergency: '',
      signWetFloor: '',
      barrierQueue: '',
      barrierSecurity: '',
      barrierBollard: '',
      gateShutter: '',
      turnstile: '',
      kioskInfo: '',
      kioskVendor: '',
      cartShopping: '',
      atm: '',
      mannequin: '',
      carSedan: '',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 2: DUBAI METRO
  // ═══════════════════════════════════════════════════════════════════════════
  level2: {
    hero: {
      trainCar: '019b6a0b-678c-73c5-bbe7-cfa9f845f069',        // Metro train - 11.3 MB
      stationPlatform: '019b6990-b40f-7588-858d-4f00e4871ca0', // Metro Pillar/Platform - 5.9 MB
    },
    modular: {
      tunnelWall: '',
      tunnelWallInfected: '',
      platformEdge: '',
      trackSection: '',
      trackSwitch: '',
      stationWall: '',
      stationCeiling: '',
      ticketGate: '',
      escalatorMetro: '',
      ventShaft: '',
    },
    props: {
      ticketMachine: '',
      benchMetro: '',
      signMetro: '',
      mapDisplay: '',
      emergencyPhone: '',
      fireExtinguisher: '',
      cctv: '',
      adDisplay: '',
      clothesPile: '',
      baggageAbandoned: '',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 3: DUBAI FRAME
  // ═══════════════════════════════════════════════════════════════════════════
  level3: {
    hero: {
      frameGlassPanel: '', // Window showing real Dubai
      observationDeck: '', // Viewpoint area
    },
    modular: {
      frameBeam: '',
      frameBeamInfected: '',
      glassPanel: '',
      glassPanelCracked: '',
      walkwaySection: '',
      stairSection: '',
      railingModern: '',
      elevatorDoor: '',
    },
    props: {
      telescope: '',
      infoPanel: '',
      giftShopRack: '',
      benchObservation: '',
      souvenirStand: '',
      photoSpot: '',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 4: DUBAI MARINA
  // ═══════════════════════════════════════════════════════════════════════════
  level4: {
    hero: {
      yachtCapsized: '019b6a11-a5bf-797d-8b3b-ff7c2b9b08fa',   // Capsized yacht - 15.9 MB
      marinaTowerBase: '019b6a17-e214-7d3f-bf62-3ecb298c938e', // Marina tower - 16.5 MB
    },
    modular: {
      dockPlank: '',
      dockPlankBroken: '',
      railingMarina: '',
      restaurantFront: '',
      palmTreeDead: '019b6990-b853-7077-8a2f-7f3a1728863d',    // Dead Palm Tree - 6.1 MB
      palmTreeInfected: '',
      waterfrontWall: '',
      boatCleat: '',
    },
    props: {
      anchor: '',
      lifePreserver: '',
      boatFender: '',
      restaurantTable: '',
      restaurantChair: '',
      menuBoard: '',
      streetLamp: '',
      planter: '',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 5: DOWNTOWN DUBAI
  // ═══════════════════════════════════════════════════════════════════════════
  level5: {
    hero: {
      fountainFrozen: '',  // Segment of frozen fountain
      aquariumCracked: '', // Dubai Mall aquarium
    },
    modular: {
      mallWallLuxury: '',
      mallFloorPolished: '',
      mallCeiling: '',
      fountainBasin: '',
      promenadeTile: '',
      shopFrontLuxury: '',
    },
    props: {
      displayCase: '',
      fashionMannequin: '',
      plantLuxury: '',
      benchDesigner: '',
      fountainJet: '',
      lightFixture: '',
      mammoosCocoon: '',  // Where Mammoo is trapped
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 6: BURJ KHALIFA
  // ═══════════════════════════════════════════════════════════════════════════
  level6: {
    hero: {
      vecnaThrone: '',     // Corrupted observation deck throne
      elevatorShaft: '',   // Interior elevator shaft
    },
    modular: {
      towerWallInterior: '',
      towerWindow: '',
      towerWindowCracked: '',
      elevatorDoorBurj: '',
      stairwellSection: '',
      observationFloor: '',
    },
    props: {
      officeDesk: '',
      officeChair: '',
      serverRack: '',
      telescope: '',
      viewingBinoculars: '',
      emergencyKit: '',
      brokenGlass: '',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COLLECTIBLES / EVIDENCE
  // Note: Using procedural generation (Babylon.js primitives) for evidence items
  // ═══════════════════════════════════════════════════════════════════════════
  evidence: {
    carKeys: 'PROCEDURAL_KEYS',          // Level 1 - Gold metallic keys
    parkingTicket: 'PROCEDURAL_PAPER',   // Level 1 - White paper slip
    wallet: 'PROCEDURAL_WALLET',         // Level 2 - Brown leather wallet
    photo: 'PROCEDURAL_PHOTO',           // Level 2 - Family photo
    crackedPhone: 'PROCEDURAL_PHONE',    // Level 3 - Cracked phone screen
    watch: 'PROCEDURAL_WATCH',           // Level 4 - Stopped at 7:42 PM
    giftBag: 'PROCEDURAL_BAG',           // Level 5 - Birthday gift bag
    note: 'PROCEDURAL_NOTE',             // Level 5 - Handwritten note
    voiceRecorder: 'PROCEDURAL_RECORDER',// Level 6 - Final recording
    memoryFragment: '019b6990-ab70-7588-9a63-353df34e1460', // Memory Fragment - 3.1 MB
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEAPONS (Aidan's Nephew's Custom Creations!)
  // ═══════════════════════════════════════════════════════════════════════════
  weapons: {
    pistol: '',
    muzzleFlash: '',
    // Custom weapons made by Aidan's nephew!
    katanaStaff: '/assets/weapons/katana_staff.glb',
    nailBat: '/assets/weapons/nail_bat.glb',
    nailBatAlt: '/assets/weapons/nail_bat_alt.glb',
    spikyShield: '/assets/weapons/spiky_shield.glb',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PORTALS (Dimensional Rift Spawners)
  // ═══════════════════════════════════════════════════════════════════════════
  portals: {
    bluePortal: '/assets/portals/blue_portal.glb',       // 1.3 MB - Blue dimensional rift
    standardPortal: '/assets/portals/portal_standard.glb', // 7.2 MB - Standard Upside Down portal
    largePortal: '/assets/portals/portal_large.glb',      // 8.7 MB - Large boss portal
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UI / MISC
  // ═══════════════════════════════════════════════════════════════════════════
  ui: {
    healthPack: '',
    ammoPack: '',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MISC ENVIRONMENT (Mapped from remaining Meshy assets)
  // ═══════════════════════════════════════════════════════════════════════════
  environment: {
    riftAnchor: '019b6990-8d9d-78a2-98f8-b2a673b06ff6',     // Rift Anchor - 3.4 MB
    sporeCloud: '019b6990-a72f-78a7-931a-effc48600868',     // Spore Cloud - 5.4 MB
  },
};

// =============================================================================
// ASSET HELPERS
// =============================================================================

/**
 * Check if an asset ID is configured
 */
export function hasAsset(assetId: string | undefined): boolean {
  return assetId !== '' && assetId !== null && assetId !== undefined;
}

/**
 * Get full asset URL from ID
 */
export function getAssetUrl(assetId: string): string {
  if (!hasAsset(assetId)) return '';
  return `/assets/${assetId}.glb`;
}

/**
 * Get all configured assets for a level
 */
export function getLevelAssets(levelNumber: number): string[] {
  const levelKey = `level${levelNumber}` as keyof typeof assetConfig;
  const levelAssets = assetConfig[levelKey];
  
  if (!levelAssets || typeof levelAssets !== 'object') return [];
  
  const assets: string[] = [];
  
  const collectAssets = (obj: Record<string, unknown>) => {
    for (const value of Object.values(obj)) {
      if (typeof value === 'string' && value !== '') {
        assets.push(value);
      } else if (typeof value === 'object' && value !== null) {
        collectAssets(value as Record<string, unknown>);
      }
    }
  };
  
  collectAssets(levelAssets as Record<string, unknown>);
  return assets;
}

/**
 * Get all infection assets
 */
export function getInfectionAssets(): string[] {
  return Object.values(assetConfig.infection).filter(id => id !== '');
}

/**
 * Get all enemy assets
 */
export function getEnemyAssets(): string[] {
  return Object.values(assetConfig.enemies).filter(id => id !== '');
}

// =============================================================================
// FALLBACK MESH CONFIGURATIONS
// =============================================================================

export const fallbackMeshes = {
  demodog: {
    type: 'box',
    width: 1,
    height: 0.6,
    depth: 1.5,
    color: '#1a1a1a',
    emissive: '#00ffcc',
  },
  demobat: {
    type: 'sphere',
    diameter: 0.8,
    color: '#2a2a2a',
    emissive: '#00ffcc',
  },
  demogorgon: {
    type: 'capsule',
    height: 2.5,
    radius: 0.6,
    color: '#1a1a1a',
    emissive: '#00ffcc',
  },
  mindFlayer: {
    type: 'sphere',
    diameter: 5,
    color: '#0a0a0a',
    emissive: '#00ffcc',
  },
  vecna: {
    type: 'capsule',
    height: 2.2,
    radius: 0.5,
    color: '#1a0a0a',
    emissive: '#8b0000',
  },
  hive: {
    type: 'cylinder',
    height: 3,
    diameter: 2,
    color: '#1a1a1a',
    emissive: '#00ffcc',
  },
  pod: {
    type: 'sphere',
    diameter: 0.6,
    color: '#0a1a1a',
    emissive: '#00ffcc',
  },
  vine: {
    type: 'cylinder',
    height: 2,
    diameter: 0.1,
    color: '#0a1a0a',
    emissive: '#39ff14',
  },
};

export default assetConfig;
