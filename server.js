export function createMCPServer(app, notion) {
  // Test endpoint
  app.get("/", (req, res) => {
    res.json({ status: "ok", mcp: true });
  });

  // List pages from a Notion DB
  app.post("/list-pages", async (req, res) => {
    const { databaseId } = req.body;

    if (!databaseId)
      return res.status(400).json({ error: "databaseId required" });

    try {
      const data = await notion.databases.query({ database_id: databaseId });

      res.json(
        data.results.map((page) => ({
          id: page.id,
          title:
            page.properties?.Name?.title?.[0]?.plain_text || "Untitled",
        }))
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error querying Notion" });
    }
  });
}
