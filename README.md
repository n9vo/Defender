# Defender

Defender is a simple open-source Discord bot designed to provide robust security utilities and functionalities for your server. It is free to use for anyone.

## Features

- **Anti Webhook Spam**: Efficiently filters and removes spam messages.
- **Moderation Tools**: Includes moderation tools for administrators to manage user behavior.
- **Logging**: Logs important events and actions for review and analysis.

## Installation

To get started with Defender, clone the repository and install the dependencies:

```bash
git clone https://github.com/nevolua/Defender.git
cd Defender
npm install
```

## Creating and Inviting the Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click "New Application" and name your bot.
3. Under the "Bot" section, click "Add Bot" and confirm.
4. Copy the bot token. You will need this for the configuration.
5. Go to the "OAuth2" section, then "URL Generator". Select `bot` and `applications.commands` scopes. Under "Bot Permissions", select the necessary permissions for your bot.
6. Copy the generated URL, paste it into your browser, and invite the bot to your server.

## Configuration

Edit the `config.json` file to set up your desired configurations. Here is an example configuration:

```json
{
    "clientId": "YOUR_CLIENT_ID",
    "guildId": "YOUR_GUILD_ID",
    "token" : "YOUR_BOT_TOKEN",
    "webhook_whitelist": ["WEBHOOK_URL"],
    "admins": ["ADMIN_USER_IDS"],
    "log_channel": "LOG_CHANNEL_ID"
}
```

- `clientId`: Your Discord bot client ID.
- `guildId`: Your Discord server ID.
- `token`: Your Discord bot token.
- `webhook_whitelist`: List of webhook URLs allowed to interact with the bot.
- `admins`: List of user IDs with admin privileges.
- `log_channel`: Channel ID where logs are sent.

## Usage

### Running the Application

You can start the application using:

```bash
node index.js
```

## File Structure

- `.github/workflows`: GitHub workflows for CI/CD.
- `commands/utility`: Utility commands for various operations.
- `config.json`: Configuration file for the application.
- `deploy.js`: Deployment script.
- `index.js`: Main entry point of the application.
- `package.json`: Project dependencies and metadata.
- `utils.js`: Utility functions used across the application.

## Contributing

We welcome contributions from the community. Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please open an issue on the GitHub repository.
