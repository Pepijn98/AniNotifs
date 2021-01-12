// Since rss-feed-emitter has horrible ungly bad types I'll use my own

import { Client, Message } from "eris";
import { Item, Meta, Image, Enclosure } from "feedparser";

export interface FeedConfig {
    url: string;
    eventName: string;
    refresh: number;
    userAgent?: string;
}

export interface FeedItem extends Item {
    title: string;
    description: string;
    summary: string;
    date: Date | null;
    pubdate: Date | null;
    link: string;
    origlink: string;
    author: string;
    guid: string;
    comments: string;
    image: Image;
    categories: string[];
    enclosures: Enclosure[];
    meta: Meta;
    [x: string]: any;
}

export declare class FeedError extends Error {
    type: string;
    message: string;
    feed: string;
    constructor(type: string, message: string, feed?: string);
}

export interface Webhook {
    id: string;
    token: string;
    channel: string;
}

export interface Settings {
    prefix: string;
    owner: string;
    guild: string;
    id: string;
    token: string;
    webhook: Webhook;
    feeds: FeedConfig[];
    avatars: string[];
}

export interface ValidateFeed {
    watching: boolean;
    name: string;
}

export interface CommandContext {
    client: Client;
}

export interface Command {
    name: string;
    aliases?: string[];
    run(msg: Message, args: string[], context: CommandContext): Promise<unknown>;
}

export abstract class Command implements Command {}

export interface Imported {
    command: Command;
}
