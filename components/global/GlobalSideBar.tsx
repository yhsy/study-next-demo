"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
  DashboardOutlined,
  TableOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  WarningOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileProtectOutlined,
  LoadingOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu, Layout, Button, Spin, Skeleton } from "antd";

const { Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

// 设置Spin的加载图标
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const GlobalSideBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['dashboard']);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // 处理初始渲染完成
  useEffect(() => {
    // 使用requestAnimationFrame确保在DOM渲染完成后
    requestAnimationFrame(() => {
      // 给一个短暂的延迟确保内容渲染完成
      setTimeout(() => {
        setInitialLoading(false);
      }, 500);
    });
  }, []);

  // 监听路由变化，控制加载状态
  useEffect(() => {
    const handleStart = () => {
      setLoading(true);
    };

    const handleComplete = () => {
      setLoading(false);
    };

    // 添加路由事件监听
    window.addEventListener('routeChangeStart', handleStart);
    window.addEventListener('routeChangeComplete', handleComplete);
    window.addEventListener('routeChangeError', handleComplete);

    return () => {
      // 组件卸载时移除监听
      window.removeEventListener('routeChangeStart', handleStart);
      window.removeEventListener('routeChangeComplete', handleComplete);
      window.removeEventListener('routeChangeError', handleComplete);
    };
  }, []);

  // 根据当前路径更新选中状态
  useEffect(() => {
    const path = pathname || '';
    if (path === '/home' || path === '/home/dashboard') {
      setSelectedKeys(['dashboard']);
    } else if (path.includes('/home/analysis')) {
      setSelectedKeys(['analysis']);
    } else if (path.includes('/home/invoices')) {
      setSelectedKeys(['invoices']);
    } else if (path.includes('/home/customers')) {
      setSelectedKeys(['customers']);
    } else {
      // 其他情况下，尝试从路径中提取关键部分作为key
      const pathSegments = path.split('/');
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (lastSegment && lastSegment !== 'home') {
        setSelectedKeys([lastSegment]);
      }
    }
  }, [pathname]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const onMenuClick: MenuProps["onClick"] = (e) => {
    setLoading(true); // 点击菜单项时设置加载状态
    switch (e.key) {
      case "dashboard":
        router.push("/home");
        break;
      case "analysis":
        router.push("/home/analysis");
        break;
      case "invoices":
        router.push("/home/invoices");
        break;
      case "customers":
        router.push("/home/customers");
        break;
      default:
        router.push("#");
    }
    // 延迟关闭loading状态，防止闪烁
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  const items: MenuItem[] = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <DashboardOutlined />,
    },
    {
      key: "invoices",
      label: "发票管理",
      icon: <FileProtectOutlined />,
    },
    {
      key: "customers",
      label: "商户",
      icon: <UserOutlined />,
    },
  ];

  // 显示骨架屏
  if (initialLoading) {
    return (
      <Sider 
        width={256}
        className="h-screen"
        theme="light"
      >
        <div className="px-4 pt-4">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </Sider>
    );
  }

  return (
    <div className="relative">
      <Sider 
        collapsible 
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={256}
        className="h-screen"
        theme="light"
        trigger={null}
      >
        <Menu
          style={{ border: "none", marginTop: "16px" }}
          selectedKeys={selectedKeys}
          mode="inline"
          items={items}
          inlineCollapsed={collapsed}
          onClick={onMenuClick}
        />
      </Sider>
      
      {/* 折叠触发器 */}
      <Button
        type="text"
        icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
        onClick={toggleCollapsed}
        className="absolute top-1/2 -translate-y-1/2 z-10 bg-white shadow-md"
        style={{ 
          right: collapsed ? "-15px" : "-15px",
          borderRadius: "50%",
          width: "30px",
          height: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0
        }}
      />
      
      {/* 路由变化时的加载效果 */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
          <Spin indicator={antIcon} tip="加载中..." />
        </div>
      )}
    </div>
  );
};

export default GlobalSideBar;
