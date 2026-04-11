import { useMemo } from 'react'

import dynamic from 'next/dynamic'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { ApexOptions } from 'apexcharts'

import type { OrderStatus } from '@/types/order.types'
import { ORDER_STATUSES } from '../types'
import { buildOrderStatusCategories, toSafeNumber } from '../utils'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

type OrderStatusChartCardProps = {
  statusCounts: Record<OrderStatus, number>
}

const OrderStatusChartCard = ({ statusCounts }: OrderStatusChartCardProps) => {
  const theme = useTheme()

  const categories = useMemo(() => buildOrderStatusCategories(), [])
  const statusSeries = useMemo(() => ORDER_STATUSES.map(status => toSafeNumber(statusCounts[status])), [statusCounts])

  const totalOrderCount = useMemo(
    () => statusSeries.reduce((sum, currentValue) => sum + toSafeNumber(currentValue), 0),
    [statusSeries]
  )

  const options = useMemo<ApexOptions>(() => {
    return {
      chart: {
        width: '100%',
        toolbar: { show: false },
        parentHeightOffset: 0
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          horizontal: true,
          barHeight: '55%'
        }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories,
        labels: {
          style: {
            colors: alpha(theme.palette.text.primary, 0.7)
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: alpha(theme.palette.text.primary, 0.75)
          }
        }
      },
      colors: [theme.palette.info.main],
      grid: {
        strokeDashArray: 6,
        borderColor: alpha(theme.palette.text.primary, 0.12)
      }
    }
  }, [categories, theme.palette.info.main, theme.palette.text.primary])

  return (
    <Grid item xs={12} lg={4}>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant='h6'>Tỷ trọng trạng thái đơn hàng</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Thống kê theo tổng dữ liệu đơn hàng hiện tại.
          </Typography>
          {totalOrderCount <= 0 ? (
            <Box
              sx={{
                minHeight: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant='body2' color='text.secondary' textAlign='center'>
                Chưa có đơn hàng để hiển thị tỷ trọng trạng thái.
              </Typography>
            </Box>
          ) : (
            <AppReactApexCharts
              type='bar'
              height={300}
              width='100%'
              options={options}
              series={[
                {
                  name: 'Số đơn',
                  data: statusSeries
                }
              ]}
            />
          )}
        </CardContent>
      </Card>
    </Grid>
  )
}

export default OrderStatusChartCard
