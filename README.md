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
   CLIENT_ID=bot_application_id
   GUILD_ID=discord_server_id
   ```
4. Run `node deploy_commands.js` to load slash commands into your discord server
5. Enable required Discord Intents:
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

## Admin commands

- `/approvechannel` - Set the channel for submissions to be forwarded to for approval
- `/signupchannel` - Set the channel to announce registered members
- `/acceptedchannel` - Set the channel to announced approved submissions

## Mod commands

- `/create-event` `/edit-event` - Create/Edit an event
- `/create-team` `/edit-team` - Create/Edit a team
- `/activate-event` - Activate the event for team commands
- `/register-team` - Register a team for an event

## Public commands

- `/event` - Information for an event and teams
- `/team` - Information for a team and members
- `/register` - Register yourself to the event
- `/status` - Status for yourself

## Event commands (for participants)

- `/submit` - Submit an image to the event

## Usage

1. Setting up event and team
   1. /create-event name: CAKE description: yumyum
   2. /activate-event event: CAKE
   3. /create-team leader: @ruto name: BESTTEAM
      - Note: They must already be in discord
   4. /register-team team: CAKE
2. Other users must now register
   1. /register rsn: noah
3. Mod can now add user to a team
   1. /addmember team: CAKE user: @Noah
