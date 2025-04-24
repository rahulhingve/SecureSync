import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

// Get all chats for the user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session || !session.user || !session.user.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find the user by the email from the session
    const user = await prisma.user.findFirst({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get all chats where user is a participant
    const chats = await prisma.chatParticipant.findMany({
      where: { userId: user.id },
      include: {
        chat: {
          include: {
            messages: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
              where: {
                isDeleted: false,
              },
            },
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    status: true,
                    lastSeen: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        chat: {
          updatedAt: 'desc',
        },
      },
    });
    
    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create a new chat
export async function POST(req: NextRequest) {
  console.log('Chat creation API called');
  try {
    const session = await getServerSession(authOptions) as Session | null;
    console.log('Session in chat creation:', session);
    
    if (!session || !session.user || !session.user.id || !session.user.email) {
      console.log('Unauthorized: No valid session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if request has a body
    const contentType = req.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      console.log('Invalid content type:', contentType);
      return NextResponse.json({ error: 'Invalid content type, expected application/json' }, { status: 400 });
    }
    
    // Clone the request before reading the body to ensure we can read it only once
    let body;
    try {
      // Get the request body as a string and parse it once
      const text = await req.text();
      if (!text || text.trim() === '') {
        return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
      }
      
      console.log('Raw request body:', text);
      body = JSON.parse(text);
      console.log('Parsed body:', body);
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    if (!body || typeof body !== 'object') {
      console.log('Invalid request body:', body);
      return NextResponse.json({ error: 'Request body must be a valid JSON object' }, { status: 400 });
    }
    
    const { name, type, participantIds, isEncrypted } = body;
    console.log('Extracted data:', { name, type, participantIds, isEncrypted });
    
    // Validate required fields
    if (!type) {
      console.log('Chat type is missing');
      return NextResponse.json({ error: 'Chat type is required' }, { status: 400 });
    }
    
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      console.log('Invalid or missing participantIds:', participantIds);
      return NextResponse.json({ error: 'At least one participant is required' }, { status: 400 });
    }
    
    // Find the user by the email from the session
    const user = await prisma.user.findFirst({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userId = user.id;
    console.log('Current user ID:', userId);
    
    // Create a new chat
    try {
      const chat = await prisma.chat.create({
        data: {
          name: name || null,
          type,
          creatorId: userId,
          isEncrypted: isEncrypted ?? true,
          participants: {
            create: [
              // Add the creator as a participant and admin
              {
                userId,
                isAdmin: true,
              },
              // Add other participants
              ...participantIds.map((id: number) => ({
                userId: id,
                isAdmin: false,
              })),
            ],
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                  status: true,
                  lastSeen: true,
                },
              },
            },
          },
        },
      });
      
      console.log('Created chat successfully:', chat.id);
      return NextResponse.json({ chat });
    } catch (dbError) {
      console.error('Database error when creating chat:', dbError);
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
      return NextResponse.json({ error: 'Failed to create chat in database', details: errorMessage }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating chat:', error);
    // Return a detailed error message for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage,
      stack: errorStack
    }, { status: 500 });
  }
} 