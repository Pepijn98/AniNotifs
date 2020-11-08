import settings from "./settings";
import chalk from "chalk";
import FeedEmitter from "rss-feed-emitter";
import Feeds from "./feeds";
import { FeedError, FeedItem } from "./types";

const emitter = new FeedEmitter({
    skipFirstLoad: true
});

const feeds = new Feeds();

for (const feed of settings.feeds) {
    emitter.on(feed.eventName, (item: FeedItem) => feeds[feed.eventName](item));
}

emitter.on("error", (error: FeedError) => {
    console.error(chalk.bold.redBright(`Error: ${error.name} (${error.feed})`) + "\n" + error.message);
});

emitter.add(...settings.feeds);

console.log(`[INIT] |>\n${emitter.list.map((item) => `   ${item.url}`).join("\n")}`);
