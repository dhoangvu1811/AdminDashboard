import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const DashboardLoadingState = () => {
  return (
    <Card>
      <CardContent sx={{ py: 12 }}>
        <Stack spacing={2} alignItems='center' justifyContent='center'>
          <CircularProgress size={30} />
          <Typography color='text.secondary'>Đang tải dữ liệu dashboard...</Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default DashboardLoadingState
