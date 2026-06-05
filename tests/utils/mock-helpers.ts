import { type Page } from '@playwright/test'

export const json = (payload: unknown) => JSON.stringify(payload)

export const ok = (data: unknown, message = 'OK', code = 200) => ({
  code,
  message,
  data
})

export const adminUser = {
  id: 1,
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  status: 'active',
  createdAt: '2026-04-13T10:00:00.000Z'
}

export async function mockAdminBootstrap(page: Page) {
  // Me API
  await page.route(/\/users\/me(?:\?.*)?$/i, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: json(ok(adminUser, 'Lay thong tin nguoi dung hien tai thanh cong'))
    })
  })

  // Notifications API
  await page.route(/\/notifications(?:\?.*)?$/i, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: json(ok({
        notifications: [],
        pagination: { page: 1, itemsPerPage: 20, totalItems: 0 },
        unreadCount: 0
      }))
    })
  })

  // Dashboard KPI/Summary API
  await page.route(/\/orders\/dashboard-summary(?:\?.*)?$/i, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: json(ok({
        totalRevenue: 5000000,
        totalOrders: 120,
        totalUsers: 45,
        recentOrders: [],
        topSellingProducts: [],
        orderStatusCounts: { Pending: 10, Confirmed: 20, Shipped: 30, Delivered: 60 }
      }))
    })
  })

  // Users stats
  await page.route(/\/users\/stats(?:\?.*)?$/i, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: json(ok({
        totalUsers: 45,
        activeUsers: 40,
        pendingUsers: 5,
        revokedSessionsCount: 2
      }))
    })
  })

  // Products list API
  await page.route(/\/products\/getAll(?:\?.*)?$/i, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: json(ok({
        products: [
          {
            id: 99,
            name: 'Admin Test Product',
            price: 150000,
            discount: 10,
            stock: 20,
            slug: 'admin-test-product',
            status: 'active',
            category: { id: 1, name: 'Thời trang' }
          }
        ],
        pagination: { page: 1, itemsPerPage: 10, totalItems: 1, totalPages: 1 }
      }))
    })
  })

  // Categories list API
  await page.route(/\/categories(?:\?.*)?$/i, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: json(ok({
        categories: [
          { id: 1, name: 'Thời trang', slug: 'thoi-trang' }
        ],
        pagination: { page: 1, itemsPerPage: 20, totalItems: 1 }
      }))
    })
  })

  // Orders list API
  await page.route(/\/orders\/all(?:\?.*)?$/i, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: json(ok({
        orders: [
          {
            id: 1,
            orderCode: 'ORD-20260602-001',
            totals: { payable: 300000 },
            paymentStatus: 'unpaid',
            status: 'PENDING',
            createdAt: '2026-06-02T10:00:00.000Z',
            shippingAddress: { name: 'Customer Test', phone: '0987654321' }
          }
        ],
        pagination: { page: 1, itemsPerPage: 10, totalItems: 1, totalPages: 1 }
      }))
    })
  })
}
