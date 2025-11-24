export function createMCPServer(app, notion) {

  // Basic test endpoint
  app.get("/", (req, res) => {
    res.json({ status: "ok", mcp: true });
  });

  // List pages in a database
  app.post("/list-pages", async (req, res) => {
    const { databaseId } = req.body;

    if (!databaseId)
      return res.status(400).json({ error: "databaseId required" });

    try {
      const data = await notion.databases.query({
        database_id: databaseId,
      });

      res.json(
        data.results.map((page) => ({
          id: page.id,
          title:
            page.properties?.Name?.title?.[0]?.plain_text || "Untitled",
        }))
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Failed to query Notion",
        details: err.message,
      });
    }
  });
}
