import { useMemo } from 'react'

import dynamic from 'next/dynamic'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { ApexOptions } from 'apexcharts'

import type { RevenuePoint } from '../types'
import { buildRevenueChartCategories, buildRevenueChartData, formatCurrency, formatNumber } from '../utils'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

type RevenueChartCardProps = {
  todayRevenue: number
  points: RevenuePoint[]
}

const RevenueChartCard = ({ todayRevenue, points }: RevenueChartCardProps) => {
  const theme = useTheme()

  const categories = useMemo(() => buildRevenueChartCategories(points), [points])
  const data = useMemo(() => buildRevenueChartData(points), [points])
  const isEmptyRevenueData = useMemo(() => data.every(value => value <= 0), [data])

  const options = useMemo<ApexOptions>(() => {
    return {
      chart: {
        width: '100%',
        toolbar: { show: false },
        parentHeightOffset: 0
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      grid: {
        strokeDashArray: 6,
        borderColor: alpha(theme.palette.text.primary, 0.12)
      },
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
          formatter: value => formatNumber(value),
          style: {
            colors: alpha(theme.palette.text.primary, 0.7)
          }
        }
      },
      dataLabels: { enabled: false },
      tooltip: {
        y: {
          formatter: value => formatCurrency(value)
        }
      },
      colors: [theme.palette.primary.main]
    }
  }, [categories, theme.palette.primary.main, theme.palette.text.primary])

  return (
    <Grid item xs={12} lg={8}>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 3 }}>
            <Box>
              <Typography variant='h6'>Doanh thu 7 ngày gần nhất</Typography>
              <Typography variant='body2' color='text.secondary'>
                Chỉ tính đơn hàng ở trạng thái Đã giao.
              </Typography>
            </Box>
            <Chip label={`Hôm nay: ${formatCurrency(todayRevenue)}`} color='success' variant='tonal' />
          </Stack>
          {isEmptyRevenueData ? (
            <Stack spacing={1} alignItems='center' justifyContent='center' sx={{ minHeight: 300 }}>
              <Typography variant='body2' color='text.secondary' textAlign='center'>
                Chưa có doanh thu đã giao trong 7 ngày gần nhất.
              </Typography>
              <Typography variant='caption' color='text.disabled' textAlign='center'>
                Dữ liệu sẽ tự cập nhật khi có đơn hàng giao thành công.
              </Typography>
            </Stack>
          ) : (
            <AppReactApexCharts
              type='line'
              height={300}
              width='100%'
              options={options}
              series={[
                {
                  name: 'Doanh thu',
                  data
                }
              ]}
            />
          )}
        </CardContent>
      </Card>
    </Grid>
  )
}

export default RevenueChartCard
