import fs from "node:fs/promises";
import express from "express";
import cookieParser from "cookie-parser";

// Constants
const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 5173;
const base = process.env.BASE || "/";

// Create http server
const app = express();

// Parse cookies
app.use(cookieParser());

// Parse JSON bodies for RPC proxy
app.use(express.json());

// RPC proxy endpoints (avoids browser CORS issues with public RPCs)
const RPC_ENDPOINTS = {
  base: process.env.VITE_BASE_RPC_URL || "https://base.publicnode.com",
  optimism: process.env.VITE_OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
  moonbeam: process.env.VITE_MOONBEAM_RPC_URL || "https://rpc.api.moonbeam.network",
  "base-sepolia": process.env.VITE_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
  "optimism-sepolia": process.env.VITE_OPTIMISM_SEPOLIA_RPC_URL || "https://sepolia.optimism.io",
  moonbase: process.env.VITE_MOONBASE_RPC_URL || "https://rpc.api.moonbase.moonbeam.network",
};

app.post("/api/rpc/:chain", async (req, res) => {
  const { chain } = req.params;
  const rpcUrl = RPC_ENDPOINTS[chain];
  if (!rpcUrl) {
    res.status(400).json({ error: `Unknown chain: ${chain}` });
    return;
  }

  try {
    const body = JSON.stringify(req.body);
    if (!body || body === '{}' || body === 'null') {
      console.warn(`RPC proxy (${chain}): empty request body`);
    }

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    console.log(`RPC proxy (${chain}): upstream responded ${response.status}`);

    const data = await response.json();
    res.json(data);
  } catch (error) {
    const safeChain = String(chain).replace(/[^a-z0-9-]/gi, "");
    const safeMessage = error instanceof Error ? error.message.slice(0, 200) : "Unknown error";
    console.error(`RPC proxy error (${safeChain}): ${safeMessage}`);
    res.status(502).json({ error: `RPC request failed for ${safeChain}` });
  }
});

// API Proxy routes for external services (to avoid CORS issues)
app.get("/api/coingecko/*", async (req, res) => {
  try {
    const path = req.params[0];
    const query = new URLSearchParams(req.query).toString();
    const url = `https://api.coingecko.com/api/v3/${path}${query ? `?${query}` : ""}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("CoinGecko proxy error:", error);
    res.status(500).json({ error: "Failed to fetch from CoinGecko" });
  }
});

app.get("/api/exchangerate/*", async (req, res) => {
  try {
    const path = req.params[0];
    const url = `https://api.exchangerate-api.com/v4/latest/${path}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("Exchange rate proxy error:", error);
    res.status(500).json({ error: "Failed to fetch exchange rates" });
  }
});

// Add Vite or respective production middlewares
let vite = null;
if (!isProduction) {
  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    base,
  });
  app.use(vite.middlewares);
} else {
  const compression = (await import("compression")).default;
  const sirv = (await import("sirv")).default;
  app.use(compression());
  app.use(base, sirv("./dist/client", { extensions: [] }));
}

// Serve HTML
app.use("*", async (req, res) => {
  try {
    let url = req.originalUrl.replace(base, "");
    // Ensure URL starts with / so StaticRouter can match routes
    if (!url.startsWith("/")) url = `/${url}`;

    // Read theme from cookie (default to 'light')
    const theme = req.cookies.theme || "light";

    let template = "";
    let render = null;
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile("./index.html", "utf-8");
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;
    } else {
      template = await fs.readFile("./dist/client/index.html", "utf-8");
      render = (await import("./dist/server/entry-server.js")).render;
    }

    const appHtml = render(url, theme);

    // Apply dark class to html element if theme is dark
    const htmlWithTheme =
      theme === "dark"
        ? template.replace('<html lang="en">', '<html lang="en" class="dark">')
        : template;

    const html = htmlWithTheme.replace("<!--app-html-->", appHtml);

    res.status(200).set({ "Content-Type": "text/html" }).send(html);
  } catch (e) {
    vite?.ssrFixStacktrace(e);
    console.log(e.stack);
    res.status(500).end(e.stack);
  }
});

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
