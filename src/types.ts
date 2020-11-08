// Since rss-feed-emitter has horrible ungly bad types I'll use my own

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

export interface Settings {
    id: string;
    token: string;
    feeds: FeedConfig[];
    anime: string[];
    exceptions: string[];
    avatars: string[];
}
