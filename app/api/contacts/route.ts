import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all contacts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = parseInt(session.user.id as string);
    
    const contacts = await prisma.contact.findMany({
      where: { userId },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true,
            status: true,
            lastSeen: true,
          },
        },
      },
    });
    
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add new contact
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { contactId, nickname } = body;
    
    const userId = parseInt(session.user.id as string);
    
    // Check if user is trying to add themselves
    if (userId === contactId) {
      return NextResponse.json({ error: 'Cannot add yourself as a contact' }, { status: 400 });
    }
    
    // Check if contact already exists
    const existingContact = await prisma.contact.findUnique({
      where: {
        userId_contactId: {
          userId,
          contactId,
        },
      },
    });
    
    if (existingContact) {
      return NextResponse.json({ error: 'Contact already exists' }, { status: 409 });
    }
    
    // Create contact
    const contact = await prisma.contact.create({
      data: {
        userId,
        contactId,
        nickname,
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true,
            status: true,
            lastSeen: true,
          },
        },
      },
    });
    
    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Error adding contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update contact
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { contactId, nickname, blocked } = body;
    
    const userId = parseInt(session.user.id as string);
    
    const updatedContact = await prisma.contact.update({
      where: {
        userId_contactId: {
          userId,
          contactId,
        },
      },
      data: {
        nickname,
        blocked,
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true,
            status: true,
            lastSeen: true,
          },
        },
      },
    });
    
    return NextResponse.json({ contact: updatedContact });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete contact
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const contactId = parseInt(searchParams.get('contactId') as string);
    
    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }
    
    const userId = parseInt(session.user.id as string);
    
    await prisma.contact.delete({
      where: {
        userId_contactId: {
          userId,
          contactId,
        },
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 