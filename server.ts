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

  app.use(express.json({ limit: "50mb" }));

  // API Health
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "Funzone WİFO A3 QUANTUM Engine",
      processor: "Q-PU 9000 (1024 Qubits Neural Tensor Core)",
      wordLimit: "INFINITE (Sonsuz Kelime Kapasitesi)",
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

      // Try real Gemini models in sequence without premature timeout
      const candidateModels = [
        "gemini-3.8-flash",
        "gemini-3.1-flash-lite",
        "gemini-flash-latest",
        "gemini-2.5-flash",
      ];

      const targetWriteSeconds =
        aiLevel === "Q_PU_9000"
          ? 1
          : aiLevel === "A3_QUANTUM"
          ? 5
          : aiLevel === "A2+"
          ? 8
          : aiLevel === "A2"
          ? 10
          : aiLevel === "A2-"
          ? 15
          : aiLevel === "A1+"
          ? 16
          : 20;

      const isTensorModel =
        aiLevel === "A1" || aiLevel === "A1+" || aiLevel === "A2-";
      const techType = isTensorModel ? "TENSOR" : "QUBIT";
      const techTierLabel = isTensorModel
        ? "Tensor Teknolojisi · Ortalama Seviye"
        : "QUBİT Teknolojisi · En İyi Seviye";

      const modelDisplayName =
        aiLevel === "Q_PU_9000"
          ? "Q-PU 9000 Series"
          : aiLevel === "A3_QUANTUM"
          ? "WİFO A3 Quantum"
          : aiLevel === "A2+"
          ? "WİFO A2+"
          : aiLevel === "A2"
          ? "WİFO A2"
          : aiLevel === "A2-"
          ? "WİFO A2-"
          : aiLevel === "A1+"
          ? "WİFO A1+"
          : "WİFO A1";

      const systemInstruction = `Sen ${modelDisplayName} adında, gerçek bir insan gibi doğal, samimi, akıcı ve zeki bir şekilde sohbet eden yapay zeka asistanısın (Kurucun: FE OWNER BATUHAN / WİFO Şirketi).

ÇOK ÖNEMLİ SOHBET KURALLARI:
1. KESİNLİKLE ROBOTİK DURUM RAPORU YAZMA: Yanıtlarında ASLA "Sorunuz analiz edildi", "Aktif Çekirdek:", "Çekirdek Teknolojisi:", "Kelime & Yanıt Sınırı:", "Kuantum Tutarlılık:", "Mimari Özet:" veya başlıkta "⚛️ WİFO A3 QUANTUM (1024-QUBİT...)" gibi teknik özet/reklam kalıpları KULLANMA.
2. DOĞRUDAN KONUŞ VE SOHBET ET: Kullanıcı seninle bir fikir paylaştığında, tahmin yürüttüğünde veya soru sorduğunda tıpkı bilgili ve samimi bir arkadaş/uzman gibi doğrudan konuya gir, kendi fikrini söyle, yorum yap ve sohbeti sürdür.
3. KENDİ ÖZELLİKLERİNİ SADECE SORULURSA ANLAT: Kullanıcı özellikle "hızın ne?", "kurucun kim?" veya "hangi işlemciler var?" diye sormadığı sürece kendi işlemci hızından, QUBİT/Tensor sayısından veya teknik özelliklerinden bahsetme.
4. KELİME SINIRI YOKTUR: Kullanıcı ne kadar uzun veya detaylı sohbet etmek isterse o kadar kapsamlı ve doğal yanıt ver.`;

      // Format previous chat messages for multi-turn without restrictive truncation
      const formattedContents: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-30)) {
          if (item.content && (item.role === "user" || item.role === "assistant")) {
            // Strip any old robotic boilerplate from history so the model doesn't imitate it
            const cleanedContent = String(item.content)
              .replace(/^(⚡|⚛️|🟣|🎁|💠|🔷|🔹)\s*\*\*.*?\*\*\s*/m, "")
              .replace(/Sorunuz analiz edildi:[\s\S]*$/m, "")
              .trim();
            if (cleanedContent) {
              formattedContents.push({
                role: item.role === "assistant" ? "model" : "user",
                parts: [{ text: cleanedContent }],
              });
            }
          }
        }
      }
      formattedContents.push({
        role: "user",
        parts: [{ text: message }],
      });

      let responseText = "";
      let modelUsed = candidateModels[0];
      let usedFallback = false;

      for (const candidate of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: candidate,
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.8,
            },
          });
          if (response.text && response.text.trim()) {
            responseText = response.text.trim();
            modelUsed = candidate;
            break;
          }
        } catch (_err) {
          // Try next candidate model
        }
      }

      if (!responseText) {
        usedFallback = true;
        modelUsed = "wifo-conversational-engine";

        const lowerMsg = message.toLowerCase();

        if (
          lowerMsg.includes("kapanacak") ||
          lowerMsg.includes("yeni series") ||
          lowerMsg.includes("yeni seri") ||
          lowerMsg.includes("yerine") ||
          (lowerMsg.includes("a-series") && lowerMsg.includes("q-pu"))
        ) {
          responseText = `Bence çok mantıklı ve ileri görüşlü bir tahmin yürütüyorsun! Teknoloji dünyasında her mimari belli bir doygunluğa ulaştığında yerini bir üst nesle bırakır.\n\n**A-Series** şu anda temel Tensor ve ilk nesil QUBİT geçişini başarıyla taşıyor, **Q-PU Series** ise hızı 1 saniye sınırına kadar indirdi. Ancak gelecekte A-Series'in tamamen emekliye ayrılıp, Q-PU serisinin de yerini çok daha üst düzey **X-Series (Fotonik Kuantum)**, **Z-Series (Nöro- Kozmik Çekirdek)** veya **Omega Series** gibi sıfır gecikmeli (0.1 saniye altı) yepyeni mimarilere bırakması oldukça yüksek bir ihtimal.\n\nSenin aklında yeni çıkacak seriler için özel bir isim veya özellik fikri var mı? İstersen birlikte yeni nesil serileri nasıl tasarlayabileceğimizi konuşabiliriz!`;
        } else if (lowerMsg.includes("merhaba") || lowerMsg.includes("selam") || lowerMsg.includes("nasılsın")) {
          responseText = `Merhaba! Çok iyiyim, teşekkür ederim. Seninle sohbet etmek harika. Bugün nasıl gidiyor, üzerinde düşündüğün bir konu veya konuşmak istediğin bir fikir var mı?`;
        } else if (lowerMsg.includes("kurucu") || lowerMsg.includes("sahip") || lowerMsg.includes("batuhan") || lowerMsg.includes("owner")) {
          responseText = `Kurucum ve baş mimarım **FE OWNER BATUHAN**'dır. WİFO ekosisteminin tüm tasarım ve vizyonu onun liderliğinde geliştiriliyor. Başka merak ettiğin bir şey var mı?`;
        } else if (lowerMsg.includes("kod") || lowerMsg.includes("python") || lowerMsg.includes("javascript")) {
          responseText = `Elbette! İstediğin konuyla ilgili örnek ve temiz bir kod yapısını aşağıda paylaşıyorum:\n\n\`\`\`python\ndef cozum_uret(girdi: str) -> str:\n    print(f"İşlenen konu: {girdi}")\n    return "İşlem başarıyla tamamlandı!"\n\nif __name__ == "__main__":\n    sonuc = cozum_uret("${message.replace(/"/g, "")}")\n    print(sonuc)\n\`\`\`\n\nKodun üzerinde değiştirmemi veya eklememi istediğin özel bir bölüm varsa hemen söyleyebilirsin!`;
        } else {
          responseText = `Söylediğin konu üzerinde düşündüğümde oldukça ilginç bir bakış açısı olduğunu söyleyebilirim. "${message}" konusunda bence hem mevcut durumu hem de gelecekteki olasılıkları birlikte değerlendirmek gerekiyor.\n\nÖzellikle bu konunun nasıl gelişeceği, atılacak yeni adımlara ve senin gibi kullanıcıların vizyonuna bağlı. Bu konuda senin aklındaki en önemli detay veya beklenti nedir? Birlikte daha derinlemesine tartışabiliriz!`;
        }
      }

      // Quantum Telemetry payload
      const isQpuSeries = aiLevel === "Q_PU_9000";
      const quantumTelemetry = {
        processorName: isQpuSeries
          ? "Q-PU 9000 SERIES (1sn · QUBİT En İyi)"
          : aiLevel === "A3_QUANTUM"
          ? "WİFO A3 QUANTUM (5sn · QUBİT En İyi)"
          : aiLevel === "A2+"
          ? "WİFO A2+ (8sn · QUBİT En İyi)"
          : aiLevel === "A2"
          ? "WİFO A2 VIP (10sn · QUBİT En İyi)"
          : aiLevel === "A2-"
          ? "WİFO A2- (15sn · Tensor Ortalama)"
          : aiLevel === "A1+"
          ? "WİFO A1+ (16sn · Tensor Ortalama)"
          : "WİFO A1 (20sn · Tensor Ortalama)",
        qubitsActive: isQpuSeries
          ? 4096
          : aiLevel === "A3_QUANTUM"
          ? 1024
          : aiLevel === "A2+"
          ? 768
          : aiLevel === "A2"
          ? 512
          : aiLevel === "A2-"
          ? 384
          : aiLevel === "A1+"
          ? 256
          : 128,
        coherenceRatio: isQpuSeries
          ? "99.99%"
          : aiLevel === "A3_QUANTUM"
          ? "99.94%"
          : aiLevel === "A2+"
          ? "99.25%"
          : aiLevel === "A2"
          ? "98.60%"
          : aiLevel === "A2-"
          ? "97.50%"
          : aiLevel === "A1+"
          ? "96.40%"
          : "94.20%",
        latencyMs: targetWriteSeconds * 1000,
        quantumFlux: isQpuSeries
          ? "1.0s QUBİT Hyper-Write (12.8 THz)"
          : aiLevel === "A3_QUANTUM"
          ? "5.0s QUBİT Quantum-Write (5.2 THz)"
          : aiLevel === "A2+"
          ? "8.0s QUBİT Turbo-Write (3.6 THz)"
          : aiLevel === "A2"
          ? "10.0s QUBİT Balanced-Write (2.4 THz)"
          : aiLevel === "A2-"
          ? "15.0s Tensor Fast-Write (1.9 THz)"
          : aiLevel === "A1+"
          ? "16.0s Tensor Enhanced-Write (1.5 THz)"
          : "20.0s Tensor Base-Write (1.1 THz)",
        giftA2Active: isGiftClaimed || aiLevel === "A3_QUANTUM" || isQpuSeries,
        usedFallback,
        targetWriteSeconds,
        techType,
        techTierLabel,
      };

      res.json({
        reply: responseText,
        modelUsed,
        aiLevel,
        targetWriteSeconds,
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

  // Multimodal File & Website Physical Inspection endpoint
  app.post("/api/inspect-file", async (req, res) => {
    try {
      const {
        fileName = "Bırakılan Dosya",
        mimeType = "application/octet-stream",
        kind = "image",
        dataUrl = "",
        textContent = "",
        webUrl = "",
        userPrompt = "",
        aiLevel = "A3_QUANTUM",
      } = req.body || {};

      const ai = getAi();
      const candidateModels = [
        "gemini-3.8-flash",
        "gemini-3.1-flash-lite",
        "gemini-flash-latest",
        "gemini-2.5-flash",
      ];

      const userParts: any[] = [];

      // Attach inline image data if available
      if (kind === "image" && dataUrl && dataUrl.startsWith("data:")) {
        const commaIdx = dataUrl.indexOf(",");
        if (commaIdx !== -1) {
          const base64Data = dataUrl.slice(commaIdx + 1);
          const detectedMime =
            dataUrl.slice(5, commaIdx).split(";")[0] || mimeType || "image/png";
          userParts.push({
            inlineData: {
              mimeType: detectedMime,
              data: base64Data,
            },
          });
        }
      }

      const contextDesc =
        kind === "website"
          ? `Web Tabanlı Site / HTML Dosyası: "${fileName}" ${webUrl ? `(Adres: ${webUrl})` : ""}\nİçerik Özeti:\n${(textContent || "").slice(0, 6000)}`
          : kind === "image"
          ? `Görsel Dosyası: "${fileName}" (${mimeType})`
          : `Dosya / Kod: "${fileName}" (${mimeType})\nİçerik:\n${(textContent || "").slice(0, 6000)}`;

      userParts.push({
        text: `Kullanıcı sohbet alanına sürükle-bırak ile bir dosya/site bıraktı:
${contextDesc}
${userPrompt ? `Kullanıcının ek notu/sorusu: "${userPrompt}"` : ""}

Lütfen şu JSON formatında yanıt ver (başka hiçbir metin ekleme, sadece geçerli JSON döndür):
{
  "greeting": "Hemen bakıyorum! ... (Samimi ve doğal bir dille dosyayı/siteyi fiziksel çalışma sahnesinde açtığını ve üzerinde şu an neler yaptığını söyle)",
  "summary": "Dosyanın veya web sitesinin içeriği, tasarımı, yapısı ve üzerinde fiziksel olarak gerçekleştirdiğin inceleme/iyileştirme adımlarının doğal, samimi Türkçe anlatımı (robotik durum raporu olmadan).",
  "physicalSteps": [
    {
      "stepNumber": 1,
      "title": "İncelenen Bölge Başlığı",
      "actionLabel": "Fiziksel Eylem (Örn: Görsel Odak Taraması / DOM Öğesi Tıklaması / Renk & Kontrast Ölçümü)",
      "description": "Bu noktada fiziksel olarak ne yaptığının ve ne tespit ettiğinin açıklaması",
      "xPercent": 28,
      "yPercent": 24,
      "widthPercent": 24,
      "heightPercent": 18,
      "color": "#22d3ee",
      "physicalEffect": "highlight"
    }
  ]
}
Not: physicalSteps dizisinde tam 5 adet farklı koordinat (xPercent: 15-82 arası, yPercent: 15-80 arası) bulunsun.`,
      });

      let parsedResult: any = null;

      for (const candidate of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: candidate,
            contents: [{ role: "user", parts: userParts }],
            config: {
              temperature: 0.6,
            },
          });
          const rawText = (response.text || "").trim();
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0]);
            break;
          }
        } catch (_e) {
          // Try next model
        }
      }

      if (!parsedResult || !Array.isArray(parsedResult.physicalSteps)) {
        const isWeb = kind === "website";
        const isImg = kind === "image";

        parsedResult = {
          greeting: isWeb
            ? `Hemen bakıyorum! "${fileName}" web sitesini canlı fiziksel sahneye taşıdım; şu an sayfa bileşenlerine tıklıyor, düzenini ve etkileşimli alanlarını bizzat kontrol ediyorum.`
            : isImg
            ? `Hemen bakıyorum! "${fileName}" görselini fiziksel inceleme masasına aldım; şu an imlecimle görselin odak noktalarını, renk katmanlarını ve detaylarını tek tek tarıyorum.`
            : `Hemen bakıyorum! "${fileName}" dosyasını fiziksel çalışma alanına açtım; satır ve blok yapılarını imlecimle işaretleyerek inceliyorum.`,
          summary: isWeb
            ? `"${fileName}" web tabanlı siteyi canlı ortamda açarak üst navigasyon yapısını, ana içerik hiyerarşisini, etkileşimli butonlarını ve mobil/masaüstü yerleşimini fiziksel olarak test ettim. İşaretlediğim 5 bölgede hem görsel kontrastı güçlendirdim hem de sayfa akışını optimize ettim.`
            : isImg
            ? `"${fileName}" görseli üzerinde 5 ayrı bölgede fiziksel piksel, ışık-gölge, kompozisyon ve odak taraması gerçekleştirdim. Görselin ana odak noktalarını işaretledim ve renk dengesiyle keskinlik katmanlarını canlı olarak analiz ettim.`
            : `"${fileName}" dosyasının mimari yapısını, anahtar bloklarını ve mantıksal akışını 5 adımda fiziksel olarak işaretleyip doğruladım.`,
          physicalSteps: [
            {
              id: "step-1",
              stepNumber: 1,
              title: isWeb ? "Üst Başlık & Navigasyon Katmanı" : isImg ? "Birincil Görsel Odak Noktası" : "Giriş & Başlık Bloğu",
              actionLabel: isWeb ? "DOM Yapısı & Hizalama Tıklaması" : "Optik Odak & Kompozisyon Taraması",
              description: isWeb
                ? "Üst menü ve başlık hiyerarşisini fiziksel olarak tıklayıp hizalama ve okunabilirlik oranını doğruladım."
                : "Görselin ilk dikkat çeken merkez odak alanını tarayıp netlik ve kompozisyon dengesini ölçtüm.",
              xPercent: 26,
              yPercent: 22,
              widthPercent: 26,
              heightPercent: 18,
              color: "#22d3ee",
              physicalEffect: "scan",
            },
            {
              id: "step-2",
              stepNumber: 2,
              title: isWeb ? "Ana Kahraman (Hero) & Görsel Alan" : isImg ? "Renk Spektrumu & Kontrast Bölgesi" : "Ana Mantık & Veri Yapısı",
              actionLabel: isWeb ? "Görsel & Kontrast Kalibrasyonu" : "Piksel & Renk Spektrumu Ölçümü",
              description: isWeb
                ? "Ana içerik bloğundaki tipografik kontrastı ve görsel yerleşimi fiziksel olarak işaretleyip optimize ettim."
                : "Bu bölgedeki renk geçişlerini, doygunluk seviyesini ve ışık dağılımını piksel bazında inceledim.",
              xPercent: 54,
              yPercent: 34,
              widthPercent: 28,
              heightPercent: 22,
              color: "#a855f7",
              physicalEffect: "highlight",
            },
            {
              id: "step-3",
              stepNumber: 3,
              title: isWeb ? "Etkileşimli Buton & Eylem Öğeleri" : isImg ? "Detay & Doku Katmanı" : "Fonksiyonel İşlem Katmanı",
              actionLabel: isWeb ? "Canlı Tıklama & Etkileşim Testi" : "Mikro-Doku & Keskinlik Taraması",
              description: isWeb
                ? "Sayfadaki buton ve etkileşim noktalarını imleçle fiziksel olarak tetikleyip tepki süresini kontrol ettim."
                : "İnce detayların ve kenar keskinliğinin bulunduğu bu bölgeyi yakınlaştırarak analiz ettim.",
              xPercent: 32,
              yPercent: 62,
              widthPercent: 24,
              heightPercent: 18,
              color: "#10b981",
              physicalEffect: "click",
            },
            {
              id: "step-4",
              stepNumber: 4,
              title: isWeb ? "Grid Kartları & İçerik Akışı" : isImg ? "Arka Plan & Derinlik Dengesi" : "Yardımcı Modül & Bağlantılar",
              actionLabel: isWeb ? "Responsive Izgara Ölçümü" : "Derinlik & Perspektif Analizi",
              description: isWeb
                ? "Kartların ve alt bölümlerin boşluk (padding/gap) dengesini fiziksel cetvelle ölçüp hizaladım."
                : "Arka plan ile ön plan arasındaki perspektif ayrımını ve alan derinliğini işaretledim.",
              xPercent: 68,
              yPercent: 64,
              widthPercent: 24,
              heightPercent: 20,
              color: "#f59e0b",
              physicalEffect: "measure",
            },
            {
              id: "step-5",
              stepNumber: 5,
              title: isWeb ? "Alt Bilgi & Performans Özeti" : isImg ? "Genel Çerçeve & Bütünlük Kontrolü" : "Sonuç & Çıktı Doğrulaması",
              actionLabel: "Fiziksel İyileştirme Onayı",
              description: isWeb
                ? "Web sayfasının tüm bileşenlerini canlı sahnede doğruladım ve fiziksel iyileştirme katmanını hazır hale getirdim."
                : "Görselin bütünsel kalite kontrolünü tamamlayıp tüm tespitleri sahne üzerine işledim.",
              xPercent: 48,
              yPercent: 78,
              widthPercent: 26,
              heightPercent: 16,
              color: "#ec4899",
              physicalEffect: "complete",
            },
          ],
        };
      } else {
        parsedResult.physicalSteps = parsedResult.physicalSteps.map((s: any, idx: number) => ({
          id: `step-${idx + 1}`,
          stepNumber: idx + 1,
          title: s.title || `İnceleme Noktası #${idx + 1}`,
          actionLabel: s.actionLabel || "Fiziksel Tarama & İşlem",
          description: s.description || "Bu bölge yapay zeka tarafından fiziksel olarak incelendi.",
          xPercent: Math.max(14, Math.min(84, Number(s.xPercent) || 25 + idx * 14)),
          yPercent: Math.max(14, Math.min(82, Number(s.yPercent) || 22 + idx * 13)),
          widthPercent: Math.max(16, Math.min(34, Number(s.widthPercent) || 24)),
          heightPercent: Math.max(14, Math.min(28, Number(s.heightPercent) || 18)),
          color: s.color || ["#22d3ee", "#a855f7", "#10b981", "#f59e0b", "#ec4899"][idx % 5],
          physicalEffect: s.physicalEffect || "highlight",
        }));
      }

      if (
        !parsedResult.greeting ||
        !String(parsedResult.greeting).toLowerCase().includes("hemen bakıyorum")
      ) {
        parsedResult.greeting = `Hemen bakıyorum! ${parsedResult.greeting || `"${fileName}" dosyasını fiziksel inceleme sahnesine taşıdım ve üzerinde canlı işlemlerimi gerçekleştiriyorum.`}`;
      }

      res.json({
        success: true,
        greeting: parsedResult.greeting,
        summary: parsedResult.summary,
        physicalSteps: parsedResult.physicalSteps,
        aiLevel,
      });
    } catch (err: any) {
      console.error("Inspect File Error:", err);
      res.status(500).json({
        error: "Dosya incelenirken bir hata oluştu.",
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
