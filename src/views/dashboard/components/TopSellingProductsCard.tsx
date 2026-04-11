import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { DashboardTopProduct } from '@/types/order.types'
import { formatCurrency, formatNumber } from '../utils'

type TopSellingProductsCardProps = {
  products: DashboardTopProduct[]
}

const TopSellingProductsCard = ({ products }: TopSellingProductsCardProps) => {
  return (
    <Grid item xs={12} lg={5}>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant='h6'>Top sản phẩm bán chạy</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Sắp xếp theo số lượng đã bán từ dữ liệu thật.
          </Typography>
          <Stack divider={<Divider flexItem />}>
            {products.length === 0 ? (
              <Box sx={{ py: 4 }}>
                <Typography color='text.secondary' textAlign='center'>
                  Chưa có dữ liệu sản phẩm.
                </Typography>
              </Box>
            ) : (
              products.map(product => (
                <Stack
                  key={product.id}
                  direction='row'
                  justifyContent='space-between'
                  alignItems='center'
                  sx={{ py: 1.5 }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={600} noWrap>
                      {product.name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Tồn kho: {formatNumber(product.stock)} • Giá: {formatCurrency(product.price)}
                    </Typography>
                  </Box>
                  <Chip label={`${formatNumber(product.selled)} đã bán`} color='success' variant='tonal' />
                </Stack>
              ))
            )}
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default TopSellingProductsCard
