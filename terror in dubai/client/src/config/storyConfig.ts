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
    title: 'Illusion',
    storyCard: 'The city is lying to you. Signal Anchors amplify the interference. Break them and find ' + gameConfig.rescueTarget + '.',
    ismaelMessages: [
      'My voice is breaking through... you\'re getting closer.',
      'Don\'t trust what you see. Trust what you feel.',
      'I\'m here. I\'m waiting for you.'
    ]
  },
  {
    id: 'level3',
    title: 'The Climax',
    storyCard: 'The source is here, at the edge of Dubai. End it and seal the breach. Save ' + gameConfig.rescueTarget + '.',
    ismaelMessages: [
      'This is it. The final confrontation.',
      'You\'re stronger than you know.',
      'Finish this. Save our city.'
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
