import { LevelConfig, MemoryFragment } from '../types';
import { gameConfig } from './gameConfig';
import { Vector3 } from '@babylonjs/core';

export function getPrologueText(): string[] {
  const target = gameConfig.rescueTarget;
  return [
    'Dubai, 2025. A strange storm opened a rift beneath the city.',
    `${target} went to investigate the Metro disturbance...`,
    'He never came back.',
    'Now, the city is twisted. The only way to save him is to go in.',
    'Will you face the Upside-Down Dubai?'
  ];
}

export function getFinalMessage(): string[] {
  const nephew = gameConfig.nephewName;
  return [
    `${nephew},`,
    'You just beat a game I made just for you.',
    'In this story, you saved me. But in real life, you inspire me every day.',
    'Never stop being brave. I\'m proud of you.',
    '- Uncle Ismael'
  ];
}

export const levelConfigs: LevelConfig[] = [
  {
    id: 'level1',
    title: 'The Beginning',
    storyCard: 'Dubai went dark. A breach opened beneath the city. Destroy the Hives before the gate stabilizes.',
    ismaelMessages: [
      'I can feel something... someone is coming.',
      'The shadows are fading when you\'re near. Keep fighting.'
    ]
  },
  {
    id: 'level2',
    title: 'The Descent',
    storyCard: 'The metro system has been corrupted. Something bigger lurks in the darkness.',
    ismaelMessages: [
      'The tunnels loop... but you can find a way.',
      'I can hear you coming. Don\'t stop.',
      'Something massive is down here with me.'
    ]
  },
  {
    id: 'level3',
    title: 'The Window',
    storyCard: 'The Frame shows both worlds now. The Upside Down bleeds through.',
    ismaelMessages: [
      'The view from up here... you can see both Dubais.',
      'Don\'t look down. Keep climbing.',
      'I recorded something on my phone. Find it.'
    ]
  },
  {
    id: 'level4',
    title: 'The Palace',
    storyCard: 'The luxury waterfront has become the Mind Flayer\'s domain. Defeat the beast.',
    ismaelMessages: [
      'Something huge controls this place... it\'s in my head.',
      'My watch stopped at 7:42... that\'s when everything changed.',
      'It knows you\'re coming. Be ready.'
    ]
  },
  {
    id: 'level5',
    title: 'Almost There',
    storyCard: 'The heart of Dubai. ' + gameConfig.rescueTarget + ' is close - you can feel it.',
    ismaelMessages: [
      'I got you something for your birthday... Stranger Things stuff.',
      'I can see the tower from here. He\'s taking me there.',
      'Don\'t give up. I\'m so close.'
    ]
  },
  {
    id: 'level6',
    title: 'The Final Battle',
    storyCard: 'Vecna\'s throne. ' + gameConfig.rescueTarget + ' is here. This ends now.',
    ismaelMessages: [
      'Vecna has me... he wants to use me to get to you.',
      'Remember what I taught you... memories are power.',
      'Use our memories. That\'s how you beat him.'
    ]
  }
];

// Memory fragments for each level
export const memoryFragments: Record<string, MemoryFragment[]> = {
  level1: [
    {
      id: 'memory1_1',
      position: new Vector3(-15, 1, 10),
      text: 'Remember when we explored the Metro together?',
      collected: false
    },
    {
      id: 'memory1_2',
      position: new Vector3(20, 1, -15),
      text: 'You were never afraid of the dark.',
      collected: false
    },
    {
      id: 'memory1_3',
      position: new Vector3(0, 1, 25),
      text: 'Dubai is our home. We protect it together.',
      collected: false
    }
  ],
  level2: [
    {
      id: 'memory2_1',
      position: new Vector3(-25, 1, 15),
      text: 'You always found your way through the chaos.',
      collected: false
    },
    {
      id: 'memory2_2',
      position: new Vector3(15, 1, -20),
      text: 'The city\'s lights guided us home, always.',
      collected: false
    },
    {
      id: 'memory2_3',
      position: new Vector3(30, 1, 10),
      text: 'Truth cuts through every illusion.',
      collected: false
    }
  ],
  level3: [
    {
      id: 'memory3_1',
      position: new Vector3(-20, 1, 20),
      text: 'We climbed to the top of the world together.',
      collected: false
    },
    {
      id: 'memory3_2',
      position: new Vector3(25, 1, -15),
      text: 'This is our city. Let\'s take it back.',
      collected: false
    },
    {
      id: 'memory3_3',
      position: new Vector3(0, 1, 30),
      text: 'You were born to be a hero.',
      collected: false
    }
  ],
  level4: [
    {
      id: 'memory4_1',
      position: new Vector3(30, 1, -30),
      text: 'Remember the boat rides at the Marina?',
      collected: false
    },
    {
      id: 'memory4_2',
      position: new Vector3(-15, 1, 40),
      text: 'The water used to sparkle. We\'ll make it sparkle again.',
      collected: false
    },
    {
      id: 'memory4_3',
      position: new Vector3(10, 1, 60),
      text: 'Even in darkness, love is the strongest light.',
      collected: false
    }
  ],
  level5: [
    {
      id: 'memory5_1',
      position: new Vector3(-20, 1, -20),
      text: 'The mall was always our adventure ground.',
      collected: false
    },
    {
      id: 'memory5_2',
      position: new Vector3(25, 1, 30),
      text: 'Movie nights. Popcorn. Us against the world.',
      collected: false
    },
    {
      id: 'memory5_3',
      position: new Vector3(-5, 1, 70),
      text: 'You never gave up on anyone. That\'s your superpower.',
      collected: false
    }
  ],
  level6: [
    {
      id: 'memory6_1',
      position: new Vector3(-25, 1, -15),
      text: 'At the top of the world, nothing can stop us.',
      collected: false
    },
    {
      id: 'memory6_2',
      position: new Vector3(20, 1, 5),
      text: 'Our bond is stronger than any curse.',
      collected: false
    },
    {
      id: 'memory6_3',
      position: new Vector3(0, 1, 20),
      text: 'Love always wins. Always.',
      collected: false
    }
  ]
};

// Lights wall messages for Level 2
export const lightsWallMessages = [
  'SAVE ME',
  gameConfig.rescueTarget.toUpperCase() + ' NEEDS YOU',
  'YOU\'RE CLOSE',
  'I CAN SEE YOU NOW'
];

// Finale sequence
export function getFinaleSequence(): string[] {
  const nephew = gameConfig.nephewName;
  const target = gameConfig.rescueTarget;

  return [
    'The breach collapses. The vines wither. Dubai\'s lights flicker back on.',
    `You find ${target} at the center, kneeling, weak but alive.`,
    gameConfig.familyMode
      ? `${target} looks up: "You did it, ${nephew}. I knew you would."`
      : `${target}: "You saved me. Thank you."`,
    'The city is safe. Because of you.'
  ];
}

export const creditsText = [
  'SAVE ISMAEL',
  '',
  'A gift for ' + gameConfig.nephewName,
  '',
  'Created with love',
  'by Uncle Ismael',
  '',
  '2025',
  '',
  'Made with Babylon.js',
  'Powered by Meshy.ai',
  '',
  'Never stop being brave.'
];
