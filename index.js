import express from "express";
import { Client } from "@notionhq/client";
import { createMCPServer } from "./server.js";

const app = express();
app.use(express.json());

// This is required by Railway
const PORT = process.env.PORT || 8080;

// Load Notion API key from Railway variables
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Attach MCP routes
createMCPServer(app, notion);

app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});
