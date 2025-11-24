import { Server } from "@modelcontextprotocol/sdk/server";
import { NotionClient } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config();

const notion = new NotionClient({ auth: process.env.NOTION_API_KEY });

const server = new Server({
  tools: {
    notion_query: {
      description: "Query a Notion database",
      inputSchema: {
        type: "object",
        properties: {
          database_id: { type: "string" },
          filter: { type: "object" }
        },
        required: ["database_id"]
      },
      handler: async ({ database_id, filter }) => {
        const res = await notion.databases.query({
          database_id,
          filter: filter || undefined
        });
        return res;
      }
    }
  }
});

server.listen();
