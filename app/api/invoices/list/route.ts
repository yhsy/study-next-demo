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
async function listInvoices() {
  // 通过JOIN关联发票表和客户表，筛选出金额为666的发票记录
	const data = await sql`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666;
  `;
  // 列出invoices表中的20条记录，并按照id字段进行升序排序
  // const data = await sql`
  //   SELECT id, amount, status, customer_id
  //   FROM invoices
  //   ORDER BY id
  //   LIMIT 20;
  // `;
	return data;
}

// 处理GET请求的API路由处理函数
export async function GET(request: NextRequest) {
  try {
    const data = await sql`
      SELECT 
        invoices.id, 
        invoices.amount, 
        invoices.date, 
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 10
    `;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('获取发票列表错误:', error);
    
    if (isServerBuild()) {
      return NextResponse.json({ data: [] });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch invoices data' },
      { status: 500 }
    );
  }
}
