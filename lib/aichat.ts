import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateRequest {
  prompt: string;
}

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();

    if (!body.prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: body.prompt }],
      max_tokens: 250,
    });

    // For debugging: log the full response from the AI service
    console.log('AI Response:', JSON.stringify(response, null, 2));

    if (response.choices && response.choices.length > 0 && response.choices[0].message && response.choices[0].message.content) {
      return NextResponse.json({ result: response.choices[0].message.content });
    } else {
      // Log the unexpected structure
      console.error('Unexpected AI response structure:', response);
      return NextResponse.json({ error: 'Failed to get a valid response from AI. Check server logs for details.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error calling AI API:', error);
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to generate response due to an internal error.' }, { status: 500 });
  }
}
