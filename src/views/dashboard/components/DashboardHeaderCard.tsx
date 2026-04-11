import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { formatDateTime } from '../utils'

type DashboardHeaderCardProps = {
  lastUpdatedAt: string
  isRefreshing: boolean
  errorMessage: string | null
  onRefresh: () => void
}

const DashboardHeaderCard = ({ lastUpdatedAt, isRefreshing, errorMessage, onRefresh }: DashboardHeaderCardProps) => {
  const theme = useTheme()

  return (
    <>
      <Grid item xs={12}>
        <Card
          sx={{
            border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
            background: `linear-gradient(120deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.success.main, 0.08)} 100%)`
          }}
        >
          <CardContent>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              justifyContent='space-between'
              alignItems='center'
            >
              <Box>
                <Typography variant='h4' sx={{ mb: 0.5 }}>
                  Dashboard
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Cập nhật lúc: {formatDateTime(lastUpdatedAt)}
                </Typography>
              </Box>
              <Button
                variant='contained'
                startIcon={
                  isRefreshing ? <CircularProgress size={14} color='inherit' /> : <i className='ri-refresh-line' />
                }
                disabled={isRefreshing}
                onClick={onRefresh}
              >
                Làm mới số liệu
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {errorMessage && (
        <Grid item xs={12}>
          <Alert severity='warning'>{errorMessage}</Alert>
        </Grid>
      )}
    </>
  )
}

export default DashboardHeaderCard
