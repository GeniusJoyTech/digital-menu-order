import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const viteConfig = {
  server: {
    middlewareMode: true,
    hmr: { server: undefined as any },
  },
  appType: "spa" as const,
};

export async function setupVite(app: Express, server: any): Promise<ViteDevServer> {
  const vite = await createViteServer({
    ...viteConfig,
    configFile: path.resolve(__dirname, "../vite.config.ts"),
    server: {
      ...viteConfig.server,
      hmr: { server },
    },
  });

  app.use(vite.middlewares);
  
  return vite;
}

export function serveStatic(app: Express): void {
  const distPath = path.resolve(__dirname, "../dist");
  
  if (!fs.existsSync(distPath)) {
    throw new Error("Build directory not found. Run `npm run build` first.");
  }

  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

export function log(message: string): void {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [express] ${message}`);
}
