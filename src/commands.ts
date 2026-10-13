
import { setUser, readConfig } from "./config.js";
import {
  createUser,
  getUserByName,
  deleteAllUsers,
  getUsers
} from "./lib/db/queries/users.js";
import { fetchFeed } from "./rss.js";
import type { Feed, User } from "./lib/db/schema.js";
import {   createFeed,
  getFeeds,
  getFeedByUrl,
  createFeedFollow,
  getFeedFollowsForUser, deleteFeedFollow} from "./lib/db/queries/feeds.js";


export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;

export type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

export function middlewareLoggedIn(
  handler: UserCommandHandler,
): CommandHandler {
  return async (cmdName, ...args) => {
    const config = readConfig();

    if (!config.currentUserName) {
      throw new Error("No user is currently logged in");
    }

    const user = await getUserByName(config.currentUserName);

    if (!user) {
      throw new Error(`User ${config.currentUserName} not found`);
    }

    await handler(cmdName, user, ...args);
  };
}

export type CommandsRegistry = Record<string, CommandHandler>;

export function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler
): void {
  registry[cmdName] = handler;
}

export async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const handler = registry[cmdName];

  if (!handler) {
    throw new Error(`Unknown command: ${cmdName}`);
  }

  await handler(cmdName, ...args);
}

export async function handlerRegister(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error("Username is required");
  }

  if (args.length > 1) {
    throw new Error("Register accepts only one username");
  }

  const username = args[0];
  const existingUser = await getUserByName(username);

  if (existingUser) {
    throw new Error(`User already exists: ${username}`);
  }

  const user = await createUser(username);

  setUser(username);

  console.log(`User created successfully: ${username}`);
  console.log(user);
}

export async function handlerLogin(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error("Username is required");
  }

  if (args.length > 1) {
    throw new Error("Login accepts only one username");
  }

  const username = args[0];
  const user = await getUserByName(username);

  if (!user) {
    throw new Error(`User does not exist: ${username}`);
  }

  setUser(username);

  console.log(`User set to ${username}`);
}


export async function handlerReset(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  await deleteAllUsers();
  console.log("Database reset successfully");
}


export async function handlerUsers(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const allUsers = await getUsers();
  const config = readConfig();

  for (const user of allUsers) {
    if (user.name === config.currentUserName) {
      console.log(`* ${user.name} (current)`);
    } else {
      console.log(`* ${user.name}`);
    }
  }
}


export async function handlerAgg(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const feed = await fetchFeed(
    "https://www.wagslane.dev/index.xml"
  );

console.log(JSON.stringify(feed, null, 2));
}

export function printFeed(feed: Feed, user: User): void {
  console.log("Feed created successfully!");
  console.log(`ID: ${feed.id}`);
  console.log(`Name: ${feed.name}`);
  console.log(`URL: ${feed.url}`);
  console.log(`User: ${user.name}`);
}





export async function handlerAddFeed(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length !== 2) {
    throw new Error("Usage: addfeed <name> <url>");
  }

  const [name, url] = args;

  const feed = await createFeed(name, url, user.id);
  const result = await createFeedFollow(user.id, feed.id);

  console.log(`${result.userName} is following ${result.feedName}`);
}



export async function handlerFeeds(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length !== 0) {
    throw new Error("Feeds command does not accept arguments");
  }

  const feeds = await getFeeds();

  for (const feed of feeds) {
    console.log(`Name: ${feed.name}`);
    console.log(`URL: ${feed.url}`);
    console.log(`User: ${feed.userName}`);
  }
}


export async function handlerFollow(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length !== 1) {
    throw new Error("Usage: follow <url>");
  }

  const feed = await getFeedByUrl(args[0]);

  if (!feed) {
    throw new Error(`Feed not found: ${args[0]}`);
  }

  const result = await createFeedFollow(user.id, feed.id);

  console.log(`${result.userName} is following ${result.feedName}`);
}


// export async function handlerFollowing(
//   cmdName: string,
//   ...args: string[]
// ): Promise<void> {
//   if (args.length !== 0) {
//     throw new Error("Usage: following");
//   }

//   const config = readConfig();
//   if (!config.currentUserName) {
//     throw new Error("No user is currently logged in");
//   }

//   const user = await getUserByName(config.currentUserName);
//   if (!user) {
//     throw new Error("Current user was not found");
//   }

//   const follows = await getFeedFollowsForUser(user.id);

//   console.log(`Feeds followed by ${user.name}:`);

//   for (const follow of follows) {
//     console.log(`- ${follow.feedName}`);
//   }
// }
export async function handlerFollowing(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length !== 0) {
    throw new Error("Usage: following");
  }

  const follows = await getFeedFollowsForUser(user.id);

  console.log(`Feeds followed by ${user.name}:`);

  for (const follow of follows) {
    console.log(`- ${follow.feedName}`);
  }
}


export async function handlerUnfollow(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length !== 1) {
    throw new Error("Usage: unfollow <url>");
  }

  await deleteFeedFollow(user.id, args[0]);
  console.log("Unfollowed feed successfully");
}



