/**
 * Generate encryption key pairs for seeding the database
 * This is a simplified version just for test data
 */
export async function generateKeys(count: number) {
  const keys: { publicKey: string; privateKey: string }[] = [];
  
  // For seed data we'll just use placeholder keys since we're not actually
  // going to encrypt/decrypt the dummy messages
  for (let i = 0; i < count; i++) {
    const publicKey = `dummy_public_key_${i}_${Date.now()}`;
    const privateKey = `dummy_private_key_${i}_${Date.now()}`;
    
    keys.push({
      publicKey,
      privateKey
    });
  }
  
  return keys;
} 