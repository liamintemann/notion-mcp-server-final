import "dotenv/config";
import express from "express";
import { NotionClient } from "@notionhq/client";
import { createMCPServer } from "./mcp/server.js"; // ← you will create this

const notion = new NotionClient({ auth: process.env.NOTION_API_KEY });

const app = express();
const port = process.env.PORT || 3000;

createMCPServer(app, notion);

app.listen(port, () => {
  console.log(`🚀 MCP Notion Server running on port ${port}`);
});
