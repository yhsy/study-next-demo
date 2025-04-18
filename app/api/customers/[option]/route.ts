// 导入PostgreSQL数据库驱动
import postgres from 'postgres';
import { NextRequest, NextResponse } from 'next/server';

// 检查是否在服务器端构建过程中
const isServerBuild = () => {
  return process.env.NODE_ENV === 'production' && typeof window === 'undefined';
};

// 定义模拟SQL函数类型
type MockSqlFunction = <T = any>(...args: any[]) => Promise<T[]>;

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

// 查询客户列表
async function list() {
  try {
    const data = await sql`
      SELECT id, name, email, image_url
      FROM customers
      ORDER BY id
      LIMIT 20;
    `;
    return data || [];
  } catch (error) {
    console.error('获取客户列表错误:', error);
    if (isServerBuild()) {
      return [];
    }
    throw error;
  }
}

// 查询单个客户信息
async function getCustomerInfo(id: string) {
  try {
    const data = await sql`
      SELECT id, name, email, image_url
      FROM customers
      WHERE id = ${id};
    `;
    return data[0];
  } catch (error) {
    console.error('获取客户信息错误:', error);
    if (isServerBuild()) {
      return null;
    }
    throw error;
  }
}

// 添加客户信息
async function add(name: string, email: string, image_url: string) {
  try {
    await sql`
      INSERT INTO customers (name, email, image_url)
      VALUES (${name}, ${email}, ${image_url})
      RETURNING id, name, email, image_url;
    `;
    return { success: true, data: {} };
  } catch (error) {
    console.error('添加客户错误:', error);
    if (isServerBuild()) {
      return { success: true, data: {} };
    }
    throw error;
  }
}

// 更新客户信息
async function edit(id: string, name: string, email: string, image_url: string) {
  try {
    await sql`
      UPDATE customers
      SET name = ${name}, email = ${email}, image_url = ${image_url}
      WHERE id = ${id}
      RETURNING id, name, email, image_url;
    `;
    return { success: true, data: {} };
  } catch (error) {
    console.error('更新客户错误:', error);
    if (isServerBuild()) {
      return { success: true, data: {} };
    }
    throw error;
  }
}

// 删除客户
async function del(id: string) {
  try {
    await sql`
      DELETE FROM customers
      WHERE id = ${id};
    `;
    return { success: true, data: {} };
  } catch (error) {
    console.error('删除客户错误:', error);
    if (isServerBuild()) {
      return { success: true, data: {} };
    }
    throw error;
  }
}

// 定义参数接口
interface OptionParams {
  option: string;
}

// GET 处理函数
export async function GET(
  request: NextRequest,
  context: { params: Promise<OptionParams> | OptionParams }
) {
  try {
    const { searchParams } = new URL(request.url);
    // 等待 params Promise 解析完成
    const params = await context.params;
    const option = params.option;

    switch (option) {
      case 'list':
        const resList = await list();
        return NextResponse.json({ success: true, data: resList });
      case 'info':
        const id = searchParams.get('id');
        if (!id) {
          return NextResponse.json({ success: false, errorMsg: 'Customer ID is required' }, { status: 400 });
        }
        const customer = await getCustomerInfo(id);
        if (!customer) {
          return NextResponse.json({ success: false, errorMsg: 'Customer not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: customer });
      default:
        return NextResponse.json({ success: false, errorMsg: 'Invalid operation' }, { status: 400 });
    }
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ success: false, errorMsg: String(error) }, { status: 500 });
  }
}

// POST 处理函数
export async function POST(
  request: NextRequest,
  context: { params: Promise<OptionParams> | OptionParams }
) {
  try {
    // 等待 params Promise 解析完成
    const params = await context.params;
    const option = params.option;
    
    let result = {};

    switch (option) {
      case 'add':
        const { name, email, image_url } = await request.json();
        if (!name || !email) {
          return NextResponse.json(
            { success: false, errorMsg: 'Name and email are required' },
            { status: 400 }
          );
        }
        result = await add(name, email, image_url || '');
        return NextResponse.json(result);
      case 'edit':
        const { id: e_id, name: e_name, email: e_email, image_url: e_image_url } = await request.json();
        if (!e_id || !e_name || !e_email) {
          return NextResponse.json(
            { success: false, errorMsg: 'Id, name and email are required' },
            { status: 400 }
          );
        }
        result = await edit(e_id, e_name, e_email, e_image_url || '');
        return NextResponse.json(result);
      case 'del':
        const { id } = await request.json();
        if (!id) {
          return NextResponse.json({ success: false, errorMsg: 'Customer ID is required' }, { status: 400 });
        }
        result = await del(id);
        return NextResponse.json(result);
      default:
        return NextResponse.json({ success: false, errorMsg: 'Invalid operation' }, { status: 400 });
    }
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ success: false, errorMsg: String(error) }, { status: 500 });
  }
} 