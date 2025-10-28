import { NextResponse } from 'next/server';
import { getMentorResponse } from '@/ai/flows/mentor-server';

export async function POST(req: Request) {
  try {
    const { history, userMessage, userName } = await req.json();

    if (!Array.isArray(history) || typeof userMessage !== 'string' || typeof userName !== 'string') {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const reply = await getMentorResponse(history, userMessage, userName);
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('API Error in /api/mentor:', error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred' }, { status: 500 });
  }
}
