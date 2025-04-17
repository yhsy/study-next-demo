// 导入PostgreSQL数据库驱动
import postgres from 'postgres';

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

// GET请求处理函数 - 获取客户列表或单个客户信息
export async function GET(request: Request, { params }: { params: { option: string } }) {
    try {
        const { searchParams } = new URL(request.url);

        switch (params.option) {
            case 'list':
                const resList = await list();
                return Response.json({ success: true, data: resList });
            case 'info':
                const id = searchParams.get('id');
                if (!id) {
                    return Response.json({ success: false, errorMsg: 'Customer ID is required' }, { status: 400 });
                }
                const customer = await getCustomerInfo(id);
                if (!customer) {
                    return Response.json({ success: false, errorMsg: 'Customer not found' }, { status: 404 });
                }
                return Response.json({ success: true, data: customer });
            default:
                return Response.json({ success: false, errorMsg: 'Invalid operation' }, { status: 400 });
        }
    } catch (error) {
        return Response.json({ success: false, errorMsg: error }, { status: 500 });
    }
}

// POST请求处理函数 - 添加/修改/删除 新客户
export async function POST(request: Request, { params }: { params: { option: string } }) {
    try {
        const option = params.option;
        let result = {};
        switch (option) {
            case 'add':
                const { name, email, image_url } = await request.json();
                if (!name || !email) {
                    return Response.json(
                        { success: false, errorMsg: 'Name and email are required' },
                        { status: 400 }
                    );
                }
                result = await add(name, email, image_url || '');
                return Response.json(result);
            case 'edit':
                const { id: e_id, name: e_name, email: e_email, image_url: e_image_url } = await request.json();
                if (!e_id || !e_name || !e_email) {
                    return Response.json(
                        { success: false, errorMsg: 'Id, name and email are required' },
                        { status: 400 }
                    );
                }
                result = await edit(e_id, e_name, e_email, e_image_url || '');
                return Response.json(result);
            case 'del':
                const { id } = await request.json();
                if (!id) {
                    return Response.json({ success: false, errorMsg: 'Customer ID is required' }, { status: 400 });
                }
                result = await del(id);
                return Response.json(result);
            default:
                return Response.json({ success: false, errorMsg: 'Invalid operation' }, { status: 400 });
        }

    } catch (error) {
        return Response.json({ success: false, errorMsg: error }, { status: 500 });
    }
}

// // PUT请求处理函数 - 更新客户信息
// export async function PUT(request: Request) {
//     try {
//         const { id, name, email, image_url } = await request.json();
//         if (!id || !name || !email) {
//             return Response.json(
//                 { error: 'Id, name and email are required' },
//                 { status: 400 }
//             );
//         }
//         const updatedCustomer = await edit(id, name, email, image_url || '');
//         if (!updatedCustomer) {
//             return Response.json({ error: 'Customer not found' }, { status: 404 });
//         }
//         return Response.json(updatedCustomer);
//     } catch (error) {
//         return Response.json({ error }, { status: 500 });
//     }
// }

// // DELETE请求处理函数 - 删除客户
// export async function DELETE(request: Request) {
//     try {
//         const { searchParams } = new URL(request.url);
//         const id = searchParams.get('id');
//         if (!id) {
//             return Response.json(
//                 { error: 'Customer ID is required' },
//                 { status: 400 }
//             );
//         }
//         await del(parseInt(id));
//         return Response.json({ success: true });
//     } catch (error) {
//         return Response.json({ error }, { status: 500 });
//     }
// }