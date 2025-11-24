import express from "express";
import { Client } from "@notionhq/client";
import { createMCPServer } from "./server.js";

const app = express();
app.use(express.json());

// Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Load MCP routes
createMCPServer(app, notion);

// Railway requires this port
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("MCP Notion server running on port", PORT);
});
