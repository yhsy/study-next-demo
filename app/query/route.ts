// 导入PostgreSQL数据库驱动
import postgres from 'postgres';

// 创建数据库连接实例，启用SSL安全连接
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

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

// 处理GET请求的API路由处理函数
export async function GET() {
  // 临时返回消息，需要删除此段代码
  // return Response.json({
  //   message:
  //     'Uncomment this file and remove this line. You can delete this file when you are finished.',
  // });
  try {
    // 调用listInvoices函数获取查询结果并返回JSON响应
  	return Response.json(await listInvoices());
  } catch (error) {
    // 发生错误时返回500状态码和错误信息
  	return Response.json({ error }, { status: 500 });
  }
}
