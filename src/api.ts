import { AIResponse } from './types';

export async function getAIResponse(prompt: string): Promise<string> {
  const promptWithInstruction = `${prompt}. Jawablah dalam bahasa Indonesia, jangan menggunakan list untuk respon jawabannya, dan panggil aku Ivan.`;
  
  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/llama3-70b-instruct',
        messages: [{ role: 'user', content: promptWithInstruction }],
        temperature: 0.5,
        top_p: 1,
        max_tokens: 1024,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `API request failed with status ${response.status}: ${
          errorData?.error?.message || response.statusText
        }`
      );
    }

    const data = await response.json();
    
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from AI API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting AI response:', error);
    if (error instanceof Error) {
      return `Maaf Ivan, terjadi kesalahan: ${error.message}. Silakan coba lagi.`;
    }
    return 'Maaf Ivan, sepertinya ada masalah dengan koneksi. Bisa coba lagi?';
  }
}