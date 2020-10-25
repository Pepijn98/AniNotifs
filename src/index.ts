import settings from "./settings";
import chalk from "chalk";
import git from "git-rev-sync";
import pkg from "@/package.json";
import FeedEmitter from "rss-feed-emitter";
import TurndownService from "turndown";
import { FeedItem, FeedError } from "./types";
import { rversion, anime, avatars } from "./utils";
import { Client } from "eris";

const { executeWebhook } = new Client(null);

const emitter = new FeedEmitter({
    userAgent: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:81.0) Gecko/20100101 Firefox/81.0",
    skipFirstLoad: true
});

const tds = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*"
});

tds.addRule("cite", {
    filter: ["cite"],
    replacement: (content: string) => `*${content}*`
});

emitter.on(settings.feed.eventName, async (item: FeedItem) => {
    let isWatching = false;
    let name = "";
    for (let i = 0; i < anime.length; i++) {
        // Check if the anime is something we're watching and if it isn't a v2, v3... release
        if (item.title.includes(anime[i]) && !item.title.match(rversion)) {
            isWatching = true;
            name = anime[i];
        }
    }

    if (isWatching) {
        const description = tds.turndown(item.description).split("|");
        const urls = description.splice(0, 2);

        console.info(`[NEW] |> ${name}`);
        executeWebhook(settings.id, settings.token, {
            username: "Your daily dose of anime",
            avatarURL: avatars[Math.floor(Math.random() * avatars.length)],
            embeds: [
                {
                    title: `${item.title.match(/\d{2}/giu)?.[0] || "00"} | ${name}`,
                    color: Math.floor(Math.random() * 16777215),
                    url: item.guid,
                    description: `${urls.join("|")}\n${description.join("\n")}`,
                    fields: [
                        {
                            name: "Seeders",
                            value: item["nyaa:seeders"]["#"] || "0",
                            inline: true
                        },
                        {
                            name: "Leechers",
                            value: item["nyaa:leechers"]["#"] || "0",
                            inline: true
                        },
                        {
                            name: "Downloads",
                            value: item["nyaa:downloads"]["#"] || "0",
                            inline: true
                        }
                    ],
                    timestamp: item.pubdate ? item.pubdate.toISOString() : "",
                    footer: {
                        text: `AniNotifs (${pkg.version}) [${git.branch()}@${git.short()}]`
                    }
                }
            ]
        }).catch((e) => {
            console.error(`Error: Failed to send webhook\n${e.stack}`);
        });
    }
});

emitter.on("error", (error: FeedError) => {
    console.error(chalk.bold.redBright(`Error: ${error.name} (${error.feed})`) + "\n" + error.message);
});

emitter.add(settings.feed);

console.log(`[INIT] |> ${emitter.list[0].url}`);
