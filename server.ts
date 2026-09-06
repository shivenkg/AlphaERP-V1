import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json());

// API health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    model: "gemini-3.1-flash-live-preview",
    apiKeyConfigured: !!process.env.GEMINI_API_KEY
  });
});

// WebSocket Server for Gemini Live API
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  const parsedUrl = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
  if (parsedUrl.pathname === "/live") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  }
});

wss.on("connection", async (clientWs: WebSocket) => {
  console.log("Client connected to Gemini Live voice session");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    clientWs.send(
      JSON.stringify({
        error: "GEMINI_API_KEY environment variable is not configured. Please configure it in Settings."
      })
    );
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
          // Puck, Charon, Kore, Fenrir, Zephyr
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
        },
        systemInstruction:
          "You are the AlphaERP Voice Assistant for Atmos Aircon, a leading commercial and industrial HVAC engineering enterprise. You provide instantaneous, concise, clear, and professional voice guidance on HVAC system calculations (cooling load in tons, CFM, static pressure), project stage conversions, quotation estimations, purchase requisitions, inventory parts cross-referencing, and equipment specs. Speak naturally, efficiently, and with technical precision.",
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          // Model audio chunk (base64 PCM 24kHz)
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ audio }));
          }

          // Model text transcriptions
          if (message.serverContent?.modelTurn?.parts) {
            for (const part of message.serverContent.modelTurn.parts) {
              if (part.text) {
                clientWs.send(JSON.stringify({ text: part.text, sender: "model" }));
              }
            }
          }

          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }

          if (message.serverContent?.turnComplete) {
            clientWs.send(JSON.stringify({ turnComplete: true }));
          }
        },
        onerror: (err: any) => {
          console.error("Gemini Live API error:", err);
          try {
            clientWs.send(JSON.stringify({ error: err?.message || "Live API session error" }));
          } catch {}
        },
        onclose: () => {
          try {
            clientWs.send(JSON.stringify({ closed: true }));
          } catch {}
        }
      }
    });

    clientWs.on("message", (data: any) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: "audio/pcm;rate=16000" },
          });
        }
        if (parsed.text) {
          session.send({
            clientContent: {
              turns: [
                {
                  role: "user",
                  parts: [{ text: parsed.text }],
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
    try {
      clientWs.send(
        JSON.stringify({
          error: `Failed to connect to Gemini Live (${err?.message || err})`
        })
      );
      clientWs.close();
    } catch {}
  }
});

// Vite middleware in dev or static files in production
async function setupApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`AlphaERP Server running on http://0.0.0.0:${PORT}`);
  });
}

setupApp();
