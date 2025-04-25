// 'use client';
// import { ProLayout } from '@ant-design/pro-components';
import { Suspense } from 'react';

import GlobalHeader from '@/components/global/GlobalHeader';
import GlobalFooter from '@/components/global/GlobalFooter';
import GlobalSideBar from '@/components/global/GlobalSideBar';

import { Spin,Skeleton  } from 'antd';

import '@ant-design/v5-patch-for-react-19';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // Client方式
    // <ProLayout
    //   layout="mix"

    //   headerRender={() => <GlobalHeader />}
    //   footerRender={() => (<GlobalFooter />)}
    // >
    //   <div className='w-full' style={{ minHeight: "calc(100vh - 150px)" }}>
    //     {children}
    //   </div>
    // </ProLayout>

    // Service方式
    <div className='g-layout flex flex-col min-h-[100vh]'>
      <div className="g-hd h-[56px]" style={{borderBottom:'1px solid #f1f1f1'}}>
        <GlobalHeader />
      </div>
      <div className="flex justify-between g-bd" style={{flex:1}}>
        {/* <div className="w-[100px] sidebar"></div> */}
        <div className="g-sidebar">
          <Suspense fallback={<Spin />}>
            <GlobalSideBar />
          </Suspense>
        </div>
        <div className="main" style={{flex:1}}>
          <main className='w-full' style={{minHeight: 'calc(100vh - 100px)'}}>
            {children}
          </main>
          <GlobalFooter />
        </div>
      </div>
    </div>
  );
}