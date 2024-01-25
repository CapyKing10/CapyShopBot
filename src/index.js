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
    PermissionsBitField,
    Embed,
    ChannelType,
    PermissionFlagsBits,
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

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'shop') {
    if (interaction.options.getSubcommand() === 'add') {
    const member = interaction.guild.members.cache.get(interaction.user.id);
    if (member && member.roles.cache.has(config.ownerId) || interaction.user.id === '1140154999222059178') {
      const name = options.getString('name');
      const price = options.getString('price');
      const image = options.getAttachment('image').url;
      const channel = options.getChannel('channel');
      const addCart = new ButtonBuilder()
            .setCustomId('addCart_' + name + '_' + price)
            .setLabel('🛒 Add to cart')
            .setStyle(ButtonStyle.Success);

      const removeCart = new ButtonBuilder()
            .setCustomId('removeCart_' + name + '_' + price)
            .setLabel('🗑️ Remove from cart')
            .setStyle(ButtonStyle.Danger);

      const claimRow = new ActionRowBuilder()
            .addComponents(addCart, removeCart);
      
      const embed = new EmbedBuilder()
        .setTitle(`**${name}**`)
        .setDescription('price: ' + '`' + price + '`')
        .setImage(`${image}`)
        .setColor(config.color)
        .setFooter({
          text: config.itemEmbedFooter,
        });
      channel.send({ embeds: [embed], components: [claimRow] });

      const embed2 = new EmbedBuilder()
      .setColor(config.color)
      .setTitle(config.shopAdd)
      .setFooter({
        text: config.footer,
        iconURL: config.logo,
      })
      .setTimestamp();
      interaction.reply({ embeds: [embed2], ephemeral: true });

      } else {
        const embed = new EmbedBuilder()
        .setTitle(config.noPermissions)
        .setColor(config.errorColor)
        .setFooter({
            text: config.footer,
            iconURL: config.logo,
          })
        .setTimestamp();
        interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }

  if (commandName === 'cart') {
    const filepath = `./data/carts/${interaction.user.username}.txt`;
        fs.readFile(filepath, 'utf8', (err, data) => {
          if (!fs.existsSync(filepath) || !data) {
            const embed = new EmbedBuilder()
            .setColor(config.errorColor)
            .setTitle(config.noCart)
            interaction.reply({ embeds: [embed], ephemeral: true });
          } else {
            const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle(config.cart)
            .setDescription(data + '\n ---------------------------------------------------------------------')
            .setFooter({
              text: config.footer,
              iconURL: config.logo,
            })
            .setTimestamp();
            interaction.reply({ embeds: [embed], ephemeral: true });
          }
          if (err) {
            console.error(`Error reading file: ${err.message}`);
            return;
          }
        })
    }}

    if (commandName === 'wipe-cart') {
      const filepath = `./data/carts/${interaction.user.username}.txt`;
      if (fs.existsSync(filepath)) {
        deleteFileContents(filepath);
        const embed = new EmbedBuilder()
        .setTitle(config.cartWipe)
        .setColor(config.color)
        interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        const embed = new EmbedBuilder()
        .setTitle(config.noCart)
        .setColor(config.errorColor)
        interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }

    function deleteFileContents(filePath) {
        fs.writeFileSync(filePath, '');
    }

    if (commandName === 'invites') {
      const user = options.getUser('user');
      if (user) {
        let invites = await interaction.guild.invites.fetch();
        let userInv = invites.filter(u => u.inviter && u.inviter.id === user.id);
        let i = 0;
        userInv.forEach(inv => i += inv.uses);
            const embed = new EmbedBuilder()
            .setColor(config.color)
            .setDescription(`${user.tag} has **${i}** invites!`)
            .setFooter({
              text: config.footer,
              iconURL: config.logo,
            })
            .setTimestamp();
        interaction.reply ({ embeds: [embed] });
      } else {
        const user = interaction.user;
        let invites = await interaction.guild.invites.fetch();
        let userInv = invites.filter(u => u.inviter && u.inviter.id === user.id);
        let i = 0;
        userInv.forEach(inv => i += inv.uses);
            const embed = new EmbedBuilder()
            .setColor(config.color)
            .setDescription(`${user.tag} has **${i}** invites!`)
            .setFooter({
              text: config.footer,
              iconURL: config.logo,
            })
            .setTimestamp();
        interaction.reply ({ embeds: [embed] });
      }
      
    }

    if (commandName === 'order') {
      const ign = options.getString('ign');
      createTicket(interaction, ign);
      const embed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle(config.createTicket)
      .setDescription(`#ticket-${interaction.user.username}`)
      interaction.reply({ embeds: [embed], ephemeral: true });
    }
})
  async function createTicket(interaction, ign) {
      const { ViewChannel } = PermissionFlagsBits;
      interaction.guild.channels.create({
        name: "ticket-" + interaction.user.username,
        type: ChannelType.GuildText,
        parent: config.ticketCatagory,
        permissionOverwrites: [
          {
            id: interaction.user.id,
            allow: [ViewChannel]
          },
          {
            id: config.ticketView,
            allow: [ViewChannel]
          },
          {
            id: config.memberRole,
            deny: [ViewChannel]
          },
        ]
      }).then(channel => {
        const channelToSend = client.channels.cache.get(channel.id);
        const filepath = `./data/carts/${interaction.user.username}.txt`;
        fs.readFile(filepath, 'utf8', async (err, data) => {
          if (!fs.existsSync(filepath) || !data) {
            const closeTicket = new ButtonBuilder()
            .setCustomId('closeTicket_' + channel.id)
            .setLabel('🗑️ Close Ticket')
            .setStyle(ButtonStyle.Danger);

            const Row = new ActionRowBuilder()
            .setComponents(closeTicket);

            const embed = new EmbedBuilder()
            .setTitle(config.noUserCart)
            .setColor(config.errorColor)
            channelToSend.send({ embeds: [embed], components: [Row] });
          } else {
            const finishOrder = new ButtonBuilder()
            .setCustomId('finishOrder_' + channel.id + '_' + interaction.user.id)
            .setLabel('✔️ Finish Order')
            .setStyle(ButtonStyle.Success);

            const closeTicket = new ButtonBuilder()
            .setCustomId('closeTicket_' + channel.id)
            .setLabel('🗑️ Close Ticket')
            .setStyle(ButtonStyle.Danger);

            const Row = new ActionRowBuilder()
            .setComponents(finishOrder, closeTicket);

            const invites = await getInvites(interaction, interaction.user)

            const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle(`${interaction.user.username}`)
            .setDescription(`📕 **support will be with you shortly!** \n\n 🛒 **cart**: \n ${data} \n 🧱 **in game name**: \n ${ign} \n\n 🎫 **invites:** \n ${invites}`)
            .setThumbnail(config.logo)
            .setFooter({
              text: config.footer,
              iconURL: config.logo,
            })
            .setTimestamp();
            channelToSend.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [Row] });
          }
          if (err) {
            console.error(`Error reading file: ${err.message}`);
            return;
          }
        })
      })
    }

    client.on('interactionCreate', async interaction => {
  
      if (!interaction.isButton()) return;
    
      if (interaction.customId.startsWith('addCart_')) {
        const args = splitCustomId(interaction.customId);
        const name = args[1];
        const price = args[2];
        const cartFilePath = `./data/carts/${interaction.user.username}.txt`;

        if (!fs.existsSync(cartFilePath)) {
          fs.writeFileSync(cartFilePath, `${name} [**${price}**]\n`)
        } else {
          fs.appendFileSync(cartFilePath, `${name} [**${price}**]\n`)
        };


        const embed = new EmbedBuilder()
          .setTitle(`${config.addCart}`)
          .setDescription(config.viewCart)
          .setColor(config.color)
          .setFooter({
            text: config.footer,
            iconURL: config.logo,
          })
          .setTimestamp();
        interaction.reply({ embeds: [embed], ephemeral: true });
      };

      if (interaction.customId.startsWith('removeCart_')) {
        const args = splitCustomId(interaction.customId);
        const name = args[1];
        const price = args[2]
        const filepath = `./data/carts/${interaction.user.username}.txt`;

        removeLineFromFile(filepath, `${name} [**${price}**]`);

        const embed = new EmbedBuilder()
        .setTitle(`${config.removeCart}`)
        .setDescription(config.viewCart)
        .setColor(config.color)
        .setFooter({
          text: config.footer,
          iconURL: config.logo,
        })
        .setTimestamp();
        interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (interaction.customId.startsWith('closeTicket_')) {
        const channelId = removeString(interaction.customId, 'closeTicket_');
        const confirm = new ButtonBuilder()
        .setCustomId('confirm_' + channelId)
        .setLabel('🗑️ Confirm')
        .setStyle(ButtonStyle.Danger);
        const Row = new ActionRowBuilder()
        .addComponents(confirm);
        interaction.reply({ components: [Row] });

        client.on('interactionCreate', interaction => {
          if (!interaction.isButton()) return;
          if(interaction.customId.startsWith('confirm_')) {
            const channelId = removeString(interaction.customId, 'confirm_');
            const channelToDelete = client.channels.cache.get(channelId);

            if (channelToDelete) {
              channelToDelete.delete()
            }
          }
        })
      };

      if (interaction.customId.startsWith('finishOrder_')) {
        const role = await interaction.guild.roles.fetch(config.ticketView);
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (member && member.roles.cache.has(role.id)) {
        const args = splitCustomId(interaction.customId);
        const channelId = args[1]
        const userId = args[2]
        const channelToDelete = client.channels.cache.get(channelId);
        const guild = client.guilds.cache.get(interaction.guild.id);

        if (channelToDelete) {
          channelToDelete.delete()
        }

        giveRole(interaction, userId, config.claimedRole, guild)

      } else {
        const embed = new EmbedBuilder()
        .setTitle(config.noFinishOrderPerms)
        .setColor(config.errorColor)
        interaction.reply({ embeds: [embed], ephemeral: true });
      }
      };
  });

  async function giveRole(interaction, userId, roleId, guild) {
    const role = await guild.roles.fetch(roleId);
    try {
      await interaction.guild.members.cache.get(userId).roles.add(role)
    } catch(error) {
      console.error('error: ' + error)
    }
  }

  function removeLineFromFile(filePath, searchString) {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        const lines = data.split('\n');
        const filteredLines = lines.filter(line => !line.includes(searchString));
        const updatedContent = filteredLines.join('\n');
        fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
      });
  }

  async function getInvites(interaction, input) {
    const user = input;
    if (user) {
      let invites = await interaction.guild.invites.fetch();
      let userInv = invites.filter(u => u.inviter && u.inviter.id === user.id);
      let i = 0;
      userInv.forEach(inv => i += inv.uses);
      return i;
    }
  }

  function removeString(originalString, substringToRemove) {
    return originalString.replace(substringToRemove, "");
  }

  function splitCustomId(input) {
    const result = input.split('_');
    return result;
  }

client.login(config.token);