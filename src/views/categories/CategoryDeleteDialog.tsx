import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import type { Category } from '@/types/category.types'

interface CategoryDeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  category: Category | null
  multiple?: boolean
  count?: number
}

const CategoryDeleteDialog = ({ open, onClose, onConfirm, category, multiple, count }: CategoryDeleteDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{multiple ? 'Xóa nhiều danh mục' : 'Xóa danh mục'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {multiple
            ? `Bạn có chắc chắn muốn xóa ${count} danh mục đã chọn? Thao tác này không thể hoàn tác.`
            : `Bạn có chắc chắn muốn xóa danh mục "${category?.name}"? Thao tác này không thể hoàn tác.`}
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

export default CategoryDeleteDialog
