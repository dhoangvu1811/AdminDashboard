import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

type DashboardErrorStateProps = {
  message: string
  onRetry: () => void
}

const DashboardErrorState = ({ message, onRetry }: DashboardErrorStateProps) => {
  return (
    <Card>
      <CardContent>
        <Alert
          severity='error'
          action={
            <Button color='inherit' size='small' onClick={onRetry}>
              Tải lại
            </Button>
          }
        >
          {message}
        </Alert>
      </CardContent>
    </Card>
  )
}

export default DashboardErrorState
