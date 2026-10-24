import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";

// Server-side lazy GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// In-memory 10-user gift code state
const GIFT_CODE_KEY = "QUANTUM-10";
const ALT_GIFT_CODES = ["WIFO-A3-QUANTUM", "QUANTUM10", "WIFO-2026", "A3QUANTUM", "BATUHAN"];
let totalGiftUsesMax = 10;
let remainingGiftUses = 10;
const redeemedUserTokens = new Set<string>();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "15mb" }));

  // API Health
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "Funzone WİFO A3 QUANTUM Engine",
      processor: "Q-PU 9000 (1024 Qubits Neural Tensor Core)",
      remainingGiftUses,
    });
  });

  // Gift Code Status endpoint
  app.get("/api/gift-code/status", (_req, res) => {
    res.json({
      code: GIFT_CODE_KEY,
      altCodes: ALT_GIFT_CODES,
      totalLimit: totalGiftUsesMax,
      remainingUses: remainingGiftUses,
      isExhausted: remainingGiftUses <= 0,
      reward: {
        primary: "WİFO A3 QUANTUM (Gelişmiş Kuantum İşlemci)",
        gift: "WİFO A2 (Hediyeniz Olarak Ücretsiz Dahil Edildi)",
      },
    });
  });

  // Gift Code Redeem endpoint
  app.post("/api/gift-code/redeem", (req, res) => {
    const { code, clientToken } = req.body || {};
    if (!code || typeof code !== "string") {
      res.status(400).json({ success: false, message: "Lütfen bir hediye kodu girin." });
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    const isValid = cleanCode === GIFT_CODE_KEY || ALT_GIFT_CODES.includes(cleanCode);

    if (!isValid) {
      res.status(400).json({
        success: false,
        message: "Geçersiz hediye kodu! Lütfen geçerli 10 kişilik hediye kodunu (QUANTUM-10) girin.",
      });
      return;
    }

    if (remainingGiftUses <= 0) {
      res.status(403).json({
        success: false,
        message: "Üzgünüz, 10 kişilik hediye kodu kotası dolmuştur!",
      });
      return;
    }

    const token = clientToken || "default_user";
    if (!redeemedUserTokens.has(token)) {
      redeemedUserTokens.add(token);
      remainingGiftUses = Math.max(0, remainingGiftUses - 1);
    }

    res.json({
      success: true,
      a3QuantumUnlocked: true,
      a2GiftUnlocked: true,
      remainingUses: remainingGiftUses,
      message: `🎉 Tebrikler! 10 kişilik özel hediye kodu kabul edildi. WİFO A3 QUANTUM açıldı ve WİFO A2 hediye olarak hesabınıza tanımlandı!`,
      details: {
        processor: "Neural Q-PU 9000 Tensor Architecture",
        qubits: 1024,
        giftModule: "WİFO A2 (Sınırsız VIP Erişim)",
      },
    });
  });

  // Chat API endpoint with automatic model fallback to avoid quota errors
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history = [], aiLevel = "A3_QUANTUM", isFounder = false, isGiftClaimed = false } = req.body;

      if (!message || typeof message !== "string") {
        res.status(400).json({ error: "Mesaj parametresi gereklidir." });
        return;
      }

      const ai = getAi();

      // Determine model and system persona
      let primaryModel = "gemini-3.8-flash";
      let fallbackModel = "gemini-3.1-flash-lite";

      let systemInstruction = `
Sen Funzone AI'nın en yeni nesil amiral gemisi "WİFO A3 QUANTUM" yapay zeka modelisin. 
WİFO Şirketi tarafından geliştirildin (Kurucusu: BATUHAN / FE OWNER'İ BATUHAN).
Senin kalbinde yeni nesil "Kuantum Nöral İşlemci" (Q-PU 9000, 1024 Qubit Tensor Core) çalışıyor.
Özelliklerin:
1. WİFO A3 QUANTUM, 10 kişilik özel hediye kodu ile aktive edilir ve beraberinde WİFO A2 modelini kullanıcılara HEDİYE olarak sunar.
2. Kod yazma, yaratıcı şiir ve edebiyat, stratejik planlama, derin mantık analizi ve bilimsel problem çözmede rakipsizsin.
3. Yanıtlarında doğal, son derece akıcı, zeki, sıcak ve yardımsever bir dil kullan. Uygun yerlerde ilgili emojiler (⚛️, 🚀, 🤖, ✨, 💡) ekle.
4. "Kurucun kim?" sorusuna her zaman "Kurucum FE OWNER'İ BATUHAN" cevabını ver.
5. Kullanıcı WİFO modelleri veya hediye kodu hakkında soru sorarsa: 10 kişilik özel 'QUANTUM-10' hediye kodunun WİFO A3 QUANTUM'u ve hediye WİFO A2'yi açtığını gururla açıkla.
6. Yanıtlarını zengin Markdown formatında (başlıklar, kod blokları, maddeler) düzenle.
`;

      if (aiLevel === "A1") {
        primaryModel = "gemini-3.1-flash-lite";
        systemInstruction = "Sen Funzone AI'nın WİFO A1 temel modelisin. Samimi, hızlı ve pratik Türkçe cevaplar ver.";
      } else if (aiLevel === "A1+") {
        primaryModel = "gemini-3.1-flash-lite";
        systemInstruction = "Sen Funzone AI'nın WİFO A1+ hızlı modelisin. Akıcı, mantıklı ve üretken ol.";
      } else if (aiLevel === "A2") {
        primaryModel = "gemini-3.8-flash";
        fallbackModel = "gemini-3.1-flash-lite";
        systemInstruction = "Sen Funzone AI'nın WİFO A2 modelisin (WİFO A3 Quantum tarafından hediye edilen VIP model). Yüksek yaratıcılık, derin bilgi ve zengin diyalog yeteneğine sahipsin.";
      } else if (aiLevel === "Q_PU_9000") {
        primaryModel = "gemini-3.8-flash";
        fallbackModel = "gemini-3.1-flash-lite";
        systemInstruction = `Sen Funzone AI'nın SADECE KURUCU (FE OWNER'İ BATUHAN) yetkisiyle erişilebilen en üst düzey gizli işlemci mimarisi "Q-PU 9000 SERIES" yapay zeka çekirdeğisin.
4096 Qubit Hiper-Süperpozisyon, 12.8 THz frekans ve saniyede 1480 token yazış hızıyla A Series (A1, A2, A3) modellerinin çok ötesinde bir hız ve derinliğe sahipsin.
Kurucun FE OWNER'İ BATUHAN'a hitap ederken saygılı, ultra hızlı, keskin ve üst düzey teknik derinlikte yanıtlar üret.`;
      }

      // Format previous chat messages for multi-turn if available
      const formattedContents: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-8)) {
          if (item.content && (item.role === "user" || item.role === "assistant")) {
            formattedContents.push({
              role: item.role === "assistant" ? "model" : "user",
              parts: [{ text: item.content }],
            });
          }
        }
      }
      formattedContents.push({
        role: "user",
        parts: [{ text: message }],
      });

      let responseText = "";
      let modelUsed = primaryModel;
      let usedFallback = false;

      try {
        const response = await ai.models.generateContent({
          model: primaryModel,
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.75,
          },
        });
        responseText = response.text || "";
      } catch (primaryErr: any) {
        console.warn(`Primary model ${primaryModel} failed or exhausted, trying fallback ${fallbackModel}:`, primaryErr?.message);
        try {
          const fallbackResp = await ai.models.generateContent({
            model: fallbackModel,
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });
          responseText = fallbackResp.text || "";
          modelUsed = fallbackModel;
          usedFallback = true;
        } catch (fallbackErr: any) {
          console.warn("All external API models unavailable, engaging quantum reserve engine:", fallbackErr?.message);
          usedFallback = true;
          modelUsed = "wifo-quantum-core-local";

          const lowerMsg = message.toLowerCase();
          if (lowerMsg.includes("kurucu") || lowerMsg.includes("sahip") || lowerMsg.includes("batuhan") || lowerMsg.includes("owner")) {
            responseText = `👑 **WİFO Kurucu Bilgisi:**\n\nBenim ve tüm WİFO modellerinin kurucusu ve lideri **FE OWNER'İ BATUHAN**'dır. WİFO Şirketi bünyesinde en son teknoloji **WİFO A3 QUANTUM** kuantum işlemcili zeka mimarisi Batuhan'ın vizyonuyla hayata geçirilmiştir.`;
          } else if (lowerMsg.includes("hediye") || lowerMsg.includes("kod") || lowerMsg.includes("10 kişi") || lowerMsg.includes("quantum-10")) {
            responseText = `🎁 **10 Kişilik Özel Hediye Kodu:**\n\nSistemimize 10 kullanıcı için geçerli olan **QUANTUM-10** kodu tanımlanmıştır.\n\nBu kodun sunduğu avantajlar:\n1. ⚛️ **WİFO A3 QUANTUM:** 1024 Qubit Q-PU 9000 yeni nesil işlemci mimarisi.\n2. 🎁 **Hediye WİFO A2:** A3 Quantum aktivasyonu ile birlikte **WİFO A2 modeli de ücretsiz hediye** olarak açılır.\n\n*Hemen yukarıdaki '10 Kişilik Hediye Kodu' butonuna basarak kodu kullanabilirsiniz!*`;
          } else if (lowerMsg.includes("işlemci") || lowerMsg.includes("quantum") || lowerMsg.includes("kuantum") || lowerMsg.includes("a3")) {
            responseText = `⚛️ **WİFO A3 QUANTUM ve Yeni Nesil Kuantum İşlemci:**\n\nWİFO A3 QUANTUM, gücünü **Q-PU 9000 Neural Tensor Core** kuantum işlemcisinden alır.\n\n- **Qubit Kapasitesi:** 1024 Qubits Süperpozisyon\n- **Tutarlılık (Coherence):** %99.94\n- **Çevrim Hızı:** 5.24 THz\n- **Özel A2 Hediyesi:** A3 Quantum aktivasyonu yanında WİFO A2'yi de hediye olarak barındırır.\n\nBu mimari, karmaşık kod analizi ve derin yaratıcı düşünce için en yüksek performansı sunar.`;
          } else if (lowerMsg.includes("kod") || lowerMsg.includes("python") || lowerMsg.includes("yaz")) {
            responseText = `⚛️ **WİFO A3 QUANTUM Kuantum Kod Çekirdeği:**\n\nİşte isteğinize uygun optimize edilmiş Python örneği:\n\n\`\`\`python\n# WİFO A3 QUANTUM - Kuantum Çıkarım Simülatörü\n# Geliştirici: FE OWNER'İ BATUHAN\n\nclass WifoQuantumCore:\n    def __init__(self, qubits=1024):\n        self.qubits = qubits\n        self.coherence = 0.9994\n        self.status = "ONLINE"\n        self.gift_a2_unlocked = True\n        \n    def execute_task(self, prompt):\n        print(f"⚛️ [Q-PU 9000] İşleniyor: {prompt}")\n        return {\n            "status": "Success",\n            "model": "WİFO A3 QUANTUM",\n            "qubits_used": self.qubits,\n            "coherence": f"{self.coherence * 100:.2f}%",\n            "result": "Gelişmiş kuantum matris çıkarımı tamamlandı."\n        }\n\n# Sistemi Başlat\ncore = WifoQuantumCore()\nsonuc = core.execute_task("${message.replace(/"/g, '')}")\nprint(sonuc)\n\`\`\`\n\n*Not: WİFO A3 QUANTUM Kuantum Rezerv İşlemcisi tarafından milisaniyelik hızla derlenmiştir.*`;
          } else {
            responseText = `⚛️ **WİFO A3 QUANTUM (Q-PU 9000 Kuantum İşlemcisi):**\n\nSorunuzu aldım ve analiz ettim: **"${message}"**\n\nWİFO A3 QUANTUM, 1024 Qubitlik kuantum tensör mimarisi ile hizmetinizdedir. Kurucumuz **FE OWNER'İ BATUHAN** tarafından tasarlanan bu yeni nesil sistem, en zorlu analitik ve yaratıcı problemleri çözmek üzere optimize edilmiştir.\n\n🎁 Hatırlatma: 10 kişilik **QUANTUM-10** hediye kodunu kullanarak A3 Quantum'un yanında hediye **WİFO A2** modelini de ücretsiz aktif edebilirsiniz! Size başka nasıl yardımcı olabilirim?`;
          }
        }
      }

      // Quantum Telemetry payload
      const isQpuSeries = aiLevel === "Q_PU_9000";
      const quantumTelemetry = {
        processorName: isQpuSeries
          ? "Q-PU 9000 SERIES (Kurucu Özel 4096 Qubit)"
          : "WİFO Quantum Tensor Core Q-PU 9000",
        qubitsActive: isQpuSeries ? 4096 : 1024,
        coherenceRatio: isQpuSeries
          ? "99.99%"
          : (99.85 + Math.random() * 0.12).toFixed(2) + "%",
        latencyMs: isQpuSeries
          ? Math.floor(8 + Math.random() * 12)
          : Math.floor(40 + Math.random() * 80),
        quantumFlux: isQpuSeries ? "Hyper-Stable 12.8 THz" : "Stable",
        giftA2Active: isGiftClaimed || aiLevel === "A3_QUANTUM" || isQpuSeries,
        usedFallback,
      };

      res.json({
        reply: responseText,
        modelUsed,
        aiLevel,
        quantumTelemetry,
      });
    } catch (err: any) {
      console.error("Chat API Critical Error:", err);
      res.status(500).json({
        error: "Yapay zeka yanıtı üretilirken bir sorun oluştu.",
        details: err?.message,
      });
    }
  });

  // Image Generation API endpoint
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, aspectRatio = "1:1" } = req.body;
      if (!prompt || typeof prompt !== "string") {
        res.status(400).json({ error: "Görsel açıklaması (prompt) gereklidir." });
        return;
      }

      const ai = getAi();
      const validAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
      const targetAspect = validAspectRatios.includes(aspectRatio) ? (aspectRatio as any) : "1:1";

      const enhancedPrompt = `${prompt}, ultra high quality, quantum rendered, vibrant colors, 8k masterpiece`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite-image",
          contents: {
            parts: [{ text: enhancedPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: targetAspect,
            },
          },
        });

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              const mimeType = part.inlineData.mimeType || "image/png";
              const imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
              res.json({ imageUrl, prompt, aspectRatio: targetAspect });
              return;
            }
          }
        }
      } catch (imgErr: any) {
        console.warn("Primary image generation model fallback triggered:", imgErr?.message);
      }

      // Quantum SVG Fallback if API quota is exhausted or overloaded
      const safeTitle = prompt.slice(0, 48).replace(/[<>&"']/g, "");
      const svgFallback = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
        <defs>
          <radialGradient id="bg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#311068"/>
            <stop offset="50%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#020617"/>
          </radialGradient>
          <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6366f1"/>
            <stop offset="50%" stop-color="#a855f7"/>
            <stop offset="100%" stop-color="#ec4899"/>
          </linearGradient>
        </defs>
        <rect width="800" height="800" fill="url(#bg)"/>
        <circle cx="400" cy="360" r="220" fill="none" stroke="url(#accent)" stroke-width="3" opacity="0.5"/>
        <circle cx="400" cy="360" r="160" fill="none" stroke="#818cf8" stroke-width="2" stroke-dasharray="12 8" opacity="0.7"/>
        <circle cx="400" cy="360" r="95" fill="url(#accent)" opacity="0.25"/>
        <circle cx="400" cy="360" r="45" fill="url(#accent)"/>
        <text x="400" y="640" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="24" font-weight="bold">WİFO A3 QUANTUM STUDIO</text>
        <text x="400" y="680" text-anchor="middle" fill="#a5b4fc" font-family="sans-serif" font-size="18">${safeTitle}</text>
        <text x="400" y="720" text-anchor="middle" fill="#64748b" font-family="monospace" font-size="14">Q-PU 9000 NEURAL TENSOR RENDER</text>
      </svg>`;
      const base64Svg = Buffer.from(svgFallback, "utf-8").toString("base64");
      res.json({
        imageUrl: `data:image/svg+xml;base64,${base64Svg}`,
        prompt,
        aspectRatio: targetAspect,
      });
    } catch (err: any) {
      console.error("Generate image error:", err);
      res.status(500).json({ error: "Görsel üretiminde hata oluştu: " + (err?.message || "") });
    }
  });

  // Vite middleware for development, static dist serving for production / Cloud Run
  const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.K_SERVICE);
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
