import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { DashboardData } from '../types'
import { formatCurrency, formatNumber } from '../utils'

type KpiCardsRowProps = {
  dashboardData: DashboardData
}

const KpiCardsRow = ({ dashboardData }: KpiCardsRowProps) => {
  const theme = useTheme()

  const kpiCards = [
    {
      title: 'Người dùng',
      value: formatNumber(dashboardData.users.total),
      subtitle: `+${dashboardData.users.newMonth} người dùng tháng này`,
      icon: 'ri-group-line',
      color: theme.palette.primary.main
    },
    {
      title: 'Sản phẩm',
      value: formatNumber(dashboardData.products.total),
      subtitle: `${dashboardData.products.topSelling.length} sản phẩm bán tốt`,
      icon: 'ri-shopping-bag-3-line',
      color: theme.palette.warning.main
    },
    {
      title: 'Đơn hàng',
      value: formatNumber(dashboardData.orders.total),
      subtitle: `${formatNumber(dashboardData.orders.statusCounts.DELIVERED)} đơn đã giao`,
      icon: 'ri-file-list-3-line',
      color: theme.palette.info.main
    },
    {
      title: 'Doanh thu tháng',
      value: formatCurrency(dashboardData.revenue.month),
      subtitle: `Hôm nay: ${formatCurrency(dashboardData.revenue.today)}`,
      icon: 'ri-line-chart-line',
      color: theme.palette.success.main
    }
  ]

  return (
    <>
      {kpiCards.map(item => (
        <Grid item xs={12} sm={6} lg={3} key={item.title}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography color='text.secondary' variant='body2'>
                    {item.title}
                  </Typography>
                  <Typography variant='h4' sx={{ mt: 1, mb: 0.75 }}>
                    {item.value}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {item.subtitle}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color,
                    bgcolor: alpha(item.color, 0.15)
                  }}
                >
                  <i className={`${item.icon} text-[22px]`} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </>
  )
}

export default KpiCardsRow
