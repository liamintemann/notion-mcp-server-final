import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { Server } from "@modelcontextprotocol/sdk/server.js";
import { NotionClient } from "@notionhq/client";

dotenv.config();

// -----------------------------
// HTTP Server (for Railway health)
// -----------------------------
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Notion MCP Server Running");
});

app.listen(3000, () => {
  console.log("HTTP server on :3000");
});

// -----------------------------
// Notion Client
// -----------------------------
const notion = new NotionClient({
  auth: process.env.NOTION_API_KEY,
});

// -----------------------------
// MCP Server
// -----------------------------
const mcp = new Server({
  tools: {
    // -----------------------------
    // 1. Query Notion Database
    // -----------------------------
    notion_query: {
      description: "Query a Notion database with optional filter",
      inputSchema: {
        type: "object",
        properties: {
          database_id: { type: "string" },
          filter: { type: "object" }
        },
        required: ["database_id"]
      },
      handler: async ({ database_id, filter }) => {
        const result = await notion.databases.query({
          database_id,
          filter: filter ?? undefined,
        });
        return result;
      }
    },

    // -----------------------------
    // 2. Read a Notion Page
    // -----------------------------
    notion_read_page: {
      description: "Retrieve a Notion page by ID",
      inputSchema: {
        type: "object",
        properties: {
          page_id: { type: "string" }
        },
        required: ["page_id"]
      },
      handler: async ({ page_id }) => {
        const result = await notion.pages.retrieve({ page_id });
        return result;
      }
    },

    // -----------------------------
    // 3. Update Properties on a Page
    // -----------------------------
    notion_update_page: {
      description: "Update properties of a Notion page",
      inputSchema: {
        type: "object",
        properties: {
          page_id: { type: "string" },
          properties: { type: "object" }
        },
        required: ["page_id", "properties"]
      },
      handler: async ({ page_id, properties }) => {
        const result = await notion.pages.update({
          page_id,
          properties
        });
        return result;
      }
    },

    // -----------------------------
    // 4. Create a new Notion Page
    // -----------------------------
    notion_create_page: {
      description: "Create a new page inside a Notion database",
      inputSchema: {
        type: "object",
        properties: {
          database_id: { type: "string" },
          properties: { type: "object" }
        },
        required: ["database_id", "properties"]
      },
      handler: async ({ database_id, properties }) => {
        const result = await notion.pages.create({
          parent: { database_id },
          properties
        });
        return result;
      }
    }
  }
});

// -----------------------------
// Start MCP Server
// -----------------------------
mcp.listen();
console.log("MCP server running");
