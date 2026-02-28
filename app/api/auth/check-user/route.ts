import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        exists: false,
        email: normalizedEmail,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    return NextResponse.json({
      exists: !!user,
      email: normalizedEmail,
    });
  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json(
      { exists: false, email: req.body },
      { status: 200 }
    );
  }
}
