'use server';

// 导入所需的依赖
import { z } from 'zod';
import postgres from 'postgres';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
 
// 定义发票表单的验证Schema
const FormSchema = z.object({
  id: z.string(),                              // 发票ID，字符串类型
  customerId: z.string(),                      // 客户ID，字符串类型
  amount: z.coerce.number(),                   // 金额，强制转换为数字类型
  status: z.enum(['pending', 'paid']),         // 状态，限定为'pending'或'paid'
  date: z.string(),                            // 日期，字符串类型
});
 
// 创建新发票时使用的Schema，省略id和date字段
const CreateInvoice = FormSchema.omit({ id: true, date: true });
 
// 创建新发票的服务端操作函数
export async function createInvoice(formData: FormData) {
  try {
    // 解析并验证表单数据
    const { customerId, amount, status } = CreateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });

    // 将金额转换为分为单位
    const amountInCents = amount * 100;
    // 获取当前日期（YYYY-MM-DD格式）
    const date = new Date().toISOString().split('T')[0];

    // 执行SQL插入操作，将新发票数据保存到数据库
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  } catch (error) {
    console.error('创建发票错误:', error);
    if (isServerBuild()) {
      // 在构建过程中，重定向到发票列表页面而不是抛出错误
      redirect('/dashboard/invoices');
    }
    throw error;
  }
}