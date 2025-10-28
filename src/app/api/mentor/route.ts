import { NextResponse } from 'next/server';
import { getMentorResponse } from '@/ai/flows/mentor-server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🟢 /api/mentor request body:", body);

    const { history, userMessage, userName } = body;

    if (!Array.isArray(history) || typeof userMessage !== 'string' || typeof userName !== 'string') {
      console.error("🔴 Invalid request body:", body);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const reply = await getMentorResponse(history, userMessage, userName);
    console.log("🟢 Mentor reply:", reply);

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('🔴 API Error in /api/mentor:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
