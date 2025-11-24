import express from "express";
import dotenv from "dotenv";
import { MCPServer } from "@modelcontextprotocol/sdk/server/express";

dotenv.config();

const NOTION_KEY = process.env.NOTION_API_KEY;
if (!NOTION_KEY) {
  throw new Error("Missing NOTION_API_KEY in Railway Variables.");
}

const app = express();
app.use(express.json());

// Your MCP server instance
const server = new MCPServer({
  name: "notion-mcp-server",
  version: "1.0.0",
});

// Example MCP tool: fetch Notion DB
server.tool("notion.query", {
  description: "Query a Notion database",
  inputSchema: {
    type: "object",
    properties: {
      database_id: { type: "string" }
    },
    required: ["database_id"]
  },
  handler: async ({ database_id }) => {
    const res = await fetch(`https://api.notion.com/v1/databases/${database_id}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();
    return { ok: true, data };
  }
});

// Mount MCP express handler
app.use("/mcp", server.router);

// Railway must listen on PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("MCP server live on port", PORT));
