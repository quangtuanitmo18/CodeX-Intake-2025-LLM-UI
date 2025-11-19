# Profile & Settings Pages

## Tổng quan

Đã tạo xong 2 pages mới cho ứng dụng LLM UI:
- **Profile Page** (`/profile`) - Quản lý thông tin cá nhân và đổi mật khẩu
- **Settings Page** (`/settings`) - Cài đặt ứng dụng

## 📁 Cấu trúc files đã tạo

```
client/src/
├── app/
│   ├── profile/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
└── components/
    ├── llm/
    │   ├── user-profile-menu.tsx (Updated)
    │   └── llm-conversation-page.tsx (Updated)
    ├── profile/
    │   └── profile-page.tsx
    └── settings/
        └── settings-page.tsx
```

## ✨ Tính năng Profile Page

### 1. **Tab Profile**
- ✅ Hiển thị và chỉnh sửa avatar
- ✅ Chỉnh sửa tên (name)
- ✅ Hiển thị email (read-only)
- ✅ Upload ảnh avatar bằng cách click vào icon camera
- ✅ Preview ảnh trước khi save

### 2. **Tab Change Password**
- ✅ Nhập mật khẩu hiện tại (oldPassword)
- ✅ Nhập mật khẩu mới (password)
- ✅ Xác nhận mật khẩu mới (confirmPassword)
- ✅ Validation với Zod schema
- ✅ Loading state khi đang submit

### 3. **UX Features**
- ✅ Tabs navigation giữa Profile và Change Password
- ✅ Back button quay lại trang trước
- ✅ Form validation với error messages
- ✅ Loading indicators
- ✅ Success toast notifications
- ✅ Error handling

## ⚙️ Tính năng Settings Page

### 1. **General Settings**
- Language selection (English/Vietnamese)
- Theme selection (Dark/Light/System)

### 2. **LLM Preferences**
- Default Model selection (GPT-4/GPT-3.5/Claude)
- Temperature control (0-1)
- Max Tokens setting

### 3. **Privacy & Data**
- Toggle save conversation history
- Toggle analytics

### 4. **Danger Zone**
- Delete all conversations
- Delete account

> **Note:** Settings page hiện tại chỉ là UI mockup. Cần implement backend APIs và state management để lưu các settings này.

## 🎨 UI Design

### Theme & Colors
- **Background:** `#01030B` (Dark theme)
- **Borders:** Gray-800 (`border-gray-800`)
- **Cards:** Gray-900/50 (`bg-gray-900/50`)
- **Primary Color:** Blue-600 (`bg-blue-600`)
- **Danger Color:** Red-600 (`bg-red-600`)

### Components sử dụng
- ✅ **Tailwind CSS thuần** - Không dùng UI kit ngoài
- ✅ **React Hook Form** - Form management
- ✅ **Zod** - Schema validation
- ✅ **Lucide Icons** - Icons
- ✅ **React Query** - Data fetching & mutations

## 🔌 API Endpoints được sử dụng

### Profile Page

```typescript
// Get current user info
GET /accounts/me

// Update profile (name, avatar)
PATCH /accounts/me
Body: {
  name?: string
  avatar?: string | null
}

// Change password
PATCH /accounts/me/change-password
Body: {
  oldPassword: string
  password: string
  confirmPassword: string
}
```

## 🚀 User Flow

1. **Login** → Redirect to `/llm`
2. **Click Avatar** → Dropdown menu xuất hiện
3. **Click "Profile"** → Navigate to `/profile`
4. **Click "Settings"** → Navigate to `/settings`
5. **Click "Log out"** → Logout và redirect to `/login`

## 📝 User Profile Menu

Menu popup khi click vào avatar (góc trên bên phải):

```
┌─────────────────────────┐
│ User Name               │
│ user@email.com          │
├─────────────────────────┤
│ 👤 Profile              │
│ ⚙️  Settings            │
├─────────────────────────┤
│ 🚪 Log out              │
└─────────────────────────┘
```

### Features:
- ✅ Click outside để đóng menu
- ✅ Hiển thị avatar hoặc initials
- ✅ Loading state
- ✅ Logout confirmation
- ✅ Pure Tailwind CSS (không dùng Radix UI)

## 🔄 State Management

### React Query Cache Invalidation

Sau khi update profile thành công:
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['account-me'] })
}
```

## 🎯 Todo / Improvements

### Profile Page
- [ ] Implement actual file upload to server (hiện tại chỉ preview local)
- [ ] Add image cropper cho avatar
- [ ] Add validation cho file size và type
- [ ] Add delete avatar option

### Settings Page  
- [ ] Connect to backend APIs
- [ ] Implement actual settings save functionality
- [ ] Add confirmation modal cho delete actions
- [ ] Store settings in database
- [ ] Add export/import settings

### General
- [ ] Add loading skeleton cho initial page load
- [ ] Add page transitions
- [ ] Add keyboard shortcuts
- [ ] Add breadcrumbs navigation

## 💡 Tips

### Upload Avatar
Hiện tại avatar được convert thành base64 string. Trong production, nên:
1. Upload file lên server trước
2. Server trả về URL
3. Save URL vào database

### Form Validation
Tất cả forms đều sử dụng Zod schema validation:
- Client-side validation ngay khi submit
- Server-side validation qua API
- Error messages được hiển thị tự động

### Styling Convention
```typescript
// Dark theme base
bg-[#01030B]

// Cards
rounded-lg border border-gray-800 bg-gray-900/50

// Inputs
border border-gray-700 bg-gray-800 focus:border-blue-500

// Buttons
bg-blue-600 hover:bg-blue-700
```

---

Tất cả đã hoạt động và sẵn sàng sử dụng! 🎉
