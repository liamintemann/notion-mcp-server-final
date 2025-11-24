import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";
import { MCPServer, Tool, ServerTransportExpress } from "@modelcontextprotocol/sdk";

dotenv.config();

const NOTION_API_KEY = process.env.NOTION_API_KEY;
if (!NOTION_API_KEY) {
  console.error("❌ Missing NOTION_API_KEY environment variable!");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

// -------------------------------
// Define MCP Tools
// -------------------------------
const tools = {
  echo: new Tool({
    name: "echo",
    description: "Returns whatever input was sent.",
    parameters: {
      type: "object",
      properties: { text: { type: "string" } },
      required: ["text"]
    },
    execute: async ({ text }) => {
      return { text };
    }
  }),

  notion_query: new Tool({
    name: "notion_query",
    description: "Query a Notion database with no filter.",
    parameters: {
      type: "object",
      properties: {
        database_id: { type: "string" }
      },
      required: ["database_id"]
    },
    execute: async ({ database_id }) => {
      const response = await notion.databases.query({ database_id });
      return { results: response.results };
    }
  }),

  notion_page: new Tool({
    name: "notion_page",
    description: "Retrieve a Notion page by ID.",
    parameters: {
      type: "object",
      properties: {
        page_id: { type: "string" }
      },
      required: ["page_id"]
    },
    execute: async ({ page_id }) => {
      const page = await notion.pages.retrieve({ page_id });
      return { page };
    }
  })
};

// -------------------------------
// Setup MCP server
// -------------------------------
const app = express();
app.use(cors());
app.use(express.json());

const server = new MCPServer({ tools });

// Bind Express → MCP transport
new ServerTransportExpress({ app, server });

// Health check for Railway logs
app.get("/", (req, res) => {
  res.send("Notion MCP Server running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 MCP server running on ${PORT}`));
