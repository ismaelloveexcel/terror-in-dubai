# Contributing to SAVE ISMAEL

Thank you for your interest in contributing to SAVE ISMAEL! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Testing](#testing)

## Code of Conduct

This project is a personal gift, but we welcome friendly contributions. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js 18+ (Node.js 20 recommended)
- npm 9+
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/terror-in-dubai.git
   cd terror-in-dubai
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/ismaelloveexcel/terror-in-dubai.git
   ```

## Development Setup

### Install Dependencies

```bash
# Install all dependencies (root, client, and server)
npm run install:all
```

### Start Development Servers

```bash
# Run both client and server in development mode
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Client (Vite dev server)
cd client
npm run dev

# Terminal 2 - Server (Express with nodemon)
cd server
npm run dev
```

### Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

See `.env.example` for available configuration options.

## Making Changes

### Branch Naming

Use descriptive branch names:

- `feature/add-new-enemy` - New features
- `fix/player-health-bug` - Bug fixes
- `docs/update-readme` - Documentation
- `refactor/weapon-system` - Code refactoring

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(enemies): add new Demobat attack pattern
fix(player): correct health regeneration timing
docs(readme): update deployment instructions
```

## Pull Request Process

1. **Update your fork**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make your changes** and commit them

4. **Test your changes**:
   ```bash
   # Build the client
   npm run build
   
   # Start the server and test
   npm start
   ```

5. **Push and create a PR**:
   ```bash
   git push origin feature/your-feature
   ```

6. Fill out the pull request template completely

7. Wait for review and address any feedback

## Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new client code
- Use ES modules (`import`/`export`)
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for public APIs

```typescript
/**
 * Calculates damage based on weapon and distance
 * @param weapon - The weapon being used
 * @param distance - Distance to target in units
 * @returns Calculated damage value
 */
function calculateDamage(weapon: WeaponConfig, distance: number): number {
    // Implementation
}
```

### React Components

- Use functional components with hooks
- Use TypeScript interfaces for props
- Keep components focused and small

```typescript
interface EnemyHealthBarProps {
    current: number;
    max: number;
    showLabel?: boolean;
}

const EnemyHealthBar: React.FC<EnemyHealthBarProps> = ({ 
    current, 
    max, 
    showLabel = true 
}) => {
    // Implementation
};
```

### CSS

- Use CSS custom properties for theming
- Follow the existing Stranger Things-inspired color scheme
- Mobile-first approach

### File Organization

```
client/src/
├── config/          # Game configuration
├── core/            # Core systems (Game, Audio, Input, Save)
├── enemies/         # Enemy classes and behaviors
├── levels/          # Level implementations
├── player/          # Player controller, weapons, health
├── ui/              # UI components and HUD
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Testing

### Manual Testing

Before submitting a PR, test:

1. **Build succeeds**: `npm run build`
2. **Server starts**: `npm start`
3. **Health check passes**: `curl http://localhost:3001/api/health`
4. **Game loads** in browser
5. **All levels** are accessible
6. **Mobile controls** work (use browser dev tools)

### Automated Testing

Run the CI checks locally:

```bash
# Lint (if configured)
cd client && npm run lint

# Build
npm run build
```

## Project Structure

### Client Architecture

The game uses Babylon.js for 3D rendering:

- **Game.ts** - Main game orchestrator
- **SceneManager.ts** - Babylon.js scene setup
- **LevelManager.ts** - Level loading and transitions
- **EnemyManager.ts** - Enemy spawning and management
- **PlayerController.ts** - Player movement and input

### Server Architecture

Express.js server with:

- Static asset serving for GLB models
- API endpoints for game data
- Health checks for monitoring
- Security middleware (Helmet, rate limiting)

## Getting Help

- Check existing issues and discussions
- Review the README and documentation
- Open a GitHub Discussion for questions

## Recognition

Contributors will be acknowledged in the README. Thank you for helping make SAVE ISMAEL better!

---

**Happy coding! 🎮**

*Made with ❤️ for Aidan*
