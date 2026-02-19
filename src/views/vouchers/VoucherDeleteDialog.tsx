import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import type { Voucher } from '@/types/voucher.types'

interface VoucherDeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  voucher: Voucher | null
  multiple?: boolean
  count?: number
}

const VoucherDeleteDialog = ({ open, onClose, onConfirm, voucher, multiple, count }: VoucherDeleteDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle>{multiple ? 'Xóa nhiều voucher' : 'Xóa voucher'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {multiple
            ? `Bạn có chắc chắn muốn xóa ${count} voucher đã chọn? Thao tác này không thể hoàn tác.`
            : `Bạn có chắc chắn muốn xóa voucher "${voucher?.code}"? Thao tác này không thể hoàn tác.`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary'>
          Hủy
        </Button>
        <Button onClick={onConfirm} color='error' variant='contained'>
          Xóa
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default VoucherDeleteDialog
