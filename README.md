# OSP Event Bot


## Prerequisites

- Node.js (v16 or higher)
- Discord Bot Token

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with:
   ```
   DISCORD_TOKEN=your_bot_token_here
   ```
4. Enable required Discord Intents:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Select your application
   - Go to Bot section
   - Enable "SERVER MEMBERS INTENT"

## Running the Bot

```bash
npm start
```

## Development

- Format code: `npm run format`
- Lint code: `npm run lint`
- Fix linting issues: `npm run lint:fix`

## Available Commands

- `/ping` - Bot responds with "Pong!"