# 🛠️ Admin Dashboard

> Bảng điều khiển quản trị cho nền tảng thương mại điện tử — xây dựng với Next.js 14, MUI v5, Redux Toolkit và Socket.IO.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)
![MUI](https://img.shields.io/badge/MUI-5.15-blue?logo=mui)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.11-purple?logo=redux)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-black?logo=socket.io)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)
![License](https://img.shields.io/badge/License-Commercial-red)

---

## 📑 Mục lục

- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc dự án](#-kiến-trúc-dự-án)
- [Cài đặt & Chạy](#-cài-đặt--chạy)
- [Biến môi trường](#-biến-môi-trường)
- [Trang & Routes](#-trang--routes)
- [Quản lý Module](#-quản-lý-module-chi-tiết)
- [Xác thực & Phân quyền](#-xác-thực--phân-quyền)
- [Realtime Socket.IO](#-realtime-socketio)
- [State Management](#-state-management)
- [API Integration](#-api-integration)
- [Tài liệu bổ sung](#-tài-liệu-bổ-sung)

---

## ✨ Tính năng chính

### 📊 Dashboard tổng quan

- Biểu đồ thống kê: doanh thu, đơn hàng, sản phẩm, người dùng
- Tổng quan doanh số theo quốc gia, giao dịch gần đây
- Widgets: ApexCharts (Bar, Line, Column), stat cards

### 📦 Quản lý sản phẩm

- CRUD sản phẩm đầy đủ + xóa hàng loạt
- Upload đa ảnh (drag & drop, preview, tối đa 5 ảnh)
- Rich Text Editor (TipTap) cho mô tả sản phẩm
- Lọc theo danh mục, sắp xếp, tìm kiếm debounce
- Định dạng giá VNĐ

### 📂 Quản lý danh mục

- CRUD danh mục với ảnh đại diện
- Xóa đơn lẻ + hàng loạt
- Rich Text Editor cho mô tả

### 🧾 Quản lý đơn hàng

- Danh sách đơn hàng với lọc trạng thái + thanh toán
- Chi tiết đơn: sản phẩm, giá, voucher, địa chỉ giao hàng
- Cập nhật trạng thái đơn (workflow PENDING → DELIVERED)
- Xác nhận thanh toán, hủy đơn
- Timeline audit log (MUI Timeline)
- Thông báo realtime khi có đơn mới

### 👤 Quản lý người dùng

- CRUD users + xóa hàng loạt
- Kích hoạt / Vô hiệu hóa tài khoản
- Đổi role cho user
- Quản lý sessions: xem thiết bị, IP, thu hồi session đơn lẻ hoặc toàn bộ
- Lọc theo role, status, tìm kiếm

### 🎟️ Quản lý voucher

- CRUD voucher (cố định / phần trăm) + xóa hàng loạt
- Progress bar sử dụng (`usedCount / usageLimit`)
- Tính toán trạng thái thông minh: active, expired, not_started, full
- Datetime picker cho thời gian hiệu lực

### 🔑 Quản lý Roles & Permissions

- CRUD roles với gán quyền (permission matrix)
- CRUD permissions (system key immutable)
- Bulk assign / remove permissions cho role
- Admin role được bảo vệ (không thể sửa/xóa)

### 🔔 Thông báo Realtime

- Nhận thông báo tức thì qua Socket.IO
- Bell icon với badge số chưa đọc trên navbar
- Dropdown xem nhanh + trang danh sách đầy đủ
- Đánh dấu đọc (đơn lẻ + tất cả), xóa đã đọc

### ⚙️ Cài đặt tài khoản

- Cập nhật profile: tên, SĐT, địa chỉ, ngày sinh, giới tính
- Upload avatar
- Hiển thị role & danh sách permissions
- Cài đặt thông báo (demo)
- Liên kết tài khoản mạng xã hội (demo)

### 🔐 Xác thực nâng cao

- Đăng nhập / Đăng ký / Quên mật khẩu
- HttpOnly cookie JWT (Access + Refresh token)
- Auto refresh token khi expired (interceptor)
- Bảo vệ route: redirect `/login` nếu chưa xác thực
- Chống race condition refresh token

### 🌓 Giao diện

- Light / Dark mode toggle
- Responsive sidebar layout
- Menu sidebar ẩn/hiện theo permission
- Toàn bộ UI bằng tiếng Việt

---

## 🧪 Công nghệ sử dụng

| Thành phần      | Công nghệ                                       | Phiên bản  |
| :-------------- | :---------------------------------------------- | :--------- |
| Framework       | Next.js (App Router)                            | 14.2       |
| Language        | TypeScript (strict)                             | 5.4        |
| UI Library      | MUI (Material UI) + MUI Lab                     | 5.15       |
| Styling         | Tailwind CSS + Emotion                          | 3.4        |
| State           | Redux Toolkit                                   | 2.11       |
| Forms           | React Hook Form + Zod                           | 7.71 / 4.3 |
| Charts          | ApexCharts (react-apexcharts)                   | 3.49       |
| Rich Text       | TipTap (StarterKit, Link, Underline, TextAlign) | 3.16       |
| Realtime        | Socket.IO Client                                | 4.8        |
| HTTP            | Axios (withCredentials)                         | 1.13       |
| Toast           | react-hot-toast                                 | 2.6        |
| Icons           | Iconify (auto-generated CSS bundle)             | —          |
| Scrollbar       | react-perfect-scrollbar                         | —          |
| Package Manager | pnpm                                            | —          |

---

## 📁 Kiến trúc dự án

```
AdminDashboard/
├── public/images/              # Ảnh tĩnh (avatars, cards, logos...)
├── docs/                       # Tài liệu chi tiết
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Layout có sidebar + navbar (authenticated)
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── categories/     # /categories, /create, /update/[id]
│   │   │   ├── products/       # /products, /create, /update/[id]
│   │   │   ├── orders/         # /orders, /[id]
│   │   │   ├── users/          # /users, /create
│   │   │   ├── vouchers/       # /vouchers, /create, /update/[id]
│   │   │   ├── roles/          # /roles, /create, /update/[id]
│   │   │   ├── permissions/    # /permissions, /create, /update/[id]
│   │   │   ├── notifications/  # /notifications
│   │   │   └── account-settings/
│   │   ├── (blank-layout-pages)/ # Layout trống (không sidebar)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── error/
│   │   └── layout.tsx          # Root layout (Redux + Socket + Auth providers)
│   ├── views/                  # View components cho mỗi trang
│   │   ├── dashboard/          # Widgets: Award, Chart, Table...
│   │   ├── categories/         # List, Form, DeleteDialog
│   │   ├── products/           # List, Form, DeleteDialog
│   │   ├── orders/             # ListTable, OrderDetail
│   │   ├── users/              # List, Create, EditDialog, RoleDialog, SessionsDialog
│   │   ├── vouchers/           # List, Form, DeleteDialog
│   │   ├── roles/              # List, Form (+ permission matrix), DeleteDialog
│   │   ├── permissions/        # List, Form, DeleteDialog
│   │   ├── notifications/      # NotificationListPage
│   │   └── account-settings/   # Tabs: Account, Notifications, Connections
│   ├── components/
│   │   ├── providers/          # AuthProvider, SocketProvider, ToastProvider
│   │   ├── layout/
│   │   │   ├── vertical/       # Sidebar, Navbar, Menu, Footer
│   │   │   └── shared/         # UserDropdown, NotificationDropdown, ModeDropdown
│   │   ├── shared/             # ImageUploader, RichTextEditor
│   │   └── theme/              # MUI theme customization
│   ├── redux/
│   │   ├── store.ts            # Redux store (9 slices)
│   │   ├── slices/             # auth, users, products, categories, orders,
│   │   │                       # vouchers, roles, permissions, notifications
│   │   ├── hooks/              # useAppDispatch, useAppSelector (typed)
│   │   └── provider.tsx        # ReduxProvider + injectStore
│   ├── services/               # 10 API service files
│   ├── libs/api/
│   │   ├── axiosInstance.ts    # Axios config + interceptors + token refresh
│   │   └── endpoints.ts        # Tất cả API endpoint paths
│   ├── types/                  # 11 TypeScript type files
│   ├── hooks/                  # useAuth, useDebounce
│   ├── utils/                  # checkPermission, rules (Zod schemas), formatters
│   ├── constants/              # permissions, order statuses
│   ├── configs/                # Theme config, primary colors
│   └── @core/ @layouts/ @menu/ # Core layout engine (MUI-based)
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Mô hình kiến trúc:**

```
┌─────────────────────────────────────────────────────────┐
│              Next.js App (Client Components)            │
│                                                         │
│  ┌────────────┐ ┌──────────────┐ ┌───────────────────┐  │
│  │AuthProvider│ │SocketProvider│ │  ReduxProvider     │  │
│  │(check auth │ │(Socket.IO    │ │  (injectStore +   │  │
│  │+ load perm)│ │ + events)    │ │   logoutCallback) │  │
│  └─────┬──────┘ └──────┬───────┘ └────────┬──────────┘  │
│        └───────────────┼──────────────────┘              │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────────┐ │
│  │        Redux Store (9 slices + AsyncThunks)         │ │
│  │  auth │ users │ products │ categories │ orders      │ │
│  │  vouchers │ roles │ permissions │ notifications     │ │
│  └──────────────────────┬──────────────────────────────┘ │
│                         ▼                                │
│  ┌─────────────────────────────────────────────────────┐ │
│  │            Services Layer (10 services)             │ │
│  └──────────────────────┬──────────────────────────────┘ │
│                         ▼                                │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Axios Instance (withCredentials + interceptors)    │ │
│  │  • 401 → auto logout                               │ │
│  │  • 410 → refresh token + retry (race-condition safe)│ │
│  └──────────────────────┬──────────────────────────────┘ │
│                         ▼                                │
│                Backend API (:8017/V1)                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Cài đặt & Chạy

### Yêu cầu

- **Node.js** >= 18.x
- **pnpm** (khuyến nghị) hoặc npm/yarn
- **Backend API** đang chạy (Commerce-Api project)

### Cài đặt

```bash
# Clone repository
git clone https://github.com/your-username/AdminDashboard.git
cd AdminDashboard

# Cài đặt dependencies
pnpm install

# Tạo file cấu hình
cp .env.example .env.local
# → Chỉnh sửa NEXT_PUBLIC_API_URL trỏ đến backend
```

### Chạy ứng dụng

```bash
# Development (hot reload)
pnpm dev

# Build production
pnpm build

# Chạy production
pnpm start
```

### Scripts khác

```bash
pnpm lint          # Kiểm tra linting
pnpm lint:fix      # Tự động sửa lint errors
pnpm format        # Format code với Prettier
pnpm build:icons   # Tạo lại CSS icon bundle (Iconify)
```

---

## ⚙️ Biến môi trường

| Biến                    | Mô tả                                | Mặc định                   |
| :---------------------- | :----------------------------------- | :------------------------- |
| `NEXT_PUBLIC_API_URL`   | Backend API base URL (bao gồm `/V1`) | `http://localhost:8017/V1` |
| `NEXT_PUBLIC_SITE_URL`  | URL admin dashboard                  | —                          |
| `NEXT_PUBLIC_DEV_TOOLS` | Bật/tắt dev tools                    | —                          |
| `BASEPATH`              | Next.js base path                    | —                          |

> Tất cả biến `NEXT_PUBLIC_*` đều exposed ra browser. Không đặt thông tin nhạy cảm ở đây.
> Xác thực được xử lý hoàn toàn bởi backend qua HttpOnly cookies.

---

## 🗺️ Trang & Routes

### Dashboard (Authenticated — Sidebar Layout)

| Route                      | Trang                 | Mô tả                                     |
| :------------------------- | :-------------------- | :---------------------------------------- |
| `/`                        | Dashboard             | Tổng quan thống kê, biểu đồ               |
| `/categories`              | Danh sách danh mục    | Bảng + tìm kiếm + xóa hàng loạt           |
| `/categories/create`       | Tạo danh mục          | Form + image upload + rich text           |
| `/categories/update/[id]`  | Sửa danh mục          | Form auto-populate                        |
| `/products`                | Danh sách sản phẩm    | Bảng + lọc danh mục + sắp xếp             |
| `/products/create`         | Tạo sản phẩm          | Form + multi-image + rich text            |
| `/products/update/[id]`    | Sửa sản phẩm          | Form auto-populate                        |
| `/orders`                  | Danh sách đơn hàng    | Bảng + lọc trạng thái đơn & thanh toán    |
| `/orders/[id]`             | Chi tiết đơn hàng     | Sản phẩm, thanh toán, timeline logs       |
| `/users`                   | Danh sách users       | Bảng + lọc role & status                  |
| `/users/create`            | Tạo user              | Form đầy đủ + chọn role                   |
| `/vouchers`                | Danh sách voucher     | Bảng + progress bar + smart status        |
| `/vouchers/create`         | Tạo voucher           | Form dynamic (ẩn/hiện theo loại)          |
| `/vouchers/update/[id]`    | Sửa voucher           | Form auto-populate                        |
| `/roles`                   | Danh sách roles       | Bảng + admin protection                   |
| `/roles/create`            | Tạo role              | Form tên + slug                           |
| `/roles/update/[id]`       | Sửa role              | Form + **permission matrix**              |
| `/permissions`             | Danh sách permissions | Bảng CRUD                                 |
| `/permissions/create`      | Tạo permission        | Form (system key + display name)          |
| `/permissions/update/[id]` | Sửa permission        | Display name only (key immutable)         |
| `/notifications`           | Lịch sử thông báo     | Bảng + lọc đọc/chưa đọc + xóa             |
| `/account-settings`        | Cài đặt tài khoản     | Tabs: Profile, Notifications, Connections |

### Blank Layout (Unauthenticated)

| Route                | Trang         | Mô tả                            |
| :------------------- | :------------ | :------------------------------- |
| `/login`             | Đăng nhập     | Email + password, Zod validation |
| `/register`          | Đăng ký       | Username, email, password, terms |
| `/forgot-password`   | Quên mật khẩu | Email form                       |
| `/error`             | 404           | Trang không tìm thấy             |
| `/under-maintenance` | Bảo trì       | Placeholder                      |

---

## 📋 Quản lý Module chi tiết

### CRUD Matrix

| Module      | Tạo | Danh sách | Chi tiết |     Sửa     | Xóa | Xóa hàng loạt |
| :---------- | :-: | :-------: | :------: | :---------: | :-: | :-----------: |
| Danh mục    | ✅  |    ✅     |    —     |     ✅      | ✅  |      ✅       |
| Sản phẩm    | ✅  |    ✅     |    —     |     ✅      | ✅  |      ✅       |
| Đơn hàng    |  —  |    ✅     |    ✅    | ✅ (status) |  —  |       —       |
| Người dùng  | ✅  |    ✅     |    —     |     ✅      | ✅  |      ✅       |
| Voucher     | ✅  |    ✅     |    —     |     ✅      | ✅  |      ✅       |
| Roles       | ✅  |    ✅     |    —     | ✅ (+perms) | ✅  |       —       |
| Permissions | ✅  |    ✅     |    —     |     ✅      | ✅  |       —       |
| Thông báo   |  —  |    ✅     |    —     |  ✅ (read)  | ✅  |  ✅ (đã đọc)  |
| Tài khoản   |  —  |    ✅     |    —     |     ✅      |  —  |       —       |

### Tính năng chung mỗi module

| Tính năng           | Chi tiết                                                   |
| :------------------ | :--------------------------------------------------------- |
| **Tìm kiếm**        | Debounce 500ms, server-side search                         |
| **Phân trang**      | Server-side, 5/10/25 rows per page                         |
| **Lọc**             | Dropdown filters (role, status, category, loại voucher...) |
| **Selection**       | Checkbox select-all + từng dòng → bulk delete              |
| **Action Menu**     | Per-row dropdown: Sửa, Xóa, các action đặc biệt            |
| **Delete Dialog**   | Confirmation modal hỗ trợ single + multi mode              |
| **Toast**           | Success/Error notifications (react-hot-toast)              |
| **Form validation** | React Hook Form + Zod schemas                              |

### Tính năng đặc biệt theo module

| Module          | Tính năng                                                                      |
| :-------------- | :----------------------------------------------------------------------------- |
| **Sản phẩm**    | Multi-image gallery, category filter, VNĐ formatting                           |
| **Đơn hàng**    | Status workflow, Payment actions, Timeline audit log                           |
| **Người dùng**  | Session management (xem IP/browser, thu hồi), Activate/Deactivate, Change role |
| **Voucher**     | Usage progress bar, Smart status computation, Dynamic field visibility         |
| **Roles**       | Permission matrix (checkbox grid + select-all), Admin role protection          |
| **Permissions** | Immutable system key                                                           |

---

## 🔐 Xác thực & Phân quyền

### Auth Flow

```
App Load → AuthProvider
  ├─ checkAuth() → GET /users/me
  │   ├─ ✅ Success → user + isAuthenticated=true → fetchMyPermissions()
  │   └─ ❌ Fail → isAuthenticated=false → redirect /login
  │
Login → POST /users/login → Backend set HttpOnly cookies
  └─ Redux: user + isAuthenticated=true → fetchMyPermissions()

Logout → POST /users/logout → Backend clear cookies
  └─ Redux: clearAuth() → redirect /login

Token Expired (410) → Axios interceptor
  └─ POST /refresh-token → Cookies mới → Retry request gốc
```

### RBAC — Phân quyền giao diện

Menu sidebar và chức năng được ẩn/hiện dựa trên permission:

| Menu item           | Permission cần    |
| :------------------ | :---------------- |
| Dashboard           | — (ai cũng thấy)  |
| Quản lý người dùng  | `MANAGE_USERS`    |
| Quản lý sản phẩm    | `MANAGE_PRODUCTS` |
| Quản lý danh mục    | `MANAGE_PRODUCTS` |
| Quản lý đơn hàng    | `MANAGE_ORDERS`   |
| Quản lý voucher     | `MANAGE_VOUCHERS` |
| Quản lý roles       | `MANAGE_ROLES`    |
| Quản lý permissions | `MANAGE_ROLES`    |
| Cài đặt tài khoản   | —                 |
| Lịch sử thông báo   | —                 |

> Admin (role = `admin`) tự động bypass tất cả permission checks.

---

## 🔔 Realtime Socket.IO

### Kết nối

```
isAuthenticated=true → Refresh token → Connect socket (auth.token)
  ├─ Transport: websocket (fallback: polling)
  ├─ Auto-retry: 3 lần, delay 2s
  └─ Disconnect khi logout
```

### Socket Events

| Event                  | Xử lý                                    |
| :--------------------- | :--------------------------------------- |
| `order:new`            | +1 `newOrderCount` + refresh orders      |
| `order:statusUpdated`  | Toast + refresh orders                   |
| `order:paymentUpdated` | Toast + refresh orders                   |
| `order:markPaid`       | Toast + refresh orders                   |
| `order:cancelled`      | Refresh orders                           |
| `notification:new`     | Toast + thêm vào Redux notification list |

### Context API

```typescript
const { socket, isConnected, newOrderCount, resetNewOrderCount } = useSocket()
```

---

## 🗃️ State Management

### Redux Store (9 Slices)

| Slice           | State chính                           | Async Thunks                                          |
| :-------------- | :------------------------------------ | :---------------------------------------------------- |
| `auth`          | user, isAuthenticated, isCheckingAuth | login, logout, checkAuth                              |
| `users`         | users[], pagination, filters          | fetchUsers, createUser, updateUser, deleteUser...     |
| `products`      | products[], productCategories[]       | fetchProducts, fetchProductById, createProduct...     |
| `categories`    | categories[], selectedCategory        | fetchCategories, createCategory, updateCategory...    |
| `orders`        | orders[], selectedOrder, orderLogs[]  | fetchOrders, fetchOrderById, updateOrderStatus...     |
| `vouchers`      | vouchers[], selectedVoucher           | fetchVouchers, createVoucher, updateVoucher...        |
| `roles`         | roles[], selectedRole                 | fetchRoles, createRole, updateRole...                 |
| `permissions`   | permissions[], myPermissions[]        | fetchPermissions, fetchMyPermissions...               |
| `notifications` | notifications[], unreadCount          | fetchNotifications, markAsRead, deleteNotification... |

### Typed Hooks

```typescript
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
```

---

## 🔌 API Integration

### Axios Instance

| Cấu hình    | Giá trị                                            |
| :---------- | :------------------------------------------------- |
| Base URL    | `NEXT_PUBLIC_API_URL` (`http://localhost:8017/V1`) |
| Timeout     | 30s                                                |
| Credentials | `withCredentials: true` (HttpOnly cookies)         |

### Interceptor Flow

```
Response →
  ├─ 200-299 → Pass through
  ├─ 401 (Unauthorized) → Auto logout + redirect /login
  ├─ 410 (Token expired) →
  │   ├─ Lần 1: refresh-token → retry original request
  │   └─ Lần 2: auto logout
  └─ Other → toast.error(message)
```

> Chống race condition: Singleton `refreshTokenPromise` — nhiều request 410 đồng thời chỉ gọi refresh 1 lần.

### API Endpoints sử dụng (50+ endpoints)

<details>
<summary><b>Auth (3)</b></summary>

| Method | Endpoint               | Service                      |
| :----- | :--------------------- | :--------------------------- |
| POST   | `/users/login`         | `authService.login()`        |
| POST   | `/users/logout`        | `authService.logout()`       |
| POST   | `/users/refresh-token` | `authService.refreshToken()` |

</details>

<details>
<summary><b>Users & Sessions (16)</b></summary>

| Method | Endpoint                             | Service                           |
| :----- | :----------------------------------- | :-------------------------------- |
| GET    | `/users/me`                          | `authService.getCurrentUser()`    |
| PUT    | `/users/me`                          | `userService.updateProfile()`     |
| GET    | `/users/all`                         | `userService.getAll()`            |
| GET    | `/users/overview`                    | `userService.getOverview()`       |
| GET    | `/users/details/:id`                 | `userService.getById()`           |
| POST   | `/users/create`                      | `userService.create()`            |
| PUT    | `/users/update/:id`                  | `userService.update()`            |
| DELETE | `/users/delete/:id`                  | `userService.delete()`            |
| POST   | `/users/delete-multiple`             | `userService.deleteMultiple()`    |
| PATCH  | `/users/activate/:id`                | `userService.activate()`          |
| PATCH  | `/users/deactivate/:id`              | `userService.deactivate()`        |
| PATCH  | `/users/:id/role`                    | `userService.changeRole()`        |
| GET    | `/users/sessions/:userId`            | `userService.getSessions()`       |
| POST   | `/users/revoke-session`              | `userService.revokeSession()`     |
| DELETE | `/users/revoke-all-sessions/:userId` | `userService.revokeAllSessions()` |

</details>

<details>
<summary><b>Products (7)</b></summary>

| Method | Endpoint                   | Service                           |
| :----- | :------------------------- | :-------------------------------- |
| GET    | `/products/getAll`         | `productService.getAll()`         |
| GET    | `/products/details/:id`    | `productService.getById()`        |
| POST   | `/products/create`         | `productService.create()`         |
| PUT    | `/products/update/:id`     | `productService.update()`         |
| DELETE | `/products/delete/:id`     | `productService.delete()`         |
| POST   | `/products/deleteSelected` | `productService.deleteMultiple()` |
| POST   | `/products/upload-image`   | `productService.uploadImage()`    |

</details>

<details>
<summary><b>Categories (6)</b></summary>

| Method | Endpoint                  | Service                            |
| :----- | :------------------------ | :--------------------------------- |
| GET    | `/categories`             | `categoryService.getAll()`         |
| GET    | `/categories/:id`         | `categoryService.getById()`        |
| POST   | `/categories`             | `categoryService.create()`         |
| PUT    | `/categories/:id`         | `categoryService.update()`         |
| DELETE | `/categories/:id`         | `categoryService.delete()`         |
| DELETE | `/categories/delete-many` | `categoryService.deleteMultiple()` |

</details>

<details>
<summary><b>Orders (7)</b></summary>

| Method | Endpoint                           | Service                              |
| :----- | :--------------------------------- | :----------------------------------- |
| GET    | `/orders/all`                      | `orderService.getAll()`              |
| GET    | `/orders/admin/details/:id`        | `orderService.getById()`             |
| PUT    | `/orders/admin/update/:id`         | `orderService.updateStatus()`        |
| PUT    | `/orders/admin/update-payment/:id` | `orderService.updatePaymentStatus()` |
| POST   | `/orders/admin/mark-paid/:id`      | `orderService.markPaid()`            |
| POST   | `/orders/admin/cancel/:id`         | `orderService.cancel()`              |
| GET    | `/orders/admin/logs/:id`           | `orderService.getLogs()`             |

</details>

<details>
<summary><b>Vouchers (6)</b></summary>

| Method | Endpoint                    | Service                           |
| :----- | :-------------------------- | :-------------------------------- |
| GET    | `/vouchers/all`             | `voucherService.getAll()`         |
| GET    | `/vouchers/details/:id`     | `voucherService.getById()`        |
| POST   | `/vouchers/create`          | `voucherService.create()`         |
| PUT    | `/vouchers/update/:id`      | `voucherService.update()`         |
| DELETE | `/vouchers/delete/:id`      | `voucherService.delete()`         |
| POST   | `/vouchers/delete-multiple` | `voucherService.deleteMultiple()` |

</details>

<details>
<summary><b>Roles & Permissions (14)</b></summary>

| Method | Endpoint                         | Service                                |
| :----- | :------------------------------- | :------------------------------------- |
| GET    | `/roles`                         | `roleService.getAll()`                 |
| POST   | `/roles`                         | `roleService.create()`                 |
| GET    | `/roles/:id`                     | `roleService.getById()`                |
| PUT    | `/roles/:id`                     | `roleService.update()`                 |
| DELETE | `/roles/:id`                     | `roleService.delete()`                 |
| GET    | `/roles/:id/permissions`         | `roleService.getPermissions()`         |
| POST   | `/roles/:id/permissions`         | `roleService.assignPermission()`       |
| POST   | `/roles/:id/permissions/bulk`    | `roleService.bulkAssignPermissions()`  |
| DELETE | `/roles/:id/permissions/:permId` | `roleService.removePermission()`       |
| GET    | `/permissions`                   | `permissionService.getAll()`           |
| GET    | `/permissions/me`                | `permissionService.getMyPermissions()` |
| POST   | `/permissions`                   | `permissionService.create()`           |
| PUT    | `/permissions/:id`               | `permissionService.update()`           |
| DELETE | `/permissions/:id`               | `permissionService.delete()`           |

</details>

<details>
<summary><b>Notifications (5)</b></summary>

| Method | Endpoint                     | Service                                    |
| :----- | :--------------------------- | :----------------------------------------- |
| GET    | `/notifications`             | `notificationService.getMyNotifications()` |
| PATCH  | `/notifications/:id/read`    | `notificationService.markAsRead()`         |
| PATCH  | `/notifications/read-all`    | `notificationService.markAllAsRead()`      |
| DELETE | `/notifications/:id`         | `notificationService.deleteNotification()` |
| DELETE | `/notifications/delete-read` | `notificationService.deleteAllRead()`      |

</details>

---

## 📚 Tài liệu bổ sung

Xem thư mục `docs/` để biết chi tiết:

| Tài liệu                                                                                    | Nội dung                         |
| :------------------------------------------------------------------------------------------ | :------------------------------- |
| [admin_api_documentation.md](docs/admin_api_documentation.md)                               | API tổng quan cho admin          |
| [admin_product_api_documentation.md](docs/admin_product_api_documentation.md)               | API sản phẩm admin               |
| [admin_user_management_api.md](docs/admin_user_management_api.md)                           | API quản lý users                |
| [category_api_doc.md](docs/category_api_doc.md)                                             | API danh mục                     |
| [client_api_documentation.md](docs/client_api_documentation.md)                             | API client reference             |
| [role_permission_api_doc.md](docs/role_permission_api_doc.md)                               | API roles & permissions          |
| [multi_image_implementation_walkthrough.md](docs/multi_image_implementation_walkthrough.md) | Hướng dẫn triển khai multi-image |
| [frontend_migration_guide.md](docs/frontend_migration_guide.md)                             | Hướng dẫn migration FE           |

---

## 👨‍💻 Tác giả

**DHVuxDev**

---

<p align="center">
  Built with ❤️ for E-commerce Admin Management
</p>
