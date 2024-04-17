import { Client, GatewayIntentBits } from 'discord.js';
import { DiscordInteractions } from 'slash-commands';

import { config } from './config.js';
import { statsCommand, topCommand } from './commands.js';
import { handleInteraction } from './commandHandler.js';
import { database, auth } from './database.js';

// Ensure we sign in to the database
await database.signIn();

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ],
});

export const interactions = new DiscordInteractions({
    applicationId: process.env.APPLICATION_ID,
    authToken: process.env.DISCORD_TOKEN,
    publicKey: process.env.PUBLIC_KEY,
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("guildAvailable", async (guild) => {
  console.log(`Guild available: ${guild.name} (${guild.id})`);
  
  // Get the connections channel if available
  // First check firestore for the connections channel id
  const connectionsChannelId = await database.getConnectionsChannel(guild.id);
  var connectionsChannel = null;
  if (connectionsChannelId !== null) {
    connectionsChannel = guild.channels.cache.get(connectionsChannelId);
  }
  if (connectionsChannel === null) {
    // If it is not available, check the guild for the channel
    var connectionsChannel = null;
    const channels = guild.channels.cache.map(channels => channels);
    for (let channel of channels){
      if (channel.name.startsWith("connections")){
        connectionsChannel = channel;
        console.log("Connections channel id: " + connectionsChannel);
      }
    }
    // If no channel was found, lets create on
    if (connectionsChannel === null) {
      guild.channels.create("connections-🟨🟩🟦🟪", { type: "GUILD_TEXT" })
        .then(channel => {
          console.log("Connections channel created: " + channel);
          connectionsChannel = channel;
        })
        .catch(console.error);
    }

    // Store the connections channel id for this guild
    await database.setConnectionsChannel(guild.id, connectionsChannel.id);
  }
});

client.on("interactionCreate", async (interaction) => {
  handleInteraction(interaction, client);
});

export const start = async () => {
  // Register the commands
  await interactions.createApplicationCommand(statsCommand)
  await interactions.createApplicationCommand(topCommand)
  // Login the bot to discord
  client.login(config.discordToken);
};
