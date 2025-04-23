'use client';
import { ProLayout } from '@ant-design/pro-components';

import GlobalHeader from '@/components/global/GlobalHeader';
import GlobalFooter from '@/components/global/GlobalFooter';

import '@ant-design/v5-patch-for-react-19';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProLayout
      layout="mix"

      headerRender={() => <GlobalHeader />}
      footerRender={() => (<GlobalFooter />)}
    >
      <div className='w-full' style={{ minHeight: "calc(100vh - 150px)" }}>
        {children}
      </div>
    </ProLayout>
  );
}