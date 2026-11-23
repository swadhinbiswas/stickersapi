import 'dotenv/config';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID || null;
const API_BASE = (process.env.API_BASE || 'https://stickerapi.sbs').replace(/\/+$/, '');

if (!TOKEN || !CLIENT_ID) {
  console.error('Set DISCORD_TOKEN and DISCORD_CLIENT_ID in .env (see .env.example).');
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder()
    .setName('sticker')
    .setDescription('Find a Discord sticker by slug or search text')
    .addStringOption((option) =>
      option.setName('query').setDescription('Sticker slug, name or search text').setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName('pack')
    .setDescription('Show a sticker pack and its ZIP download')
    .addStringOption((option) =>
      option.setName('slug').setDescription('Pack slug, e.g. 7214-best-pepe-pack').setRequired(true),
    ),
  new SlashCommandBuilder().setName('random').setDescription('Show a random sticker'),
  new SlashCommandBuilder()
    .setName('pfp')
    .setDescription('Show a Discord profile picture from pfps.gg')
    .addStringOption((option) =>
      option.setName('slug').setDescription('PFP slug, e.g. 11334-cat').setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName('banner')
    .setDescription('Show a Discord profile banner from pfps.gg')
    .addStringOption((option) =>
      option.setName('slug').setDescription('Banner slug, e.g. 24766-254701-tsuki').setRequired(true),
    ),
];

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function api(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { accept: 'application/json' } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || `API returned ${res.status}`);
  return data;
}

function absolute(path) {
  return /^https?:\/\//i.test(path) ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

function linkRow(...buttons) {
  return new ActionRowBuilder().addComponents(...buttons);
}

function linkButton(label, url) {
  return new ButtonBuilder().setLabel(label).setStyle(ButtonStyle.Link).setURL(absolute(url));
}

function stickerEmbed(sticker) {
  return new EmbedBuilder()
    .setTitle(sticker.name)
    .setDescription(sticker.description || 'Discord sticker from stickers.gg')
    .setImage(absolute(sticker.image))
    .setURL(`https://stickerapi.sbs/sticker/${sticker.slug}`)
    .addFields(
      { name: 'Type', value: sticker.type || 'unknown', inline: true },
      { name: 'Size', value: sticker.size || 'unknown', inline: true },
      { name: 'Downloads', value: String(sticker.downloads ?? 0), inline: true },
    )
    .setFooter({ text: 'StickersAPI' });
}

async function findSticker(query) {
  if (/^[a-z0-9][a-z0-9-]*$/i.test(query)) {
    try {
      return { sticker: await api(`/api/sticker/${encodeURIComponent(query)}`) };
    } catch (err) {
      if (err.status !== 404) throw err;
    }
  }
  const results = await api(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
  return { results: results.items || [] };
}

async function handleSticker(interaction) {
  const query = interaction.options.getString('query', true);
  await interaction.deferReply();
  const found = await findSticker(query);

  if (found.sticker) {
    const sticker = found.sticker;
    await interaction.editReply({
      embeds: [stickerEmbed(sticker)],
      components: [linkRow(linkButton('Download', sticker.download), linkButton('Open page', `/sticker/${sticker.slug}`))],
    });
    return;
  }

  if (!found.results.length) {
    await interaction.editReply({ content: `No stickers found for **${query}**.` });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(`Sticker results for "${query}"`)
    .setDescription(
      found.results
        .map((item) => `[${item.name}](https://stickerapi.sbs/sticker/${item.slug}) - [download](${absolute(item.download)})`)
        .join('\n'),
    )
    .setFooter({ text: 'StickersAPI' });
  await interaction.editReply({ embeds: [embed] });
}

async function handlePack(interaction) {
  const slug = interaction.options.getString('slug', true);
  await interaction.deferReply();
  const pack = await api(`/api/pack/${encodeURIComponent(slug)}`);
  const embed = new EmbedBuilder()
    .setTitle(pack.name)
    .setDescription(pack.description || 'Sticker pack from stickers.gg')
    .setURL(`https://stickerapi.sbs/pack/${pack.slug}`)
    .addFields(
      { name: 'Stickers', value: String(pack.count), inline: true },
      { name: 'ZIP', value: pack.count <= 48 ? 'available' : 'over the 48-sticker cap', inline: true },
    )
    .setFooter({ text: 'StickersAPI' });
  if (pack.stickers?.[0]?.image) embed.setImage(absolute(pack.stickers[0].image));
  const components = [linkButton('Open page', `/pack/${pack.slug}`)];
  if (pack.count <= 48) components.unshift(linkButton('Download ZIP', `/api/pack/${pack.slug}/download`));
  await interaction.editReply({ embeds: [embed], components: [linkRow(...components)] });
}

async function handleRandom(interaction) {
  await interaction.deferReply();
  const sticker = await api('/api/sticker/random');
  await interaction.editReply({
    embeds: [stickerEmbed(sticker)],
    components: [linkRow(linkButton('Download', sticker.download), linkButton('Open page', `/sticker/${sticker.slug}`))],
  });
}

async function handlePfp(interaction) {
  const slug = interaction.options.getString('slug', true);
  await interaction.deferReply();
  const pfp = await api(`/api/pfp/${encodeURIComponent(slug)}`);
  const embed = new EmbedBuilder()
    .setTitle(`${pfp.name} PFP`)
    .setDescription(pfp.author ? `By ${pfp.author}` : 'Discord profile picture from pfps.gg')
    .setImage(absolute(pfp.image))
    .setURL(`https://stickerapi.sbs/pfp/${pfp.slug}`)
    .setFooter({ text: 'StickersAPI' });
  await interaction.editReply({
    embeds: [embed],
    components: [linkRow(linkButton('Download PFP', pfp.download), linkButton('Open page', `/pfp/${pfp.slug}`))],
  });
}

async function handleBanner(interaction) {
  const slug = interaction.options.getString('slug', true);
  await interaction.deferReply();
  const banner = await api(`/api/banner/${encodeURIComponent(slug)}`);
  const embed = new EmbedBuilder()
    .setTitle(`${banner.name} banner`)
    .setDescription(banner.author ? `By ${banner.author}` : 'Discord profile banner from pfps.gg')
    .setImage(absolute(banner.image))
    .setURL(`https://stickerapi.sbs/banner/${banner.slug}`)
    .setFooter({ text: 'StickersAPI' });
  await interaction.editReply({
    embeds: [embed],
    components: [linkRow(linkButton('Download banner', banner.download), linkButton('Open page', `/banner/${banner.slug}`))],
  });
}

async function registerCommands(client) {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  const body = commands.map((command) => command.toJSON());
  const route = GUILD_ID
    ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
    : Routes.applicationCommands(CLIENT_ID);
  await rest.put(route, { body });
  console.log(`Registered ${body.length} commands ${GUILD_ID ? `in guild ${GUILD_ID}` : 'globally'}.`);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
  try {
    await registerCommands(readyClient);
  } catch (err) {
    console.error('Command registration failed:', err.message);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  try {
    if (interaction.commandName === 'sticker') await handleSticker(interaction);
    else if (interaction.commandName === 'pack') await handlePack(interaction);
    else if (interaction.commandName === 'random') await handleRandom(interaction);
    else if (interaction.commandName === 'pfp') await handlePfp(interaction);
    else if (interaction.commandName === 'banner') await handleBanner(interaction);
  } catch (err) {
    console.error(`${interaction.commandName} failed:`, err.message);
    const message = err instanceof ApiError && err.status === 404
      ? 'Nothing found. Check the slug and try again.'
      : 'Something went wrong. Try again in a moment.';
    if (interaction.deferred || interaction.replied) await interaction.editReply({ content: message, embeds: [], components: [] });
    else await interaction.reply({ content: message, ephemeral: true });
  }
});

client.login(TOKEN);
