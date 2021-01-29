import git from "git-rev-sync";
import settings from "./settings";
import pkg from "@/package.json";
import TurndownService from "turndown";
import { Client } from "eris";
import { FeedItem, ValidateFeed } from "./types";
import { shows, exceptions } from "./anime.json";

// matches anything between v2 and vInfinity
const rversion = /v([1-9]\d+|[2-9])/iu;

abstract class IndexSignature {
    [k: string]: any;
    [k: number]: undefined;
}

export default class Feeds extends IndexSignature {
    client: Client;
    tds: TurndownService;

    constructor(client: Client) {
        super();

        this.client = client;
        this.tds = new TurndownService({
            headingStyle: "atx",
            bulletListMarker: "-",
            codeBlockStyle: "fenced",
            emDelimiter: "*"
        });

        this.tds.addRule("cite", {
            filter: ["cite"],
            replacement: (content: string) => `*${content}*`
        });
    }

    private validate(item: FeedItem): ValidateFeed {
        let watching = false;
        let name = "";

        for (const anime of shows) {
            // Check if the anime is something we're watching and if it isn't a v2, v3... release
            if (item.title.includes(anime) && !item.title.match(rversion)) {
                watching = true;
                name = anime;
            }
        }

        return {
            watching,
            name
        };
    }

    private async sendWebhook(item: FeedItem, name: string): Promise<void> {
        const description = this.tds.turndown(item.description).split("|");
        const urls = description.splice(0, 2);

        const numbers = item.title.match(/\d{2,3}/giu) || ["00", "00"];
        const episode = exceptions.includes(name) ? numbers[1] : numbers[0];

        console.info(`[NEW] |> ${name.replaceAll("_", " ")}`);
        try {
            const message = await this.client.executeWebhook(settings.webhook.id, settings.webhook.token, {
                wait: true,
                username: "Your daily dose of anime",
                avatarURL: settings.avatars[Math.floor(Math.random() * settings.avatars.length)],
                embeds: [
                    {
                        title: `${episode} | ${name.replaceAll("_", " ")}`,
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
            });
            message.addReaction("🗑️");
        } catch (e) {
            console.error(`Error: Failed to send webhook\n${e.stack}`);
        }
    }

    async subsplease(item: FeedItem): Promise<void> {
        const { watching, name } = this.validate(item);
        if (watching) {
            this.sendWebhook(item, name);
        }
    }

    async pokemon(item: FeedItem): Promise<void> {
        const { watching, name } = this.validate(item);
        if (watching) {
            this.sendWebhook(item, name);
        }
    }
}
