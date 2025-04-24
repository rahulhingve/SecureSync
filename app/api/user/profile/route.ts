import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { AuthType } from '@prisma/client';

// Define session types
type SessionUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

type Session = {
  user?: SessionUser;
}

// Debug function to help us see what's happening
function debugSession(session: any) {
  console.log('Session data:', JSON.stringify(session, null, 2));
  return session;
}

// Get user profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    // Debug the session object
    console.log('Session in GET profile:', session);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to find the user by email first
    const userEmail = session.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found in session' }, { status: 401 });
    }

    // Since NextAuth's signIn callback already handles user creation with upsert,
    // we should just check if the user exists and create it if missing
    // This is a fallback in case the signIn callback didn't work properly
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {}, // No updates needed if the user exists
      create: {
        email: userEmail,
        name: session.user?.name || 'User',
        username: session.user?.name?.toLowerCase().replace(/\s+/g, '_') || `user_${Date.now()}`,
        auth_type: userEmail.includes("gmail") ? AuthType.Google : AuthType.Github,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Try to find the user by email
    const userEmail = session.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found in session' }, { status: 401 });
    }
    
    const body = await req.json();
    const { name, username } = body;
    
    // Update user profile using email to find the user
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        name,
        username,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
      },
    });
    
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update user status (not implemented until database schema has status)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json({ message: 'Status updates not implemented yet' });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 