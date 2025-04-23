import CardWrapper  from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';

// import { fetchRevenue,fetchLatestInvoices,fetchCardData } from '@/app/lib/data';

import { Suspense } from 'react';
import { RevenueChartSkeleton,LatestInvoicesSkeleton,CardsSkeleton, } from '@/app/ui/skeletons';

export default async function Page() {


  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Home
      </h1>
    </main>
  );
}