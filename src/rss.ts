
import { XMLParser } from "fast-xml-parser";

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const response = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status}`);
  }

  const xmlData = await response.text();

  const parser = new XMLParser({
    processEntities: false,
  });

  const parsedData: unknown = parser.parse(xmlData);

  if (
    typeof parsedData !== "object" ||
    parsedData === null ||
    !("rss" in parsedData) ||
    typeof parsedData.rss !== "object" ||
    parsedData.rss === null ||
    !("channel" in parsedData.rss) ||
    typeof parsedData.rss.channel !== "object" ||
    parsedData.rss.channel === null
  ) {
    throw new Error("Invalid RSS feed: channel is missing");
  }

  const channel = parsedData.rss.channel;

  if (
    !("title" in channel) ||
    !isString(channel.title) ||
    !("link" in channel) ||
    !isString(channel.link) ||
    !("description" in channel) ||
    !isString(channel.description)
  ) {
    throw new Error("Invalid RSS feed: channel metadata is missing");
  }

  let items: unknown[] = [];

  if ("item" in channel && channel.item != null) {
    items = Array.isArray(channel.item)
      ? channel.item
      : [channel.item];
  }

  const validItems: RSSItem[] = [];

  for (const item of items) {
    if (typeof item !== "object" || item === null) {
      continue;
    }

    if (
      !("title" in item) ||
      !isString(item.title) ||
      !("link" in item) ||
      !isString(item.link) ||
      !("description" in item) ||
      !isString(item.description) ||
      !("pubDate" in item) ||
      !isString(item.pubDate)
    ) {
      continue;
    }

    validItems.push({
      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate,
    });
  }

  return {
    channel: {
      title: channel.title,
      link: channel.link,
      description: channel.description,
      item: validItems,
    },
  };
}
