const fs = require("fs");
const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
const { 
    Client,
    IntentsBitField,
    ActivityType,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType,
    PermissionsBitField
} = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
})

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
    client.user.setStatus('idle');
    client.user.setActivity(config.statusMessage, { type: ActivityType.Playing });
});

    client.on('interactionCreate', (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        
        if (interaction.commandName === 'help'){
          const embed = new EmbedBuilder()
          .setAuthor({
            name: "Capy Shop Bot",
            url: "https://github.com/CapyKing10/CapyShopBot",
            iconURL: "https://cdn.discordapp.com/attachments/1141097646686216264/1176287266780483675/pfp.png?ex=656e51e2&is=655bdce2&hm=78f43e40da0bf1afaaaa9aae49ca07909c853522ceeeb98f91568bf45465cca5&",
          })
          .setTitle("SHOP HELP")
          .setDescription(`- browse through the store channels and find an item you want\n- goto <#${config.orderChannelId}> and create a ticket\n- tell which item you want\n\n**COMMANDS:**\n- /uptime, see the bots uptime\n- /shopadd, admins only (add item to the shop)\n- /help, this command`)
          .setFooter({
            text: "CapyKing10",
            iconURL: "https://mc-heads.net/avatar/CapyKing10",
          })
          .setTimestamp();
          interaction.reply({ embeds: [embed] });
        }
    });

    client.on('interactionCreate', (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      
      if (interaction.commandName === 'uptime'){
        var uptime = process.uptime();
        const embed = new EmbedBuilder()
          .setTitle(`✅ | uptime: ` + format(uptime))
          .setFooter({
              text: "Capy Shop",
              iconURL: "https://cdn.discordapp.com/avatars/1140154999222059178/5cd3a4c79c374bf07399637ef0805e7d.webp?size=128",
            })
          .setTimestamp();
        interaction.reply({ embeds: [embed] });
      }
    });

    client.on('interactionCreate', async (interaction, user) => {
        if (!interaction.isChatInputCommand()) return;
        
        if (interaction.commandName === 'shopadd'){
            if (interaction.member.permissionsIn(interaction.channel).has(PermissionsBitField.Flags.Administrator)) {
                const name = interaction.options.get('name').value;
                const price = interaction.options.get('price').value;
                const image = interaction.options.get('image').value;
                const channel = interaction.options.get('channel').value;
                const channelToSend = client.channels.cache.get(channel);
              const claim = new ButtonBuilder()
                    .setCustomId('claim')
                    .setLabel('✅ Claim')
                    .setStyle(ButtonStyle.Success);
        
              const claimRow = new ActionRowBuilder()
                    .addComponents(claim);
              
              const embed = new EmbedBuilder()
                .setAuthor({
                name: "CapyKing10",
                })
                .setTitle(`**${name}**`)
                .setDescription("price: " + "`" + price + "`")
                .setImage(`${image}`)
                .setFooter({
                  text: "react with ✅ to claim this item!",
                });
              channelToSend.send({ embeds: [embed], components: [claimRow] });
        
              const embed2 = new EmbedBuilder()
                .setTitle("succesfully added it to the shop");
              interaction.reply({ embeds: [embed2] });
              setTimeout(function() {
                interaction.deleteReply()
              }, 2000);
            } else {
                const embed = new EmbedBuilder()
                .setTitle("❌ |  you dont have permissions to use this command")
                .setColor("#ff0000")
                .setFooter({
                    text: "Capy Shop",
                    iconURL: "https://cdn.discordapp.com/avatars/1140154999222059178/5cd3a4c79c374bf07399637ef0805e7d.webp?size=128",
                  })
                .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
    });

    client.on('interactionCreate', interaction => {
  
        if (!interaction.isButton()) return;
    
        if (interaction.customId == "claim") {
            const embed = new EmbedBuilder()
            .setTitle("✅ | How to claim this kit")
            .setDescription(`- goto <#${config.orderChannelId}> and create a ticket\n- in the ticket, specifie which kit you want\n- we will check if you have enough invites`);
            interaction.reply({ embeds: [embed], ephemeral: true });
        }
    
    });

    function format(seconds){
      function pad(s){
        return (s < 10 ? '0' : '') + s;
      }
      var days = Math.floor(seconds / (60*60*24))
      var hours = Math.floor(seconds / (60*60));
      var minutes = Math.floor(seconds % (60*60) / 60);
      var seconds = Math.floor(seconds % 60);
    
      return pad(days) + ':' + pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
    }

client.login(config.token);
