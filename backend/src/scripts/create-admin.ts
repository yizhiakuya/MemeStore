import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => 
    new Promise((resolve) => rl.question(query, resolve));

async function createAdmin(): Promise<void> {
    try {
        console.log('👤 Create Admin User\n');

        const username = await question('Username: ');
        const password = await question('Password: ');

        if (!username || !password) {
            console.error('❌ Username and password are required');
            process.exit(1);
        }

        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
            console.error('❌ User already exists');
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: 'admin'
            }
        });

        console.log(`\n✅ Admin user created: ${user.username}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to create admin:', err);
        process.exit(1);
    } finally {
        rl.close();
    }
}

createAdmin();
