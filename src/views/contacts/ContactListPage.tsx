'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchContacts, replyContact } from '@/redux/slices/contactSlice'
import type { ContactItem } from '@/types/contact.types'
import RichTextEditor from '@/components/shared/RichTextEditor'

const formatDateTime = (value: string): string => {
  return new Date(value).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPlainTextFromHtml = (html: string): string => {
  if (!html) {
    return ''
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim()
}

const ContactListPage = () => {
  const dispatch = useAppDispatch()

  const { contacts, pagination, isLoading, replyingContactId } = useAppSelector(state => state.contacts)

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  const [statusFilter, setStatusFilter] = useState<'all' | 'replied' | 'pending'>('all')

  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [viewContact, setViewContact] = useState<ContactItem | null>(null)
  const [targetContact, setTargetContact] = useState<ContactItem | null>(null)
  const [replySubject, setReplySubject] = useState('')
  const [replyMessage, setReplyMessage] = useState('')

  const loadContacts = useCallback(() => {
    dispatch(
      fetchContacts({
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter
      })
    )
  }, [dispatch, page, rowsPerPage, statusFilter])

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleChangeStatusFilter = (value: 'all' | 'replied' | 'pending') => {
    setStatusFilter(value)
    setPage(0)
  }

  const handleOpenReply = (contact: ContactItem) => {
    setTargetContact(contact)
    setReplySubject('Phản hồi liên hệ từ Commerce')
    setReplyMessage('')
    setReplyDialogOpen(true)
  }

  const handleOpenMessage = (contact: ContactItem) => {
    setViewContact(contact)
    setMessageDialogOpen(true)
  }

  const handleCloseMessage = () => {
    setMessageDialogOpen(false)
    setViewContact(null)
  }

  const handleCloseReply = () => {
    setReplyDialogOpen(false)
    setTargetContact(null)
    setReplySubject('')
    setReplyMessage('')
  }

  const handleSubmitReply = async () => {
    if (!targetContact) return

    const plainReplyMessage = getPlainTextFromHtml(replyMessage)
    const trimmedSubject = replySubject.trim()
    const hasInvalidSubject = trimmedSubject.length > 0 && (trimmedSubject.length < 3 || trimmedSubject.length > 150)
    const isInvalidMessageHtmlLength = replyMessage.length > 20000

    if (
      plainReplyMessage.length < 10 ||
      plainReplyMessage.length > 2000 ||
      isInvalidMessageHtmlLength ||
      hasInvalidSubject
    ) {
      return
    }

    const resultAction = await dispatch(
      replyContact({
        id: targetContact.id,
        payload: {
          subject: trimmedSubject || undefined,
          message: replyMessage
        }
      })
    )

    if (replyContact.fulfilled.match(resultAction)) {
      handleCloseReply()
      loadContacts()
    }
  }

  const trimmedReplySubject = useMemo(() => replySubject.trim(), [replySubject])

  const hasInvalidSubject =
    trimmedReplySubject.length > 0 && (trimmedReplySubject.length < 3 || trimmedReplySubject.length > 150)

  const replyMessageStats = useMemo(() => {
    const plainTextLength = getPlainTextFromHtml(replyMessage).length

    return {
      plainTextLength,
      htmlLength: replyMessage.length
    }
  }, [replyMessage])

  return (
    <Card>
      <CardHeader
        title='Contact Management'
        subheader={`${pagination.totalItems} ${statusFilter === 'all' ? 'liên hệ từ khách hàng' : statusFilter === 'pending' ? 'liên hệ chưa phản hồi' : 'liên hệ đã phản hồi'}`}
        action={
          <Box className='flex items-center gap-2'>
            <FormControl size='small' sx={{ minWidth: 150 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label='Trạng thái'
                onChange={e => handleChangeStatusFilter(e.target.value as 'all' | 'replied' | 'pending')}
              >
                <MenuItem value='all'>Tất cả</MenuItem>
                <MenuItem value='pending'>Chưa phản hồi</MenuItem>
                <MenuItem value='replied'>Đã phản hồi</MenuItem>
              </Select>
            </FormControl>

            <Tooltip title='Làm mới dữ liệu'>
              <span>
                <Button
                  variant='outlined'
                  startIcon={<i className='ri-refresh-line' />}
                  onClick={loadContacts}
                  disabled={isLoading}
                >
                  Làm mới
                </Button>
              </span>
            </Tooltip>
          </Box>
        }
      />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={72}>ID</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell width={170}>Thời gian</TableCell>
              <TableCell width={130}>Trạng thái</TableCell>
              <TableCell width={220} align='center'>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align='center' sx={{ py: 8 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align='center' sx={{ py: 8 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Không có liên hệ nào
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              contacts.map(contact => (
                <TableRow key={contact.id} hover>
                  <TableCell>#{contact.id}</TableCell>
                  <TableCell>{contact.fullName}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phoneNumber}</TableCell>
                  <TableCell>{formatDateTime(contact.createdAt)}</TableCell>
                  <TableCell>
                    {contact.isReply ? (
                      <Chip label='Đã phản hồi' color='success' size='small' />
                    ) : (
                      <Chip label='Chưa phản hồi' color='warning' size='small' />
                    )}
                  </TableCell>
                  <TableCell align='center'>
                    <Box className='flex items-center justify-center gap-2'>
                      <Button size='small' variant='outlined' onClick={() => handleOpenMessage(contact)}>
                        Xem nội dung
                      </Button>

                      <Button
                        size='small'
                        variant={contact.isReply ? 'outlined' : 'contained'}
                        onClick={() => handleOpenReply(contact)}
                        disabled={
                          replyingContactId === contact.id || (contact.isReply && replyingContactId !== contact.id)
                        }
                      >
                        {replyingContactId === contact.id ? 'Đang gửi...' : contact.isReply ? 'Đã reply' : 'Reply'}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component='div'
        count={pagination.totalItems}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage='Số dòng:'
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
      />

      <Dialog open={messageDialogOpen} onClose={handleCloseMessage} fullWidth maxWidth='sm'>
        <DialogTitle>Nội dung liên hệ</DialogTitle>
        <DialogContent>
          <Box className='flex flex-col gap-4 mt-1'>
            <TextField
              label='Khách hàng'
              value={viewContact?.fullName || ''}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField label='Email' value={viewContact?.email || ''} InputProps={{ readOnly: true }} fullWidth />
            <TextField
              label='Nội dung'
              value={viewContact?.message || ''}
              InputProps={{ readOnly: true }}
              fullWidth
              multiline
              minRows={6}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessage}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={replyDialogOpen} onClose={handleCloseReply} fullWidth maxWidth='sm'>
        <DialogTitle>Phản hồi liên hệ khách hàng</DialogTitle>
        <DialogContent>
          <Box className='flex flex-col gap-4 mt-1'>
            <TextField
              label='Email người nhận'
              value={targetContact?.email || ''}
              InputProps={{ readOnly: true }}
              fullWidth
            />

            <TextField
              label='Tiêu đề email'
              value={replySubject}
              onChange={e => setReplySubject(e.target.value)}
              error={hasInvalidSubject}
              helperText={
                hasInvalidSubject
                  ? 'Nếu nhập tiêu đề thì cần từ 3 đến 150 ký tự.'
                  : 'Có thể để trống để dùng tiêu đề mặc định của hệ thống.'
              }
              fullWidth
            />

            <Box>
              <Typography variant='body2' sx={{ mb: 1 }}>
                Nội dung phản hồi
              </Typography>
              <RichTextEditor
                value={replyMessage}
                onChange={setReplyMessage}
                placeholder='Nhập nội dung phản hồi cho khách hàng...'
              />
              <Typography
                variant='caption'
                color={
                  replyMessageStats.plainTextLength < 10 ||
                  replyMessageStats.plainTextLength > 2000 ||
                  replyMessageStats.htmlLength > 20000
                    ? 'error'
                    : 'text.secondary'
                }
                sx={{ mt: 0.75, display: 'block' }}
              >
                Tối thiểu 10 ký tự, tối đa 2000 ký tự văn bản. Độ dài HTML tối đa 20000 ký tự. (
                {replyMessageStats.plainTextLength}/2000)
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReply}>Huỷ</Button>
          <Button
            variant='contained'
            onClick={handleSubmitReply}
            disabled={
              !targetContact ||
              hasInvalidSubject ||
              replyMessageStats.plainTextLength < 10 ||
              replyMessageStats.plainTextLength > 2000 ||
              replyMessageStats.htmlLength > 20000 ||
              replyingContactId === targetContact.id
            }
          >
            {targetContact && replyingContactId === targetContact.id ? 'Đang gửi...' : 'Gửi phản hồi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default ContactListPage
