import { fetchFilteredInvoices } from "@/app/lib/data";

import { Suspense } from "react";
import { Spin } from "antd";
import CustomersTable from "./CustomersTable";

async function CustomersPage(props:{
  searchParams: {
    query?: string;
    page?: number;
  };
}) {
  const searchParams = await props.searchParams;
  
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const invoices = await fetchFilteredInvoices(query, currentPage);


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">商户管理</h1>
      <Suspense key={query + currentPage} fallback={<Spin />}>
      <CustomersTable invoices={invoices} query={query} currentPage={currentPage} />
      </Suspense>
    </div>
  );
}

export default CustomersPage;
