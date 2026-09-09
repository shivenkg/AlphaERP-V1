import http from "http";
import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { app } from "./server/app";

const server = http.createServer(app);
const PORT = 3000;

// WebSocket Server for Gemini Live API
const wss = new WebSocketServer({ noServer: true });

// Security: Connection tracking & Rate Limiting per IP for WebSocket connections
const wsConnectionsByIp = new Map<string, number>();
const MAX_CONCURRENT_WS_PER_IP = 5;

// Heartbeat ping-pong to clean up dead sockets and prevent connection leaks
const aliveClients = new WeakSet<WebSocket>();

server.on("upgrade", (request, socket, head) => {
  const parsedUrl = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
  if (parsedUrl.pathname === "/live") {
    // Resolve client IP (supporting standard proxy headers)
    const clientIp =
      (request.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
      request.socket.remoteAddress ||
      "unknown";

    const currentConns = wsConnectionsByIp.get(clientIp) || 0;
    if (currentConns >= MAX_CONCURRENT_WS_PER_IP) {
      console.warn(`WebSocket connection rejected: IP ${clientIp} exceeded max limit (${MAX_CONCURRENT_WS_PER_IP})`);
      socket.write("HTTP/1.1 429 Too Many Requests\r\n\r\n");
      socket.destroy();
      return;
    }

    wsConnectionsByIp.set(clientIp, currentConns + 1);

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
    return;
  }
  // In development, Vite HMR handles websocket upgrade requests (e.g. protocol: vite-hmr).
  // Do NOT destroy the socket here so Vite HMR can establish its connection without error.
});

// Periodically ping clients to clear stale/zombie sockets
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!aliveClients.has(ws)) {
      ws.terminate();
      return;
    }
    aliveClients.delete(ws);
    try {
      ws.ping();
    } catch {}
  });
}, 30000);

heartbeatInterval.unref();

wss.on("connection", async (clientWs: WebSocket, request: http.IncomingMessage) => {
  const clientIp =
    (request.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    request.socket.remoteAddress ||
    "unknown";

  aliveClients.add(clientWs);

  clientWs.on("pong", () => {
    aliveClients.add(clientWs);
  });

  const cleanupConnection = () => {
    const conns = wsConnectionsByIp.get(clientIp) || 1;
    if (conns <= 1) {
      wsConnectionsByIp.delete(clientIp);
    } else {
      wsConnectionsByIp.set(clientIp, conns - 1);
    }
  };

  clientWs.on("close", cleanupConnection);
  clientWs.on("error", cleanupConnection);

  console.log(`Client connected to Gemini Live voice session from ${clientIp}`);

  const safeSend = (payload: object) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      try {
        clientWs.send(JSON.stringify(payload));
      } catch (err) {
        console.error("Error sending message to WebSocket client:", err);
      }
    }
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    safeSend({
      error: "GEMINI_API_KEY environment variable is not configured. Please configure it in Settings.",
    });
    clientWs.close();
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  let session: any = null;

  try {
    session = await ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
        },
        systemInstruction:
          "You are the AlphaERP Voice Assistant for HVAC Biz, a leading commercial and industrial HVAC engineering enterprise. You provide instantaneous, concise, clear, and professional voice guidance on HVAC system calculations (cooling load in tons, CFM, static pressure), project stage conversions, quotation estimations, purchase requisitions, inventory parts cross-referencing, and equipment specs. Speak naturally, efficiently, and with technical precision.",
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          // Model audio chunk (base64 PCM 24kHz)
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            safeSend({ audio });
          }

          // Model text transcriptions
          if (message.serverContent?.modelTurn?.parts) {
            for (const part of message.serverContent.modelTurn.parts) {
              if (part.text) {
                safeSend({ text: part.text, sender: "model" });
              }
            }
          }

          if (message.serverContent?.interrupted) {
            safeSend({ interrupted: true });
          }

          if (message.serverContent?.turnComplete) {
            safeSend({ turnComplete: true });
          }
        },
        onerror: (err: any) => {
          console.error("Gemini Live API error:", err);
          safeSend({ error: err?.message || "Live API session error" });
        },
        onclose: () => {
          safeSend({ closed: true });
        },
      },
    });

    clientWs.on("message", (data: any) => {
      try {
        const rawString = data.toString();
        // Prevent oversized input payloads
        if (rawString.length > 500000) {
          console.warn("Client message exceeded maximum allowed payload size");
          return;
        }

        const parsed = JSON.parse(rawString);
        if (parsed.audio && typeof parsed.audio === "string" && session) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: "audio/pcm;rate=16000" },
          });
        }
        if (parsed.text && typeof parsed.text === "string" && session) {
          session.send({
            clientContent: {
              turns: [
                {
                  role: "user",
                  parts: [{ text: parsed.text.slice(0, 1000) }],
                },
              ],
              turnComplete: true,
            },
          });
        }
      } catch (err) {
        console.error("Error processing client message:", err);
      }
    });

    clientWs.on("close", () => {
      console.log("Client disconnected from Live API session");
      if (session && typeof session.close === "function") {
        try {
          session.close();
        } catch {}
      }
    });
  } catch (err: any) {
    console.error("Failed to connect to Gemini Live:", err);
    safeSend({
      error: `Failed to connect to Gemini Live (${err?.message || err})`,
    });
    clientWs.close();
  }
});

// Vite middleware in dev or high-performance static files in production
async function setupApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    // Performance: Aggressive caching for hashed immutable assets in dist/assets
    app.use(
      express.static(distPath, {
        maxAge: "1d",
        setHeaders: (res, filePath) => {
          if (filePath.includes("/assets/")) {
            // Hashed Vite assets are immutable
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          } else if (filePath.endsWith(".html")) {
            // HTML files should revalidate immediately
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          }
        },
      })
    );

    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`AlphaERP Server running on http://0.0.0.0:${PORT}`);
  });
}

setupApp();
