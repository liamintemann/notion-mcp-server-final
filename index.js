import 'dotenv/config';
import express from 'express';
import { Client } from '@notionhq/client';
import { Server } from '@modelcontextprotocol/sdk/server/express.js';

const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

const app = express();
app.use(express.json());

// MCP server instance
const server = new Server();

// MCP Tool: query a database
server.tool('notion_query', {
  description: 'Query a Notion database.',
  inputSchema: {
    type: 'object',
    properties: {
      database_id: { type: 'string' },
      filter: { type: 'object' }
    },
    required: ['database_id']
  },
  execute: async ({ database_id, filter }) => {
    const response = await notion.databases.query({
      database_id,
      filter: filter || undefined
    });
    return { results: response.results };
  }
});

// MCP Tool: create a page
server.tool('notion_create_page', {
  description: 'Create a page in a Notion database.',
  inputSchema: {
    type: 'object',
    properties: {
      database_id: { type: 'string' },
      properties: { type: 'object' }
    },
    required: ['database_id', 'properties']
  },
  execute: async ({ database_id, properties }) => {
    const response = await notion.pages.create({
      parent: { database_id },
      properties
    });
    return { id: response.id };
  }
});

// Bind MCP server to /mcp
app.use('/mcp', server.router);

// Railway will use this port automatically
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Notion MCP Server running on port ${port}`);
});

