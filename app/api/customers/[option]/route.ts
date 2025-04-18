// 导入PostgreSQL数据库驱动
import postgres from 'postgres';
import { NextRequest, NextResponse } from 'next/server';

// 创建数据库连接实例，启用SSL安全连接
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// 查询客户列表
async function list() {
  const data = await sql`
    SELECT id, name, email, image_url
    FROM customers
    ORDER BY id
    LIMIT 20;
  `;
  return data || [];
}

// 查询单个客户信息
async function getCustomerInfo(id: string) {
  const data = await sql`
    SELECT id, name, email, image_url
    FROM customers
    WHERE id = ${id};
  `;
  return data[0];
}

// 添加客户信息
async function add(name: string, email: string, image_url: string) {
  await sql`
    INSERT INTO customers (name, email, image_url)
    VALUES (${name}, ${email}, ${image_url})
    RETURNING id, name, email, image_url;
  `;
  return { success: true, data: {} };
}

// 更新客户信息
async function edit(id: string, name: string, email: string, image_url: string) {
  await sql`
    UPDATE customers
    SET name = ${name}, email = ${email}, image_url = ${image_url}
    WHERE id = ${id}
    RETURNING id, name, email, image_url;
  `;
  return { success: true, data: {} };
}

// 删除客户
async function del(id: string) {
  await sql`
    DELETE FROM customers
    WHERE id = ${id};
  `;
  return { success: true, data: {} };
}

// 定义参数接口
interface OptionParams {
  option: string;
}

// GET 处理函数
export async function GET(
  request: NextRequest,
  context: { params: OptionParams }
) {
  try {
    const { searchParams } = new URL(request.url);
    const { option } = context.params;

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
  context: { params: OptionParams }
) {
  try {
    const { option } = context.params;
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