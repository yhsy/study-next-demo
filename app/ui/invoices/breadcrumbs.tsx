// 面包屑导航组件，用于显示当前页面在应用中的层级位置
import { clsx } from 'clsx'; // 用于条件性地组合CSS类名
import Link from 'next/link'; // Next.js的链接组件
import { lusitana } from '@/app/ui/fonts'; // 导入自定义字体

// 定义面包屑项的接口
interface Breadcrumb {
  label: string; // 显示的文本
  href: string; // 链接地址
  active?: boolean; // 是否为当前激活项
}

// 面包屑导航组件的主要实现
export default function Breadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: Breadcrumb[]; // 接收面包屑配置数组作为props
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 block">
      <ol className={clsx(lusitana.className, 'flex text-xl md:text-2xl')}>
        {breadcrumbs.map((breadcrumb, index) => (
          <li
            key={breadcrumb.href}
            aria-current={breadcrumb.active}
            className={clsx(
              breadcrumb.active ? 'text-gray-900' : 'text-gray-500', // 激活项显示深色，非激活项显示浅色
            )}
          >
            <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
            {/* 在非最后一项后添加分隔符 */}
            {index < breadcrumbs.length - 1 ? (
              <span className="mx-3 inline-block">/</span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
