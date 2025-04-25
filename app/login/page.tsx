'use client';

import { useActionState, Suspense, useState, useEffect, startTransition } from 'react'; // Import startTransition
import { useSearchParams } from 'next/navigation';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Spin, notification } from 'antd'; 
import { MailOutlined, LockOutlined } from '@ant-design/icons';

import { authenticate, AuthState } from '../../app/lib/actions'; 

// Antd React19兼容(Modal、Notification、Message等组件的静态方法)
import '@ant-design/v5-patch-for-react-19';

// 分离表单组件以使用 useSearchParams
function LoginFormContent() {
  const [isLoading, setIsLoading] = useState(true); // 添加加载状态(等客户端渲染完成,不然就显示Loading)

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/home';
  // 更新状态变量名称和类型注解(React 19新方法)
  // authState 是一个状态变量，用于存储服务器动作的响应。
  // formAction 是一个函数，用于触发服务器动作。
  // isPending 是一个布尔值，表示当前是否正在进行服务器动作。
  const [authState, formAction, isPending] = useActionState<AuthState, FormData>(
    authenticate,
    undefined,
  );

  useEffect(() => {
    // 组件挂载后将加载状态设置为 false
    setIsLoading(false);
  }, []);

  // 添加 useEffect 处理错误通知
  useEffect(() => {
    // 服务端返回的错误信息就弹出)
    if (authState && !authState.success && authState.errorMsg) {
      // console.log(`authState===>>${JSON.stringify(authState)}`);
      // 错误提示
      notification.error({
        message: '提示',
        description: authState.errorMsg,
        placement: 'topRight',
      });
    }
  }, [authState]);

  // 使用 ProForm 及其 onFinish 处理程序来手动触发服务器动作。
  const handleFinish = async (values: Record<string, any>) => {
    const formData = new FormData();
    formData.append('email', values.email);
    formData.append('password', values.password);
    formData.append('redirectTo', callbackUrl);
    // 手动调用由 useActionState 绑定的动作函数，并用 startTransition 包裹
    // startTransiton 是一个接受回调的函数，用于告知React需要延迟更新的state。
    // 如果某个state的更新会导致组件挂起，则应该包裹在startTransition中
    startTransition(() => {
      formAction(formData);
    });
  };

  // 加载时渲染加载指示器或 null
  if (isLoading) {
    // 选项 1：返回 null（加载完成前显示空白屏幕）
    // return null;

    // 选项 2：返回一个简单的加载指示器（使用 Ant Design Spin）
    return (
      // 使用 Tailwind CSS 替换 style
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pt-24">
      <ProForm
        onFinish={handleFinish}
        submitter={{
          searchConfig: {
            submitText: '登 录',
          },
          render: (_, dom) => dom.pop(), // Use default submit button rendering
          submitButtonProps: {
            loading: isPending,
            size: 'large',
            className: "w-full mt-6",
          },
        }}
      >
        <h1 className="text-center mb-6 text-2xl">
          SkinsOut 后台管理系统
        </h1>
        <ProFormText
          name="email"
          fieldProps={{
            size: 'large',
            prefix: <MailOutlined className={'prefixIcon'} />,
          }}
          placeholder={'请输入邮箱地址'}
          rules={[
            {
              required: true,
              message: '请输入邮箱地址!',
            },
            {
              type: 'email',
              message: '请输入有效的邮箱地址!',
            },
          ]}
          // 表单验证触发时机
          validateTrigger={['onSubmit', 'onBlur']}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined className={'prefixIcon'} />,
          }}
          placeholder={'请输入密码'}
          rules={[
            {
              required: true,
              message: '请输入密码!',
            },
            {
              min: 6,
              message: '密码长度至少为6位!',
            },
          ]}
          validateTrigger={['onSubmit', 'onBlur']}
        />
        {/* Hidden input for redirectTo is handled in handleFinish */}
      </ProForm>
    </div>
  );
}

// 在外层组件中使用 Suspense 包裹
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
         <Spin size="large" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}