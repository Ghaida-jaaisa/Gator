
import { db } from "../index.js";
import { eq, and} from "drizzle-orm";
import { feedFollows, feeds, users } from "../schema.js";

export async function createFeed(
  name: string,
  url: string,
  userId: string
) {
  const [feed] = await db
    .insert(feeds)
    .values({
      name,
      url,
      userId,
    })
    .returning();

  return feed;
}

export async function getFeeds() {
  return await db
    .select({
      name: feeds.name,
      url: feeds.url,
      userName: users.name,
    })
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));
}

export async function getFeedByUrl(url: string) {
  const [feed] = await db
    .select()
    .from(feeds)
    .where(eq(feeds.url, url));

  return feed;
}

export async function createFeedFollow(
  userId: string,
  feedId: string,
) {
  const [newFeedFollow] = await db
    .insert(feedFollows)
    .values({ userId, feedId })
    .returning();

  const [result] = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      userId: feedFollows.userId,
      feedId: feedFollows.feedId,
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.id, newFeedFollow.id));

  return result;
}

export async function getFeedFollowsForUser(userId: string) {
  return await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      userId: feedFollows.userId,
      feedId: feedFollows.feedId,
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId));
}


export async function deleteFeedFollow(userId: string, feedUrl: string) {
  const feed = await getFeedByUrl(feedUrl);

  if (!feed) {
    throw new Error(`Feed not found: ${feedUrl}`);
  }

  const [deletedFollow] = await db
    .delete(feedFollows)
    .where(
      and(
        eq(feedFollows.userId, userId),
        eq(feedFollows.feedId, feed.id),
      ),
    )
    .returning();

  if (!deletedFollow) {
    throw new Error("You are not following this feed");
  }
}
