// Asset Configuration - Save Ismael
// Premium PBR Asset Pipeline

// =============================================================================
// ASSET IDs - Populated after Meshy.ai generation
// =============================================================================

export const assetConfig = {
  // ═══════════════════════════════════════════════════════════════════════════
  // ENEMIES
  // ═══════════════════════════════════════════════════════════════════════════
  enemies: {
    demodog: '',      // Quadruped swarm enemy
    demobat: '',      // Flying bat-like enemy
    demogorgon: '',   // Tall humanoid elite
    mindFlayer: '',   // Level 4 boss
    vecna: '',        // Final boss
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INFECTION PACK (Shared across all levels)
  // ═══════════════════════════════════════════════════════════════════════════
  infection: {
    vineSmall: '',
    vineMedium: '',
    vineLarge: '',
    vineHanging: '',
    vineCluster: '',
    podSmall: '',
    podMedium: '',
    podLarge: '',
    podOpen: '',
    spreadFloor: '',
    spreadWall: '',
    membraneDoor: '',
    growthCorner: '',
    hiveSmall: '',
    hiveLarge: '',
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
      trainCar: '',        // Metro train exterior
      stationPlatform: '', // Platform with infected ceiling
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
      yachtCapsized: '',   // Overturned luxury yacht
      marinaTowerBase: '', // Base of tilted tower
    },
    modular: {
      dockPlank: '',
      dockPlankBroken: '',
      railingMarina: '',
      restaurantFront: '',
      palmTreeDead: '',
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
  // ═══════════════════════════════════════════════════════════════════════════
  evidence: {
    carKeys: '',
    parkingTicket: '',
    wallet: '',
    photo: '',
    crackedPhone: '',
    watch: '',
    giftBag: '',
    phone: '',
    voiceRecorder: '',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEAPONS
  // ═══════════════════════════════════════════════════════════════════════════
  weapons: {
    pistol: '',
    muzzleFlash: '',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UI / MISC
  // ═══════════════════════════════════════════════════════════════════════════
  ui: {
    healthPack: '',
    ammoPack: '',
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
