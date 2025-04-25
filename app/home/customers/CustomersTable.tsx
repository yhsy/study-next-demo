"use client";

import React, { useState, useEffect } from "react";
import { Table, Tag, Spin, Skeleton } from "antd";

import {formatCurrency, formatDateToLocal} from "../../lib/utils";


function CustomersTable(props: any) {
  const { query, currentPage, invoices } = props;
  const [loading, setLoading] = useState(true);
  
  // 使用useEffect确保组件挂载后再显示内容
  useEffect(() => {
    // 设置一个短暂的延迟，确保UI渲染完成
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [invoices]);

  const columns = [
    {
      title: "客户",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img
              src={record.image_url}
              alt={record.name}
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
          <span>{record.name}</span>
        </div>
      ),
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "金额",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: "日期",
      dataIndex: "date",
      key: "date",
      render: (date: string) => formatDateToLocal(date),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={status === "paid" ? "success" : "warning"}
          className="rounded-full px-3 py-1"
        >
          {status === "paid" ? "已支付" : "待处理"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "action",
      render: () => (
        <div className="flex gap-2">
          <button className="text-gray-500 hover:text-blue-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button className="text-gray-500 hover:text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      ),
    },
  ];

  // 显示加载中状态
  if (loading) {
    return (
      <div className="flex flex-col space-y-4">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={invoices}
      rowKey="id"
      pagination={{
        pageSize: 10,
        total: invoices.length,
        showSizeChanger: false,
      }}
      className="shadow-sm rounded-md"
    />
  );
}

export default CustomersTable;
