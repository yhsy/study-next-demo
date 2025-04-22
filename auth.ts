import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';
 
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
 
async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
 
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // console.log('尝试使用凭证进行授权:', credentials);
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        // console.log('解析凭证成功:', parsedCredentials.success);
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          // console.log('尝试查找邮箱为的用户:', email);
          const user = await getUser(email);
          // console.log('用户找到:', !!user); 
          if (!user) return null;

          // console.log('正在比较提供的密码与存储的哈希值...');
          const passwordsMatch = await bcrypt.compare(password, user.password);
          // console.log('密码匹配:', passwordsMatch); 
          if (passwordsMatch) return user;
        }

        // console.log('授权失败，返回 null。');
        return null;
      },
    }),
  ],
});