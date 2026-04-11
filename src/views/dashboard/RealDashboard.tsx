'use client'

import Grid from '@mui/material/Grid'

import DashboardErrorState from './components/DashboardErrorState'
import DashboardHeaderCard from './components/DashboardHeaderCard'
import DashboardLoadingState from './components/DashboardLoadingState'
import KpiCardsRow from './components/KpiCardsRow'
import OrderStatusChartCard from './components/OrderStatusChartCard'
import RecentOrdersCard from './components/RecentOrdersCard'
import RevenueChartCard from './components/RevenueChartCard'
import TopSellingProductsCard from './components/TopSellingProductsCard'
import useRealDashboardData from './hooks/useRealDashboardData'

const RealDashboard = () => {
  const { dashboardData, isLoading, isRefreshing, errorMessage, loadDashboardData } = useRealDashboardData()

  if (isLoading && !dashboardData) {
    return <DashboardLoadingState />
  }

  if (errorMessage && !dashboardData) {
    return <DashboardErrorState message={errorMessage} onRetry={() => void loadDashboardData(false)} />
  }

  if (!dashboardData) {
    return null
  }

  return (
    <Grid container spacing={4}>
      <DashboardHeaderCard
        lastUpdatedAt={dashboardData.lastUpdatedAt}
        isRefreshing={isRefreshing}
        errorMessage={errorMessage}
        onRefresh={() => void loadDashboardData(true)}
      />

      <KpiCardsRow dashboardData={dashboardData} />

      <RevenueChartCard todayRevenue={dashboardData.revenue.today} points={dashboardData.revenue.lastSevenDays} />

      <OrderStatusChartCard statusCounts={dashboardData.orders.statusCounts} />

      <RecentOrdersCard orders={dashboardData.orders.recent} />

      <TopSellingProductsCard products={dashboardData.products.topSelling} />
    </Grid>
  )
}

export default RealDashboard
