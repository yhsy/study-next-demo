'use server';

// 导入所需的依赖
import { z } from 'zod';
import postgres from 'postgres';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

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
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export type AuthState = {
  success: boolean;
  errorMsg?: string;
} | undefined;

export async function authenticate(
  prevState: AuthState, // 上一个状态，由 useActionState 提供
  formData: FormData,   // 表单数据
): Promise<AuthState> { // 返回包含成功状态或错误信息的状态
  try {
    // 从表单数据中提取邮箱和密码
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    // 从表单数据中提取回调 URL，如果不存在则默认为 '/dashboard'
    const callbackUrl = formData.get('redirectTo') as string | undefined; // 注意：前端传的是 redirectTo

    // 调用 next-auth 的 signIn 函数进行凭证验证
    // 传入 'credentials' 表示使用凭证提供者
    // 传入 email, password 和重定向目标 redirectTo
    // 这将触发 next-auth 的内部流程，进行凭证验证，如果严重通过那就会挑战到 /dashboard,验证失败就会去catch，跑出错误
    await signIn('credentials', { email, password, redirectTo: callbackUrl || '/dashboard' });

  } catch (error) {
    // 捕获认证过程中可能发生的错误
    // console.log('认证错误:', error); // 在服务器端记录错误信息，便于调试

    // 检查错误是否是 NextAuth 定义的 AuthError 类型
    if (error instanceof AuthError) {
      // 处理特定的认证错误类型
      switch (error.type) {
        case 'CredentialsSignin':
          // 如果是凭证登录失败（例如，邮箱或密码错误）
          return {
            success: false,
            errorMsg: '账号或密码错误' // 返回具体的错误信息给前端
          };
        default:
          // 处理其他类型的 AuthError
          return {
            success: false,
            errorMsg: '登录错误，请稍后再试' // 返回一个通用的错误信息
          };
      }
    }

    // 如果捕获到的错误不是 AuthError 类型，
    // 它可能是 Next.js 内部用于处理重定向的 NEXT_REDIRECT 错误，
    // 或者其他预料之外的错误。
    // 将这些错误重新抛出，让 Next.js 或上层调用栈来处理它们。
    // 这是正确处理 NEXT_REDIRECT 以完成页面跳转的关键。
    throw error;
  }
}

// 创建新发票时使用的Schema，省略id和date字段
const CreateInvoice = FormSchema.omit({ id: true, date: true });

// 创建新发票的服务端操作函数
export async function createInvoice(prevState: State, formData: FormData) {
  // // 解析并验证表单数据
  // const { customerId, amount, status } = CreateInvoice.parse({
  //   customerId: formData.get('customerId'),
  //   amount: formData.get('amount'),
  //   status: formData.get('status'),
  // });
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  // 将金额转换为分为单位
  const amountInCents = amount * 100;
  // 获取当前日期（YYYY-MM-DD格式）
  const date = new Date().toISOString().split('T')[0];

  try {
    // 执行SQL插入操作，将新发票数据保存到数据库
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    console.error('创建发票错误:', error);
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// 编辑发票
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// export async function updateInvoice(id: string, formData: FormData) {
export async function updateInvoice( 
  id: string,
  prevState: State,
  formData: FormData,
) {
  // const { customerId, amount, status } = UpdateInvoice.parse({
  //   customerId: formData.get('customerId'),
  //   amount: formData.get('amount'),
  //   status: formData.get('status'),
  // });
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('更新发票错误:', error);
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  // 删除-触发错误（演示用）
  // throw new Error('Failed to Delete Invoice');
  // 删除发票代码
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (error) {
    // console.error('删除发票错误:', error);
    throw new Error('Failed to Delete Invoice');
  }
  // 触发新的服务器请求
  revalidatePath('/dashboard/invoices');
}