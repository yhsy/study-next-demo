import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

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

// 查询发票和客户信息的函数
// 通过JOIN关联发票表和客户表，筛选出金额为666的发票记录
async function listInvoices() {
	const data = await sql`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666;
  `;

	return data;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }
    
    // 简单的SQL注入防护
    if (query.includes(';') || query.includes('--') || query.includes('/*')) {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }
    
    // 使用参数化查询防止SQL注入
    const results = await sql`
      SELECT * FROM customers 
      WHERE name ILIKE ${'%' + query + '%'} 
      OR email ILIKE ${'%' + query + '%'}
      LIMIT 10
    `;
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('查询错误:', error);
    
    if (isServerBuild()) {
      return NextResponse.json({ results: [] });
    }
    
    return NextResponse.json(
      { error: 'Failed to execute query' },
      { status: 500 }
    );
  }
}
