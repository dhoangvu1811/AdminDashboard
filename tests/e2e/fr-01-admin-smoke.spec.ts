import { expect, test } from '@playwright/test'
import { mockAdminBootstrap, json, ok, adminUser } from '../utils/mock-helpers'

test.describe('Admin Dashboard Smoke Tests (P0/Critical)', () => {
  test('AC-01 - Admin login va navigate den Dashboard, Product List, Order List', async ({ page }) => {
    let loginCalls = 0

    // Setup mocks
    await mockAdminBootstrap(page)

    // Mock login API
    await page.route(/\/users\/login(?:\?.*)?$/i, async route => {
      loginCalls += 1
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: json(ok({ user: adminUser, sessionId: 'admin-sess-01' }, 'Dang nhap thanh cong'))
      })
    })

    // 1. Navigate to login
    await page.goto('/login')

    // 2. Fill login form
    await page.locator('input[name="email"]').fill(adminUser.email)
    await page.locator('input[name="password"]').fill('AdminPass123')
    await page.getByRole('button', { name: /Login|Đăng nhập/i }).click()

    // Verify login was called
    await expect.poll(() => loginCalls, { timeout: 10000 }).toBeGreaterThan(0)

    // 3. Verify redirect to Dashboard (/)
    await expect(page).toHaveURL(/\/?$/, { timeout: 15000 })
    
    // Verify Dashboard data renders
    await expect(page.locator('body')).toContainText(/5,000,000|120|45|Doanh thu/) // Mux of revenue/orders/users

    // 4. Navigate to Product List
    await page.goto('/products')
    await expect(page).toHaveURL(/\/products/, { timeout: 10000 })
    
    // Verify Product List renders
    await expect(page.getByText('Admin Test Product')).toBeVisible({ timeout: 10000 })

    // 5. Navigate to Order List
    await page.goto('/orders')
    await expect(page).toHaveURL(/\/orders/, { timeout: 10000 })

    // Verify Order List renders
    await expect(page.getByText('ORD-20260602-001')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Chờ xử lý').first()).toBeVisible()
  })
})
