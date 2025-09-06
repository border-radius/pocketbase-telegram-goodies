## Pocketbase Goodies

This repository provides useful features for Pocketbase, including:

- Automatic backup zip files sent to a Telegram chat.
- Error logs sent directly to a Telegram chat.

---

### Installation Instructions

1. Place `backups.pb.js` into the `pb_hooks` directory of your Pocketbase instance.
2. Import the collections from `pb_schema.json` by navigating to Settings > Import collections. Ensure you check the "Merge with existing collections" option.
3. Add new records to the `backups_meta` collection:
   - **Key:** `lastLog` | **Value:** (leave as an empty string)
   - **Key:** `lastFile` | **Value:** (leave as an empty string)
   - **Key:** `botToken` | **Value:** (insert your Telegram bot token)
   - **Key:** `chatId` | **Value:** (insert your Telegram chat ID)

---

### Functionality Overview

- A cron job runs every minute to check for new logs and sends them to the specified Telegram chat.
- A separate cron job runs every five minutes to check for new backup zip files and sends them to the specified Telegram chat.
