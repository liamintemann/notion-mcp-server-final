import "dotenv/config";
import express from "express";
import { Server } from "@modelcontextprotocol/sdk/dist/esm/server/express.js";
import { NotionClient } from "@notionhq/client";

const notion = new NotionClient({ auth: process.env.NOTION_API_KEY });

const app = express();
const port = process.env.PORT || 3000;

// MCP Server Instance
const mcp = new Server({
  app,
  tools: {
    list_pages: {
      description: "List pages in a Notion database",
      inputSchema: {
        type: "object",
        properties: {
          databaseId: { type: "string" }
        },
        required: ["databaseId"]
      },
      execute: async ({ databaseId }) => {
        const resp = await notion.databases.query({ database_id: databaseId });
        return resp.results.map(r => ({ id: r.id, title: r.properties.Title?.title?.[0]?.plain_text }));
      }
    }
  }
});

app.listen(port, () => {
  console.log(`🚀 MCP Notion Server running on port ${port}`);
});
