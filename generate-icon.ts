import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function generateIcon() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: 'A futuristic and vibrant AI app icon for "Funzone". The design should feature a stylized "F" or a friendly robot face, using a palette of indigo, purple, and emerald. 3D render, high resolution, clean background, modern tech aesthetic.',
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync('public/funzone-icon.png', buffer);
        console.log("Icon generated and saved to public/funzone-icon.png");
        return;
      }
    }
    console.error("No image part found in response");
  } catch (error) {
    console.error("Error generating icon:", error);
  }
}

generateIcon();
