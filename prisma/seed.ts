import { PrismaClient } from '@prisma/client';
import { generateKeys } from '../lib/seedUtils';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with dummy data...');

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.chatParticipant.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();

  console.log('Generating encryption keys for dummy users...');
  const keys = await generateKeys(5);

  // Create dummy users
  console.log('Creating dummy users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        auth_type: 'Google',
        bio: 'Software developer passionate about cybersecurity',
        status: 'ONLINE',
        lastSeen: new Date(),
        publicKey: keys[0].publicKey,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        username: 'janesmith',
        auth_type: 'Github',
        bio: 'UX designer who loves creating intuitive experiences',
        status: 'ONLINE',
        lastSeen: new Date(),
        publicKey: keys[1].publicKey,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        username: 'alexj',
        auth_type: 'Google',
        bio: 'Data scientist and machine learning enthusiast',
        status: 'AWAY',
        lastSeen: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        publicKey: keys[2].publicKey,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Maria Garcia',
        email: 'maria@example.com',
        username: 'mariag',
        auth_type: 'Github',
        bio: 'Full-stack developer specializing in React and Node.js',
        status: 'OFFLINE',
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        publicKey: keys[3].publicKey,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Sam Wilson',
        email: 'sam@example.com',
        username: 'samw',
        auth_type: 'Google',
        bio: 'DevOps engineer with a passion for automation',
        status: 'ONLINE',
        lastSeen: new Date(),
        publicKey: keys[4].publicKey,
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create contacts
  console.log('Creating contacts...');
  await Promise.all([
    // John's contacts
    prisma.contact.create({
      data: {
        userId: users[0].id,
        contactId: users[1].id,
        nickname: 'Jane',
      },
    }),
    prisma.contact.create({
      data: {
        userId: users[0].id,
        contactId: users[2].id,
      },
    }),
    prisma.contact.create({
      data: {
        userId: users[0].id,
        contactId: users[3].id,
      },
    }),

    // Jane's contacts
    prisma.contact.create({
      data: {
        userId: users[1].id,
        contactId: users[0].id,
        nickname: 'Johnny',
      },
    }),
    prisma.contact.create({
      data: {
        userId: users[1].id,
        contactId: users[4].id,
      },
    }),

    // Alex's contacts
    prisma.contact.create({
      data: {
        userId: users[2].id,
        contactId: users[0].id,
      },
    }),
    prisma.contact.create({
      data: {
        userId: users[2].id,
        contactId: users[3].id,
      },
    }),

    // Maria's contacts
    prisma.contact.create({
      data: {
        userId: users[3].id,
        contactId: users[1].id,
      },
    }),
    prisma.contact.create({
      data: {
        userId: users[3].id,
        contactId: users[4].id,
      },
    }),

    // Sam's contacts
    prisma.contact.create({
      data: {
        userId: users[4].id,
        contactId: users[0].id,
      },
    }),
    prisma.contact.create({
      data: {
        userId: users[4].id,
        contactId: users[2].id,
      },
    }),
  ]);

  console.log('Created contacts');

  // Create direct chat between John and Jane
  console.log('Creating direct chats...');
  const johnJaneChat = await prisma.chat.create({
    data: {
      type: 'DIRECT',
      creatorId: users[0].id,
      isEncrypted: true,
      participants: {
        create: [
          {
            userId: users[0].id,
            isAdmin: true,
          },
          {
            userId: users[1].id,
            isAdmin: false,
          },
        ],
      },
    },
  });

  // Create direct chat between John and Alex
  const johnAlexChat = await prisma.chat.create({
    data: {
      type: 'DIRECT',
      creatorId: users[0].id,
      isEncrypted: true,
      participants: {
        create: [
          {
            userId: users[0].id,
            isAdmin: true,
          },
          {
            userId: users[2].id,
            isAdmin: false,
          },
        ],
      },
    },
  });

  // Create group chat with multiple participants
  console.log('Creating group chat...');
  const groupChat = await prisma.chat.create({
    data: {
      type: 'GROUP',
      name: 'Project Team',
      creatorId: users[0].id,
      isEncrypted: true,
      participants: {
        create: [
          {
            userId: users[0].id,
            isAdmin: true,
          },
          {
            userId: users[1].id,
            isAdmin: false,
          },
          {
            userId: users[2].id,
            isAdmin: false,
          },
          {
            userId: users[3].id,
            isAdmin: false,
          },
        ],
      },
    },
  });

  console.log('Created chats');

  // Add messages to John-Jane chat
  console.log('Adding messages to John-Jane chat...');
  const johnJaneMessages = await Promise.all([
    prisma.message.create({
      data: {
        content: 'Hey Jane, how are you doing?',
        senderId: users[0].id,
        recipientId: users[1].id,
        chatId: johnJaneChat.id,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isEncrypted: true,
      },
    }),
    prisma.message.create({
      data: {
        content: 'Hi John! I\'m doing great, thanks for asking. How about you?',
        senderId: users[1].id,
        recipientId: users[0].id,
        chatId: johnJaneChat.id,
        createdAt: new Date(Date.now() - 1.9 * 60 * 60 * 1000), // 1.9 hours ago
        isEncrypted: true,
        isRead: true,
      },
    }),
    prisma.message.create({
      data: {
        content: 'I\'m good too! Just working on the new project. Have you seen the requirements?',
        senderId: users[0].id,
        recipientId: users[1].id,
        chatId: johnJaneChat.id,
        createdAt: new Date(Date.now() - 1.8 * 60 * 60 * 1000), // 1.8 hours ago
        isEncrypted: true,
      },
    }),
    prisma.message.create({
      data: {
        content: 'Yes, I reviewed them yesterday. I think we should focus on the security features first.',
        senderId: users[1].id,
        recipientId: users[0].id,
        chatId: johnJaneChat.id,
        createdAt: new Date(Date.now() - 1.7 * 60 * 60 * 1000), // 1.7 hours ago
        isEncrypted: true,
        isRead: true,
      },
    }),
    prisma.message.create({
      data: {
        content: 'Great idea! Let\'s start with implementing end-to-end encryption.',
        senderId: users[0].id,
        recipientId: users[1].id,
        chatId: johnJaneChat.id,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isEncrypted: true,
      },
    }),
  ]);

  // Add messages to John-Alex chat
  console.log('Adding messages to John-Alex chat...');
  const johnAlexMessages = await Promise.all([
    prisma.message.create({
      data: {
        content: 'Hey Alex, do you have time to discuss the data models?',
        senderId: users[0].id,
        recipientId: users[2].id,
        chatId: johnAlexChat.id,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        isEncrypted: true,
      },
    }),
    prisma.message.create({
      data: {
        content: 'Sure, John. I can talk in about an hour if that works for you?',
        senderId: users[2].id,
        recipientId: users[0].id,
        chatId: johnAlexChat.id,
        createdAt: new Date(Date.now() - 4.8 * 60 * 60 * 1000), // 4.8 hours ago
        isEncrypted: true,
        isRead: true,
      },
    }),
    prisma.message.create({
      data: {
        content: 'That works perfectly. I\'ll prepare some diagrams to share with you.',
        senderId: users[0].id,
        recipientId: users[2].id,
        chatId: johnAlexChat.id,
        createdAt: new Date(Date.now() - 4.7 * 60 * 60 * 1000), // 4.7 hours ago
        isEncrypted: true,
      },
    }),
  ]);

  // Add messages to group chat
  console.log('Adding messages to group chat...');
  const groupMessages = await Promise.all([
    prisma.message.create({
      data: {
        content: 'Welcome everyone to the project team chat!',
        senderId: users[0].id,
        chatId: groupChat.id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isEncrypted: true,
      },
    }),
    prisma.message.create({
      data: {
        content: 'Thanks John! Looking forward to working with everyone.',
        senderId: users[1].id,
        chatId: groupChat.id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000), // 3 days ago + 5 minutes
        isEncrypted: true,
      },
    }),
    prisma.message.create({
      data: {
        content: 'Hi team! Excited to get started on this project.',
        senderId: users[2].id,
        chatId: groupChat.id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000), // 3 days ago + 10 minutes
        isEncrypted: true,
      },
    }),
    prisma.message.create({
      data: {
        content: 'Hello everyone! I just joined the team. Looking forward to collaborating!',
        senderId: users[3].id,
        chatId: groupChat.id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isEncrypted: true,
      },
    }),
    prisma.message.create({
      data: {
        content: 'Welcome Maria! We were just discussing the timeline for the first milestone.',
        senderId: users[0].id,
        chatId: groupChat.id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000), // 2 days ago + 15 minutes
        isEncrypted: true,
      },
    }),
    prisma.message.create({
      data: {
        content: 'I think we should aim to complete the basic UI by the end of next week. What do you all think?',
        senderId: users[1].id,
        chatId: groupChat.id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        isEncrypted: true,
      },
    }),
    prisma.message.create({
      data: {
        content: 'That sounds reasonable. I can have the database schema ready by Wednesday.',
        senderId: users[2].id,
        chatId: groupChat.id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 1 day ago + 30 minutes
        isEncrypted: true,
      },
    }),
    prisma.message.create({
      data: {
        content: 'Perfect! And I\'ll focus on the authentication system.',
        senderId: users[0].id,
        chatId: groupChat.id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 1 day ago + 45 minutes
        isEncrypted: true,
      },
    }),
  ]);

  console.log('Added messages to chats');

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 