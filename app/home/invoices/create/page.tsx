// 创建发票页面组件
import Form from '@/app/ui/invoices/create-form'; // 导入发票创建表单组件
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs'; // 导入面包屑导航组件
import { fetchCustomers } from '@/app/lib/data'; // 导入获取客户数据的函数
 
export default async function Page() {
  // 获取所有客户数据，用于表单中的客户选择
  const customers = await fetchCustomers();
 
  return (
    <main>
      {/* 面包屑导航配置，显示当前页面在应用中的位置 */}
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/home/invoices' }, // 发票列表页链接
          {
            label: 'Create Invoice',
            href: '/home/invoices/create',
            active: true, // 标记当前页面为激活状态
          },
        ]}
      />
      {/* 渲染发票创建表单，传入客户数据作为选项 */}
      <Form customers={customers} />
    </main>
  );
}