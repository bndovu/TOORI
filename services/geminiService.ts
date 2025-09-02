import { GoogleGenAI, Type } from "@google/genai";
import { StoryLength, ImageStyle } from "../App";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const withRetry = async <T>(
  apiCall: () => Promise<T>, 
  onProgress: (message: string) => void,
  attempt: number = 1
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error: any) {
    if (error.message && error.message.includes('429')) {
      if (attempt > 3) {
        console.error("API rate limit exceeded. Max retries reached.", error);
        throw new Error("The magic is in high demand! Please try again in a few moments.");
      }
      const delay = Math.pow(2, attempt) * 1000;
      onProgress(`The stars are aligning... Retrying in ${delay / 1000}s`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(apiCall, onProgress, attempt + 1);
    }
    console.error("An unexpected error occurred with the Gemini API:", error);
    throw error; // Re-throw other errors
  }
};


export const generateStory = async (
    prompt: string, 
    length: StoryLength, 
    image?: { mimeType: string; data: string }
): Promise<string> => {
    const textPrompt = `Based on this prompt, create a ${length}-length, enchanting story: "${prompt}"`;
    
    const contents = image 
        ? { parts: [{ text: textPrompt }, { inlineData: { mimeType: image.mimeType, data: image.data } }] }
        : textPrompt;

    const apiCall = () => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: "You are a master storyteller, weaving short, enchanting, and imaginative tales that evoke a sense of wonder. Your stories should be magical and captivating, suitable for all ages. Format your response in paragraphs.",
            temperature: 0.8,
            topP: 0.95,
        },
    });
    
    try {
        const response = await withRetry(apiCall, () => {});
        return response.text;
    } catch (error) {
        console.error("Error generating story from Gemini API:", error);
        if (error instanceof Error && error.message.includes('high demand')) {
            throw error;
        }
        throw new Error("Failed to generate story. Please check the API configuration.");
    }
};

const base64Encode = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};


export const generateVideo = async (
  story: string,
  onProgress: (message: string) => void
): Promise<{ videoUrl: string, sceneImages: string[] }> => {
    const apiCall = async () => {
        // Step 1: Extract 2-4 key scenes from the story
        onProgress("Extracting key scenes from the story...");
        const sceneExtractionResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the following story and identify 2 to 4 distinct key visual scenes. For each scene, provide a one-sentence description suitable for an image generation prompt. Story: "${story}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scenes: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING, description: "A one-sentence visual description of a scene." }
                        }
                    }
                }
            }
        });
        const { scenes } = JSON.parse(sceneExtractionResponse.text);
        if (!scenes || scenes.length === 0) {
            throw new Error("Could not extract any scenes from the story.");
        }

        // Step 2: Generate an image for each scene
        onProgress(`Generating ${scenes.length} scene images...`);
        const imagePromises = scenes.map((scenePrompt: string, index: number) => {
            onProgress(`Illustrating scene ${index + 1} of ${scenes.length}...`);
            return ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: `${scenePrompt}, vibrant colors, highly detailed, fantasy art style`,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' },
            });
        });
        const imageResults = await Promise.all(imagePromises);
        const sceneImages = imageResults.map(res => `data:image/jpeg;base64,${res.generatedImages[0].image.imageBytes}`);
        const firstImageBytes = imageResults[0].generatedImages[0].image.imageBytes;

        // Step 3: Generate the video using the first image as a seed
        onProgress("Animating the scenes into a video...");
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: `Create a short, enchanting video clip based on this story: "${story}"`,
            image: { imageBytes: firstImageBytes, mimeType: 'image/jpeg' },
            config: { numberOfVideos: 1 },
        });

        const progressMessages = ["Weaving the frames together...", "Adding a final sprinkle of magic...", "The visual tale is almost ready..."];
        let messageIndex = 0;
        while (!operation.done) {
            onProgress(progressMessages[messageIndex % progressMessages.length]);
            messageIndex++;
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation });
        }

        if (operation.error) throw new Error(`Video generation failed: ${operation.error.message}`);
        
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) throw new Error("Video generation completed, but no download link was found.");

        onProgress("Downloading video...");
        const response = await fetch(`${downloadLink}&key=${API_KEY}`);
        if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);
        
        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);

        return { videoUrl, sceneImages };
    };
    
    try {
        return await withRetry(() => apiCall(), onProgress);
    } catch (error) {
        console.error("Error generating video from Gemini API:", error);
        if (error instanceof Error) {
             if (error.message.includes('high demand')) throw error;
             throw new Error(`Failed to generate video. ${error.message}`);
        }
        throw new Error("An unknown error occurred during video generation.");
    }
};

export const generateMusic = async (
  story: string,
  onProgress: (message: string) => void
): Promise<string> => {
    const apiCall = async () => {
        onProgress("Listening to the story's heartbeat...");
        
        const keywordResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Extract 5-7 keywords from this story that capture its mood, theme, and key elements. Return them as a single comma-separated string. For example: 'magic, forest, friendship, adventure, crystal'. Story: "${story}"`,
        });
        const keywords = keywordResponse.text;
        console.log("Generated keywords for music:", keywords);

        const progressMessages = [
            `Tuning instruments for: ${keywords}`,
            "Translating words into notes...",
            "Composing a whimsical melody...",
            "Orchestrating the harmonies...",
            "The soundtrack is almost ready..."
        ];
        
        for (const message of progressMessages) {
            onProgress(message);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        return "https://storage.googleapis.com/maker-suite-media/o/storage/v1/b/maker-suite-media/o/listenable_document_1693382713854.mp3";
    };

    try {
        return await withRetry(() => apiCall(), onProgress);
    } catch (error) {
        console.error("Error generating music:", error);
        if (error instanceof Error) {
            if (error.message.includes('high demand')) throw error;
            throw new Error(`Failed to compose soundtrack. ${error.message}`);
        }
        throw new Error("An unknown error occurred during music generation.");
    }
};


export const extractCharacters = async (story: string): Promise<{ name: string; description: string }[]> => {
    const apiCall = () => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following story and identify up to 3 main characters. For each character, provide their name and a concise, one-sentence visual description suitable for an image generation prompt. Story: "${story}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    characters: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: {
                                    type: Type.STRING,
                                    description: "The character's name."
                                },
                                description: {
                                    type: Type.STRING,
                                    description: "A short, visual description of the character."
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    try {
        const response = await withRetry(apiCall, () => {});
        const json = JSON.parse(response.text);
        return json.characters || [];
    } catch (error) {
        console.error("Error extracting characters from Gemini API:", error);
        if (error instanceof Error && error.message.includes('high demand')) {
            throw error;
        }
        throw new Error("Failed to extract characters.");
    }
};

export const generateCharacterImage = async (description: string, style: ImageStyle): Promise<string> => {
    const apiCall = () => ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `${description}, ${style} style, high-definition, detailed, eye-catching composition`,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
        },
    });

    try {
        const response = await withRetry(apiCall, () => {});
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating character image from Gemini API:", error);
        if (error instanceof Error && error.message.includes('high demand')) {
            throw error;
        }
        throw new Error("Failed to generate character image.");
    }
};
