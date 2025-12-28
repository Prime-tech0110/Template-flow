
import { GoogleGenAI } from "@google/genai";

/**
 * Generates a marketing description for a website template.
 */
export const generateTemplateDescription = async (title: string, category: string, tech: string[]) => {
  // Create a new instance right before use to ensure the latest API key is utilized
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a compelling, high-converting marketing description (about 3 sentences) for a website template named "${title}". It is in the ${category} category and uses ${tech.join(', ')}. Focus on clean design, performance, and modern aesthetics.`,
    });
    return response.text;
  } catch (error) {
    console.error('Error generating description:', error);
    return "Error generating description. Please try again.";
  }
};

/**
 * Generates a development roadmap for building a template marketplace.
 */
export const getProjectRoadmap = async () => {
    // Create a new instance right before use to ensure the latest API key is utilized
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a step-by-step development roadmap for building a Premium Template Marketplace using Next.js, Tailwind, and Supabase. Keep it concise with 5 major phases.`,
      });
      return response.text;
    } catch (error) {
      console.error('Error generating roadmap:', error);
      return "Roadmap unavailable.";
    }
}

/**
 * Edits an image using a text prompt via Gemini 2.5 Flash Image.
 */
export const editImageWithAI = async (base64ImageData: string, prompt: string, mimeType: string = 'image/jpeg') => {
  // Create a new instance right before use to ensure the latest API key is utilized
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from Gemini");
  } catch (error) {
    console.error('Error editing image:', error);
    throw error;
  }
};

/**
 * Animates an image into a video using Veo 3.1.
 */
export const animateImageWithVeo = async (base64ImageData: string, prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
  // Always create a new instance for Veo to ensure the most up-to-date API key is used
  const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    let operation = await veoAi.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || 'Animate this image with subtle cinematic movement',
      image: {
        imageBytes: base64ImageData,
        mimeType: 'image/jpeg',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await veoAi.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed - no URI found");

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error animating video:', error);
    throw error;
  }
};
