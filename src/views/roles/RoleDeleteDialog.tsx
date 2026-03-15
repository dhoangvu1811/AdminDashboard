import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import type { Role } from '@/types/role.types'

interface RoleDeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  role: Role | null
}

const RoleDeleteDialog = ({ open, onClose, onConfirm, role }: RoleDeleteDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Xóa vai trò</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Bạn có chắc chắn muốn xóa vai trò &quot;{role?.name}&quot;? Thao tác này không thể hoàn tác.
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

export default RoleDeleteDialog
