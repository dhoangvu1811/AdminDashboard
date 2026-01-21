import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

import type { Product } from '@/types/product.types'

interface ProductDeleteDialogProps {
  open: boolean
  product: Product | null
  multiple?: boolean
  count?: number
  onClose: () => void
  onConfirm: () => void
}

const ProductDeleteDialog = ({
  open,
  product,
  multiple = false,
  count = 0,
  onClose,
  onConfirm
}: ProductDeleteDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle>Xác nhận xóa</DialogTitle>
      <DialogContent>
        <DialogContentText component='div'>
          {multiple ? (
            <Typography>
              Bạn có chắc chắn muốn xóa <strong>{count}</strong> sản phẩm đã chọn? Hành động này không thể hoàn tác.
            </Typography>
          ) : (
            <Typography>
              Bạn có chắc chắn muốn xóa sản phẩm <strong>{product?.name}</strong>? Hành động này không thể hoàn tác.
            </Typography>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='outlined' color='secondary'>
          Hủy bỏ
        </Button>
        <Button onClick={onConfirm} variant='contained' color='error' autoFocus>
          Xóa
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProductDeleteDialog
