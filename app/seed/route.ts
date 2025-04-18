// 导入必要的依赖
import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';
import { NextResponse } from 'next/server';

// 检查是否在服务器端构建过程中
const isServerBuild = () => {
  return process.env.NODE_ENV === 'production' && typeof window === 'undefined';
};

// 安全地创建数据库连接
const getDB = () => {
  if (process.env.POSTGRES_URL) {
    return postgres(process.env.POSTGRES_URL, { ssl: 'require' });
  }
  
  // 返回一个模拟的数据库对象
  const mockSql = (strings: TemplateStringsArray, ...values: any[]): Promise<any[]> => {
    console.log('模拟SQL查询:', { strings, values });
    return Promise.resolve([]);
  };
  
  return mockSql as unknown as ReturnType<typeof postgres>;
};

// 使用函数而不是直接创建连接
const sql = getDB();

// 初始化用户表并插入种子数据
async function seedUsers() {
  // 创建用户表，包含id、姓名、邮箱和密码字段
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  // 批量插入用户数据，对密码进行哈希处理
  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}

// 初始化发票表并插入种子数据
async function seedInvoices() {
  // 创建发票表，包含id、客户id、金额、状态和日期字段
  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  // 批量插入发票数据
  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedInvoices;
}

// 初始化客户表并插入种子数据
async function seedCustomers() {
  // 创建客户表，包含id、姓名、邮箱和头像URL字段
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  // 批量插入客户数据
  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedCustomers;
}

// 初始化收入表并插入种子数据
async function seedRevenue() {
  // 创建收入表，包含月份和收入金额字段
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  // 批量插入收入数据
  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );

  return insertedRevenue;
}

// 处理GET请求，初始化数据库并填充种子数据
export async function GET() {
  try {
    // 检查数据库中是否已有数据
    const checkInvoices = await sql`SELECT COUNT(*) FROM invoices`;
    const count = Number(checkInvoices[0]?.count || '0');
    
    if (count > 0) {
      return NextResponse.json({ message: '数据库已有数据，无需重新初始化' });
    }

    // 启用UUID扩展
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    
    const result = await sql.begin((sql) => [
      seedUsers(),
      seedCustomers(),
      seedInvoices(),
      seedRevenue(),
    ]);

    return NextResponse.json({ message: '数据库初始化成功' });
  } catch (error) {
    console.error('数据库初始化错误:', error);
    
    if (isServerBuild()) {
      return NextResponse.json({ message: '构建过程中跳过数据库初始化' });
    }
    
    return NextResponse.json(
      { error: '数据库初始化失败' },
      { status: 500 }
    );
  }
}
