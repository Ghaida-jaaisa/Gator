import {
  handlerLogin,
  handlerRegister,
  handlerReset,
  handlerUsers,
  handlerAgg,
  handlerAddFeed,
  handlerFeeds,
  handlerFollow,
  handlerFollowing,
  registerCommand,
  runCommand,
  type CommandsRegistry,
  middlewareLoggedIn,
  handlerUnfollow,
} from "./commands.js";

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Not enough arguments provided");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);

  const registry: CommandsRegistry = {};

  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);
  registerCommand(registry, "reset", handlerReset);
  registerCommand(registry, "users", handlerUsers);
  registerCommand(registry, "agg", handlerAgg);
  registerCommand(registry, "feeds", handlerFeeds);
  registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
  registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
  registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
  registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));

  try {
    await runCommand(registry, cmdName, ...cmdArgs);
  } catch (error) {
    // console.error(
    //   error instanceof Error ? error.message : error
    // );
    console.log(error);
    process.exit(1);
  }

  process.exit(0);
}

main();
