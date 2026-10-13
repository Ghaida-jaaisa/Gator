# Gator

Gator is a command-line RSS feed aggregator built with TypeScript, Node.js, PostgreSQL, and Drizzle ORM. It allows users to manage RSS feeds, follow feeds, and fetch posts from them.

## Requirements

Before running Gator, make sure you have installed:

- Node.js
- PostgreSQL
- npm
- Git

## Installation

1. Clone the repository:

   ```bash
   git clone YOUR_GITHUB_REPOSITORY_URL
   cd aggregator
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a PostgreSQL database named `gator`.

4. Create a configuration file at `~/.gatorconfig.json` with the following content:

   ```json
   {
     "db_url": "postgres://username:password@localhost:5432/gator?sslmode=disable",
     "current_user_name": ""
   }
   ```

   Replace `username` and `password` with your PostgreSQL credentials.

5. Apply the database migrations:

   ```bash
   npx drizzle-kit migrate
   ```

## Usage

Run commands using:

```bash
npm run start <command> [arguments]
```

### Available Commands

| Command                | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `register <name>`      | Register a new user.                                |
| `login <name>`         | Log in as an existing user.                         |
| `users`                | List registered users.                              |
| `addfeed <name> <url>` | Add a feed and follow it.                           |
| `feeds`                | List available feeds.                               |
| `follow <url>`         | Follow an existing feed.                            |
| `following`            | List feeds followed by the current user.            |
| `unfollow <url>`       | Stop following a feed.                              |
| `agg <duration>`       | Continuously fetch RSS feeds and print post titles. |
| `browse [limit]`       | Browse recent posts.                                |
| `reset`                | Reset the users table.                              |

### Example

Register and log in:

```bash
npm run start register ghaida
npm run start login ghaida
```

Add an RSS feed:

```bash
npm run start addfeed "Hacker News" "https://news.ycombinator.com/rss"
```

Start aggregating feeds every minute:

```bash
npm run start agg 1m
```

Press `Ctrl+C` to stop the aggregator.

## Technologies

- TypeScript
- Node.js
- PostgreSQL
- Drizzle ORM
- RSS feeds
