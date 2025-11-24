import "dotenv/config";
import express from "express";
import { Client } from "@notionhq/client";
import { MCPServer } from "@modelcontextprotocol/sdk/server";
import { Tool } from "@modelcontextprotocol/sdk";

const app = express();
app.use(express.json());

// ---- Notion client ----
const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

// ---- MCP Server Setup ----
const mcp = new MCPServer({
  name: "notion-mcp-server",
  version: "1.0.0"
});

// ---- MCP Tool: create_notion_page ----
mcp.addTool(
  new Tool({
    name: "create_notion_page",
    description: "Create a Notion page in a given database.",
    input: {
      type: "object",
      properties: {
        database_id: { type: "string" },
        title: { type: "string" },
        content: { type: "string" }
      },
      required: ["database_id", "title"]
    },
    output: {
      type: "object",
      properties: {
        page_id: { type: "string" }
      }
    },
    handler: async ({ database_id, title, content }) => {
      const response = await notion.pages.create({
        parent: { database_id },
        properties: {
          Name: {
            title: [{ text: { content: title } }]
          }
        },
        children:
          content
            ? [
                {
                  object: "block",
                  type: "paragraph",
                  paragraph: {
                    rich_text: [{ text: { content } }]
                  }
                }
              ]
            : []
      });

      return { page_id: response.id };
    }
  })
);

// ---- Express endpoint so Railway can keep service alive ----
app.get("/", (req, res) => {
  res.json({ status: "OK", service: "notion-mcp-server" });
});

// ---- Start both servers ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("HTTP health server running on port", PORT);
});

mcp.listen();
console.log("MCP server running");
