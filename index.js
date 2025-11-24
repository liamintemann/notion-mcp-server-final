import express from "express";
import { WebSocketServer } from "ws";
import { MCPServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NotionClient } from "@notionhq/client";
import createMCPEndpoints from "./server.json" assert { type: "json" };

const app = express();
app.use(express.json());

// Load Notion API key from env
const notion = new NotionClient({ auth: process.env.NOTION_API_KEY });

// ---- Basic HTTP test endpoint ----
app.get("/", (req, res) => {
  res.json({ status: "ok", mcp: true });
});

// ---- MCP Setup ----
const mcp = new MCPServer({
  name: "notion_mcp",
  version: "1.0.0",
});

// Register a TOOL --> list pages in a database
mcp.tool("list_pages", {
  description: "List pages inside a Notion database",
  input: {
    type: "object",
    properties: {
      databaseId: { type: "string" }
    },
    required: ["databaseId"]
  },
  handler: async ({ databaseId }) => {
    const data = await notion.databases.query({ database_id: databaseId });
    
    return {
      pages: data.results.map(page => ({
        id: page.id,
        title:
          page.properties?.Name?.title?.[0]?.plain_text || "Untitled",
      }))
    };
  }
});

// MCP WebSocket endpoint
const server = app.listen(process.env.PORT || 8080, () => {
  console.log("Server running");
});
const wss = new WebSocketServer({ server, path: "/mcp" });
mcp.attach(wss);

// ---- Manifest for Agent Builder ----
app.get("/.well-known/ai-plugin.json", (req, res) => {
  res.json({
    schema_version: "v1",
    name_for_model: "notion_mcp",
    name_for_human: "Notion MCP Server",
    description_for_model: "Custom Notion tools via MCP.",
    description_for_human: "Access Notion database and content.",
    api: {
      type: "mcp",
      url: `${req.protocol}://${req.get("host")}/mcp`
    },
    auth: {
      type: "none"
    }
  });
});
