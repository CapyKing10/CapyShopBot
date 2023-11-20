const { REST, Routes, AnonymousGuild, ApplicationCommandOptionType } = require('discord.js');
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));

const commands = [
    {
        name: 'help',
        description: 'help on the bot and server.',
    },
    {
        name: 'shopadd',
        description: 'add something to the shop',
        options: [
            {
                name: 'name',
                description: 'name',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: 'price',
                description: 'price',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: 'image',
                description: 'image',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: 'channel',
                description: 'channelId',
                type: ApplicationCommandOptionType.String,
                required: true,
            }
        ]
    },
    {
        name: 'uptime',
        description: 'see the uptime of the bot.'
    }
];

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('Registering slash commands...');

        await rest.put(
            Routes.applicationGuildCommands(config.applicationid, config.guildid),
            { body: commands }
        )


        console.log('slash commands were registered succesfully!');
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
})();