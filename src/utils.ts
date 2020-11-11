import { Channel, GuildChannel, Constants } from "eris";
const { Intents } = Constants;

// prettier-ignore
export const intents =
    Intents.guilds |
    Intents.guildMembers |
    Intents.guildEmojis |
    Intents.guildMembers |
    Intents.guildMessages |
    Intents.guildMessageReactions;

export const isGuildChannel = (channel: Channel): channel is GuildChannel => channel instanceof GuildChannel;
