const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
const rest = new REST({ version: '10' }).setToken(config.token);

const commands = [
    new SlashCommandBuilder()
      .setName('cart')
      .setDescription('view your cart'),

    new SlashCommandBuilder()
      .setName('wipe-cart')
      .setDescription('remove every item from your cart'),

    new SlashCommandBuilder()
        .setName('order')
        .setDescription('create a ticket and order')
        .addStringOption(option => option.setName('ign').setDescription('your in game name').setRequired(true)),
        
        new SlashCommandBuilder()
        .setName('shop')
        .setDescription('shop parent command')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('add an item to the shop')
                .addStringOption(option => option.setName('name').setDescription('name').setRequired(true))
                .addStringOption(option => option.setName('price').setDescription('price').setRequired(true))
                .addAttachmentOption(option => option.setName('image').setDescription('image').setRequired(true))
                .addChannelOption(option => option.setName('channel').setDescription('channel').setRequired(true))),

    new SlashCommandBuilder()
        .setName('invites')
        .setDescription('Gets a users server invite count.')
        .addUserOption (option => option.setName('user').setDescription('user you want the invites of').setRequired(false)),
].map(command => command.toJSON());


(async () => {
  try {
      console.log('Started refreshing application (/) commands.');

      const clientId = config.applicationid;

      await rest.put(
          Routes.applicationCommands(clientId),
          { body: commands },
      );

      console.log('Successfully reloaded application (/) commands globally.');
  } catch (error) {
      console.error(error);
  }
})();