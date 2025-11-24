import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import * as z from "zod/v4";
import { Client as NotionClient } from "@notionhq/client";

// ---- Notion client ----
const notionApiKey = process.env.NOTION_API_KEY;

if (!notionApiKey) {
  console.warn(
    "WARNING: NOTION_API_KEY is not set. Notion tools will fail until this is configured in Railway."
  );
}

const notion = new NotionClient({ auth: notionApiKey });

// ---- MCP server ----
const server = new McpServer({
  name: "notion-mcp-server",
  version: "1.0.0"
});

// --------- TOOLS ----------

// 1) Query a Notion database
server.registerTool(
  "notion_query_database",
  {
    title: "Query a Notion database",
    description: "Runs Notion databases.query for the given database.",
    inputSchema: {
      databaseId: z.string(),
      filter: z.any().optional()
    },
    outputSchema: {
      results: z.array(z.any())
    }
  },
  async ({ databaseId, filter }) => {
    if (!notionApiKey) {
      throw new Error("NOTION_API_KEY is not set on the server.");
    }

    const response = await notion.databases.query({
      database_id: databaseId,
      ...(filter ? { filter } : {})
    });

    const output = { results: response.results };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(output)
        }
      ],
      structuredContent: output
    };
  }
);

// 2) Create a Notion page
server.registerTool(
  "notion_create_page",
  {
    title: "Create a Notion page",
    description:
      "Creates a new page in Notion with the given parent (database or page) and properties.",
    inputSchema: {
      parent: z.object({
        database_id: z.string().optional(),
        page_id: z.string().optional()
      }),
      properties: z.record(z.any()),
      children: z.array(z.any()).optional()
    },
    outputSchema: {
      page: z.any()
    }
  },
  async ({ parent, properties, children }) => {
    if (!notionApiKey) {
      throw new Error("NOTION_API_KEY is not set on the server.");
    }

    const response = await notion.pages.create({
      parent,
      properties,
      ...(children ? { children } : {})
    });

    const output = { page: response };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(output)
        }
      ],
      structuredContent: output
    };
  }
);

// 3) Update a Notion page
server.registerTool(
  "notion_update_page",
  {
    title: "Update a Notion page",
    description: "Updates properties of an existing Notion page.",
    inputSchema: {
      pageId: z.string(),
      properties: z.record(z.any())
    },
    outputSchema: {
      page: z.any()
    }
  },
  async ({ pageId, properties }) => {
    if (!notionApiKey) {
      throw new Error("NOTION_API_KEY is not set on the server.");
    }

    const response = await notion.pages.update({
      page_id: pageId,
      properties
    });

    const output = { page: response };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(output)
        }
      ],
      structuredContent: output
    };
  }
);

// ---- Express + Streamable HTTP transport (official pattern) ----
// Based directly on the MCP TypeScript SDK Streamable HTTP example.
const app = express();
app.use(express.json());

// Simple health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", mcp: true });
});

// MCP endpoint
app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    enableJsonResponse: true
  });

  res.on("close", () => {
    transport.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const port = parseInt(process.env.PORT || "3000", 10);

app
  .listen(port, () => {
    console.log(`Notion MCP Server running on http://localhost:${port}/mcp`);
  })
  .on("error", (error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
