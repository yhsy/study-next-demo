"use client";

import Image from 'next/image';

import { Avatar, Dropdown } from 'antd';
import { LogoutOutlined } from '@ant-design/icons'; // 添加登出图标

const GlobalHeader = () => {
    return (
        <div className='flex justify-between items-center px-6 h-full'>
        <div className='flex items-center gap-2'>
          <Image src="/logo.png" width={30} height={30} alt="logo" />
          <div className='text-lg font-semibold'>Skinsout</div>
        </div>
        <div className='flex items-center'>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  label: (
                    <div className="flex items-center">
                      <LogoutOutlined className="mr-2" />
                      退出登录
                    </div>
                  ),
                  onClick: async () => {
                    try {
                      const response = await fetch('/api/auth/signout', {
                        method: 'POST',
                      });
                      if (response.ok) {
                        window.location.href = '/login';
                      } else {
                        console.error('登出失败');
                      }
                    } catch (error) {
                      console.error('登出请求失败:', error);
                    }
                  },
                },
              ],
            }}
            trigger={['hover']}
          >
            <div className="flex items-center gap-2 cursor-pointer h-[44px] p-2 rounded-[4px]  hover:bg-gray-100">
              <Avatar
                size="large"
                src="/customers/avatar-1.jpg"
                className="mr-2 cursor-pointer"
              />
              <span>admin</span>
            </div>

          </Dropdown>
        </div>
      </div>
    );
};

export default GlobalHeader;
