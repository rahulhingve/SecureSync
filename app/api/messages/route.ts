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

// Get messages for a chat
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session || !session.user || !session.user.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find the user by email from the session
    const user = await prisma.user.findFirst({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userId = user.id;
    
    const { searchParams } = new URL(req.url);
    const chatId = parseInt(searchParams.get('chatId') as string);
    const limit = parseInt(searchParams.get('limit') || '50');
    const cursor = searchParams.get('cursor');
    
    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }
    
    // Check if user is a participant of the chat
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId,
          chatId,
        },
      },
    });
    
    if (!participant) {
      return NextResponse.json({ error: 'Not a participant of this chat' }, { status: 403 });
    }
    
    // Update last read timestamp
    await prisma.chatParticipant.update({
      where: {
        userId_chatId: {
          userId,
          chatId,
        },
      },
      data: {
        lastRead: new Date(),
      },
    });
    
    // Query parameters for pagination
    const queryParams: any = {
      where: {
        chatId,
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    };
    
    // Add cursor for pagination
    if (cursor) {
      queryParams.cursor = {
        id: parseInt(cursor),
      };
      queryParams.skip = 1; // Skip the cursor
    }
    
    const messages = await prisma.message.findMany(queryParams);
    
    // Get the ID of the last message for next cursor
    const nextCursor = messages.length > 0 ? messages[messages.length - 1].id : null;
    
    return NextResponse.json({ 
      messages: messages.reverse(), // Return in chronological order
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Send a new message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session || !session.user || !session.user.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find the user by email from the session
    const user = await prisma.user.findFirst({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const senderId = user.id;
    
    const body = await req.json();
    const { chatId, content, encryptedContent, recipientId, replyToId, isEncrypted } = body;
    
    // Check if user is a participant of the chat
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId: senderId,
          chatId,
        },
      },
    });
    
    if (!participant) {
      return NextResponse.json({ error: 'Not a participant of this chat' }, { status: 403 });
    }
    
    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        encryptedContent,
        senderId,
        recipientId,
        chatId,
        replyToId,
        isEncrypted: isEncrypted ?? true,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    
    // Update chat's updatedAt time
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });
    
    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete message (mark as deleted)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session || !session.user || !session.user.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find the user by email from the session
    const user = await prisma.user.findFirst({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userId = user.id;
    
    const { searchParams } = new URL(req.url);
    const messageId = parseInt(searchParams.get('messageId') as string);
    
    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }
    
    // Get the message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });
    
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    
    // Check if user is the sender of the message
    if (message.senderId !== userId) {
      return NextResponse.json({ error: 'Not authorized to delete this message' }, { status: 403 });
    }
    
    // Mark message as deleted
    await prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 