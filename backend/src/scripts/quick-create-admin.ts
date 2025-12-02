import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin(): Promise<void> {
    try {
        const username = 'admin';
        const password = 'admin123';

        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
            console.log('❌ User already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: 'admin'
            }
        });

        console.log(`✅ Admin user created: ${user.username}`);
        console.log(`Password: admin123`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to create admin:', err);
        process.exit(1);
    }
}

createAdmin();
