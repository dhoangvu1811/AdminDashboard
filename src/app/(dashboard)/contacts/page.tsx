import type { Metadata } from 'next'

import ContactListPage from '@/views/contacts/ContactListPage'

export const metadata: Metadata = {
  title: 'Quản lý liên hệ khách hàng',
  description: 'Quản trị liên hệ và phản hồi khách hàng'
}

const ContactsPage = () => {
  return <ContactListPage />
}

export default ContactsPage
