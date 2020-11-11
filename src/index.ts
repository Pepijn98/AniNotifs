import "./extensions";

import settings from "./settings";
import chalk from "chalk";
import path from "path";
import Collection from "@kurozero/collection";
import FeedEmitter from "rss-feed-emitter";
import Feeds from "./feeds";
import { promises as fs } from "fs";
import { Client, TextChannel } from "eris";
import { Command, FeedError, FeedItem, Imported } from "./types";
import { intents, isGuildChannel } from "./utils";

let ready = false;

const emitter = new FeedEmitter({
    skipFirstLoad: true
});

const client = new Client(settings.token, {
    autoreconnect: true,
    compress: true,
    getAllUsers: true,
    restMode: true,
    defaultImageFormat: "webp",
    defaultImageSize: 2048,
    intents: intents
});

const feeds = new Feeds(client);

for (const feed of settings.feeds) {
    emitter.on(feed.eventName, (item: FeedItem) => feeds[feed.eventName](item));
}

emitter.on("error", (error: FeedError) => {
    console.error(chalk.bold.redBright(`Error: ${error.name} (${error.feed})`) + "\n" + error.message);
});

emitter.add(...settings.feeds);

client.on("ready", async () => {
    if (!ready) {
        client.commands = new Collection(Command);
        const commandDir = path.join(__dirname, "commands");
        const files = await fs.readdir(commandDir);
        for (const file of files) {
            if (/\.(j|t)s$/iu.test(file)) {
                const commandPath = path.join(commandDir, file);
                try {
                    const { command } = (await import(commandPath)) as Imported;
                    if (client.commands.contains(command)) {
                        return console.warn(`[COMMAND_HANDLER] |> A command with the name ${command.name} already exists and has been skipped`);
                    }
                    client.commands.add(command);
                    console.info(`[COMMAND_HANDLER] |> Loaded command ${command.name}`);
                } catch (e) {
                    console.warn(`[COMMAND_HANDLER] |> ${commandPath} - ${e.stack}`);
                }
            }
        }

        console.log(`[INIT] |>\n${emitter.list.map((item) => `   ${item.url}`).join("\n")}`);
    }
    ready = true;
});

client.on("messageCreate", async (msg) => {
    if (!ready) return; // Bot not ready yet
    if (!msg.author) return; // Probably system message
    if (msg.author.discriminator === "0000") return; // Probably a webhook
    if (msg.author.id === client.user.id) return; // Ignore self
    if (!isGuildChannel(msg.channel)) return; // Ignore all DMs

    if (msg.content.startsWith(settings.prefix)) {
        const parts = msg.content.split(" ");
        const name = parts[0].slice(settings.prefix.length);
        const args = parts.splice(1);
        const context = { client };

        const command = client.commands.find((c) => c.name === name || c.aliases?.includes(name))?.value;
        if (!command) return;

        try {
            await command.run(msg, args, context);
        } catch (e) {
            console.error(e);
            try {
                await msg.channel.createMessage({
                    embed: {
                        color: 0xdc143c,
                        description: e.toString()
                    }
                });
            } catch (e) {}
        }
    }
});

client.on("messageReactionAdd", async (msg, emoji, member) => {
    if (member.id === settings.owner && msg.channel.id === settings.webhook.channel && emoji.name === "🗑️") {
        const guild = client.guilds.get(settings.guild);
        const channel = guild.channels.get(settings.webhook.channel) as TextChannel;
        const message = channel.messages.get(msg.id) || (await channel.getMessage(msg.id));
        await message.delete();
    }
});

client.on("error", (e: any) => {
    if (e.code === 1001) {
        client.disconnect({ reconnect: true });
    } else {
        console.error(e);
    }
});

process.on("unhandledRejection", (reason) => {
    console.error(`[UNHANDLED_REJECTION] |> ${reason}`);
});

process.on("uncaughtException", (e: any) => {
    console.error(`[UNCAUGHT_EXCEPTION] |> ${e}`);
});

process.on("SIGINT", () => {
    client.disconnect({ reconnect: false });
    process.exit(0);
});

client.connect().catch((e) => console.error(`[CONNECT] |> ${e}`));
