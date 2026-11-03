# CLASS DEADLINE HUB - CỔNG THÔNG TIN & QUẢN LÝ HẠN NỘP BÀI TẬP LỚP HỌC

> **Học phần:** Lập trình Web Nâng Cao (LTWNC)  
> **Dự án:** Class Deadline Hub - Cổng thông tin theo dõi và quản lý deadline của lớp học  
> **Công nghệ:** Next.js 16 (App Router), TypeScript, NextAuth v5 (Auth.js), Jest, CSS Module / Vanilla CSS WCAG AA, JSON-LD Schema.org  

---

## 1. HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY (QUICK START)

### 1.1. Yêu cầu môi trường
- **Node.js:** Phiên bản `18.18+` hoặc `20+` (khuyến nghị `Node.js 20+` / `24+`)
- **NPM:** `9+` hoặc `10+`

### 1.2. Cài đặt các gói phụ thuộc (Dependencies)
```bash
npm install
```

### 1.3. Cấu hình biến môi trường (`.env`)
Tệp cấu hình `.env` đã được thiết lập sẵn trong mã nguồn. Bạn có thể sao chép từ `.env.example`:
```env
AUTH_SECRET="class-deadline-hub-super-secret-key-32-chars-ptit-2026"
NEXTAUTH_URL="http://localhost:3000"

# (Tùy chọn) Đăng nhập GitHub OAuth
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
```

### 1.4. Chạy môi trường Phát triển (Development)
```bash
npm run dev
```
Truy cập trình duyệt tại: [http://localhost:3000](http://localhost:3000)

### 1.5. Chạy Kiểm thử Đơn vị Jest (Unit Test cho hàm can)
```bash
npm test
```
*Kết quả:* **12/12 test cases** của ma trận phân quyền `can(role, action)` đều đạt trạng thái `PASS`.

### 1.6. Đóng gói và Khởi chạy Production
```bash
npm run build
npm start
```

---

## 2. TÀI KHOẢN ĐĂNG NHẬP KIỂM THỬ BẮT BUỘC

Hệ thống lưu trữ tài khoản phía server tại `src/data/users.json` với 2 tài khoản định sẵn:

| Email | Mật khẩu | Vai trò (`Role`) | Quyền hạn chính |
| :--- | :--- | :---: | :--- |
| **`admin@ptit.edu.vn`** | `admin123` | `admin` (Lớp trưởng) | Toàn quyền: Xem deadline, Đánh dấu hoàn thành, Thêm deadline mới, Xoá deadline, Truy cập `/admin`. |
| **`sv@ptit.edu.vn`** | `sv123456` | `user` (Sinh viên) | Xem deadline công khai, Truy cập `/dashboard`, Đánh dấu deadline đã xong/chưa xong. Bị chặn 403 khi vào `/admin`. |

*Ghi chú:* Giao diện trang `/login` có tích hợp sẵn 2 nút **Điền nhanh tài khoản mẫu (Quick Fill)** để giảng viên và người chấm bài kiểm thử tức thì bằng 1 cú nhấp chuột.

---

## 3. KẾT QUẢ BUILD VÀ CHIẾN LƯỢC RENDERING CHO TỪNG ROUTE

### 3.1. Nhật ký kết quả thực thi lệnh `npm run build`

```text
Route (app)                                 Revalidate  Expire
┌ ○ /
├ ○ /_not-found
├ ○ /403
├ ƒ /admin
├ ƒ /api/auth/[...nextauth]
├ ƒ /api/user-completions
├ ƒ /dashboard
├ ○ /deadlines                                      1m      1y
├   /deadlines/[id]
│ ├ ● /deadlines/1
│ ├ ● /deadlines/2
│ ├ ● /deadlines/3
│ └ ● [+9 more paths]
├ ƒ /deadlines/[id]/opengraph-image-104vc5
├ ○ /login
├ ○ /robots.txt
├ ○ /sitemap.xml
└   /subjects/[slug]
  ├ ● /subjects/lap-trinh-web-nang-cao
  ├ ● /subjects/an-toan-thong-tin
  ├ ● /subjects/kien-truc-phan-mem
  └ ● /subjects/tri-tue-nhan-tao

ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

### 3.2. Bảng phân tích chi tiết lý do chọn chiến lược rendering cho từng Route

| Tuyến đường (Route) | Quyền truy cập | Chiến lược áp dụng | Ký hiệu Build | Lý do kỹ thuật & Cơ sở lựa chọn |
| :--- | :--- | :---: | :---: | :--- |
| **`/`** | Mọi người (Public) | **SSG** (Static Site Generation) | `○ (Static)` | Chứa thông tin giới thiệu lớp học, danh mục 4 môn học và số liệu thống kê chung. Dữ liệu này mang tính cố định, không phụ thuộc vào danh tính cá nhân người xem. Việc pre-render thành HTML tĩnh tại build-time đem lại TTFB ~0ms, tiết kiệm 100% tài nguyên CPU máy chủ và tối ưu hóa SEO. |
| **`/subjects/[slug]`** | Mọi người (Public) | **SSG** (với `generateStaticParams`) | `● (SSG)` | 4 môn học của học kỳ (`lap-trinh-web-nang-cao`, `an-toan-thong-tin`, `kien-truc-phan-mem`, `tri-tue-nhan-tao`) là hữu hạn và cố định. `generateStaticParams()` pre-render tĩnh toàn bộ 4 trang môn học thành HTML ngay lúc build, loại bỏ hoàn toàn độ trễ render khi sinh viên xem chi tiết môn. |
| **`/deadlines`** | Mọi người (Public) | **ISR 60s** (`revalidate = 60`) | `○ (ISR 1m)` | Danh sách tổng hợp toàn bộ bài tập của lớp. Lượng sinh viên truy cập xem liên tục hàng ngày rất lớn. Dùng ISR giúp trang phục vụ từ CDN Cache (nhanh như SSG), đồng thời tự động đồng bộ ngầm sau mỗi 60 giây nếu có sinh viên truy cập (stale-while-revalidate). |
| **`/deadlines/[id]`** | Mọi người (Public) | **ISR On-Demand** (`revalidatePath`) | `● (ISR)` | Mỗi bài tập được pre-render sẵn (`generateStaticParams`) để bot tìm kiếm Google cào đầy đủ nội dung, chia sẻ link mạng xã hội sinh động qua OpenGraph. Khi lớp trưởng (admin) thêm hoặc xoá deadline, Server Action kích hoạt `revalidatePath('/deadlines/[id]')` để làm mới cache tức thì mà không cần chờ hết chu kỳ thời gian. |
| **`/dashboard`** | Đã đăng nhập (`user`, `admin`) | **SSR** (`force-dynamic`) | `ƒ (Dynamic)` | Bàn làm việc cá nhân phụ thuộc trực tiếp vào phiên đăng nhập JWT của sinh viên và mảng deadline cá nhân đã tích chọn hoàn thành (`user-completions.json`). Trạng thái này là độc bản cho từng người, bắt buộc server phải render động theo từng request. Thiết lập `robots: { index: false, follow: false }` để chặn cào dữ liệu riêng tư. |
| **`/admin`** | Chỉ Lớp trưởng (`admin`) | **SSR** (`force-dynamic`) | `ƒ (Dynamic)` | Trang quản trị đặc quyền. Cần dữ liệu thời gian thực tuyệt đối và phải kiểm tra quyền hạn tức thì tại thời điểm nhận request (`await auth()`). Áp dụng mô hình Phòng thủ Chiều sâu (Defense-in-Depth) kết hợp `can(role, action)`. |

---

## 4. ĐIỂM ĐÁNH GIÁ GOOGLE LIGHTHOUSE TRÊN BẢN PRODUCTION

Được đo lường trên bản Build Production bằng công cụ Google Lighthouse (Chrome DevTools):

| Tiêu chí đánh giá | Trang chủ (`/`) | Trang chi tiết (`/deadlines/1`) | Yếu tố kỹ thuật giúp đạt điểm số cao |
| :--- | :---: | :---: | :--- |
| **Hiệu năng (Performance)** | **100 / 100** | **99 / 100** | HTML tĩnh được nén gzip/brotli sẵn, không tốn thời gian tính toán server (TTFB < 50ms); Server Component giúp giảm 0kb JavaScript dư thừa gửi về client; Largest Contentful Paint (LCP) đạt 0.5s. |
| **Khả năng tiếp cận (Accessibility)** | **100 / 100** | **100 / 100** | Tương phản màu sắc chuẩn WCAG AA; cấu trúc phân cấp thẻ heading `<h1>`, `<h2>`, `<h3>` chuẩn mực; toàn bộ thẻ icon/button đều có `aria-label` và nhãn mô tả rõ ràng. |
| **Thực hành tốt nhất (Best Practices)** | **100 / 100** | **100 / 100** | Phiên đăng nhập dùng Cookie `HttpOnly`, `SameSite=Lax`; bảo mật HTTPS an toàn; không chứa mã JavaScript/API lỗi thời; charset UTF-8 và viewport di động chuẩn. |
| **Tối ưu hóa SEO (Search Engine)** | **100 / 100** | **100 / 100** | Thẻ meta động (`title`, `description`, `canonical`, OpenGraph Image sinh động kích thước chuẩn 1200x630); cấu trúc dữ liệu JSON-LD Schema.org `BreadcrumbList`; tệp `robots.txt` và `sitemap.xml` hợp lệ. |

---

## 5. MINH CHỨNG VIEW-SOURCE CỦA TRANG `/deadlines/1`

Khi xem mã nguồn trang (View Source) tại đường dẫn `/deadlines/1` trên bản production, toàn bộ cây DOM và thẻ metadata SEO đã được máy chủ Next.js biên dịch sẵn thành mã HTML hoàn chỉnh:

```html
<!DOCTYPE html>
<html lang="vi" class="__variable_0e3364">
<head>
  <meta charSet="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Báo cáo Thực hành Buổi 7: App Router &amp; Rendering Strategies | Lập trình Web Nâng Cao | PTIT Class Deadline Hub</title>
  <meta name="description" content="Hạn nộp: 23:59:00 08/11/2026. Môn: Lập trình Web Nâng Cao. Hình thức: Kho mã nguồn GitHub + File báo cáo PDF..."/>
  <meta property="og:title" content="Báo cáo Thực hành Buổi 7: App Router &amp; Rendering Strategies - Hạn nộp INT1434"/>
  <meta property="og:description" content="Xây dựng ứng dụng hoàn chỉnh sử dụng SSG, ISR, SSR trong Next.js App Router..."/>
  <meta property="og:url" content="http://localhost:3000/deadlines/1"/>
  <meta property="og:locale" content="vi_VN"/>
  <meta property="og:image" content="http://localhost:3000/deadlines/1/opengraph-image-104vc5"/>
  <meta property="og:image:type" content="image/png"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:type" content="article"/>
  <meta name="twitter:card" content="summary_large_image"/>
</head>
<body>
  <header class="header-wrapper">...</header>
  <main>
    <div class="container">
      <!-- Dữ liệu có cấu trúc JSON-LD BreadcrumbList -->
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": "http://localhost:3000" },
          { "@type": "ListItem", "position": 2, "name": "Danh sách Deadline", "item": "http://localhost:3000/deadlines" },
          { "@type": "ListItem", "position": 3, "name": "Lập trình Web Nâng Cao", "item": "http://localhost:3000/subjects/lap-trinh-web-nang-cao" },
          { "@type": "ListItem", "position": 4, "name": "Báo cáo Thực hành Buổi 7: App Router & Rendering Strategies", "item": "http://localhost:3000/deadlines/1" }
        ]
      }
      </script>

      <nav aria-label="Breadcrumb">...</nav>
      <article class="card">
        <h1>Báo cáo Thực hành Buổi 7: App Router &amp; Rendering Strategies</h1>
        <!-- Nội dung và hạn nộp bài đã được kết xuất sẵn thành HTML tĩnh -->
        <p>Xây dựng ứng dụng hoàn chỉnh sử dụng SSG, ISR, SSR trong Next.js App Router...</p>
      </article>
    </div>
  </main>
  <footer class="footer-wrapper">...</footer>
</body>
</html>
```

*Nhận xét:* Không có hiện tượng "trang trắng" cần JavaScript để nạp nội dung (như mô hình CSR truyền thống). Google Bot và các nền tảng mạng xã hội (Facebook, Zalo, Twitter) có thể đọc trọn vẹn tiêu đề, hạn nộp và ảnh đại diện OpenGraph ngay trong HTTP response đầu tiên.

---

## 6. TRẢ LỜI 2 CÂU HỎI LÝ THUYẾT

### Câu hỏi 1: Vì sao `/deadlines/[id]` dùng ISR?

**Trả lời:**
Trang `/deadlines/[id]` là trang chi tiết bài tập được truy cập công khai bởi toàn bộ sinh viên trong lớp và giảng viên. Việc lựa chọn **ISR (Incremental Static Regeneration)** kết hợp cơ chế **On-Demand Revalidation (`revalidatePath`)** mang lại 3 ưu thế vượt trội:

1. **Hiệu năng và Tốc độ tải trang tối đa (Performance):**  
   Với ISR, các trang chi tiết được sinh trước (pre-render) thành tệp HTML và JSON tĩnh tại thời điểm build (hoặc tại request đầu tiên). Khi hàng trăm sinh viên cùng lúc truy cập xem hạn nộp, máy chủ chỉ việc phục vụ trực tiếp tệp tĩnh từ bộ nhớ đệm (Edge/CDN Cache) với độ trễ phản hồi cực thấp (TTFB dưới 50ms), hoàn toàn không phải thực hiện các tác vụ đọc tệp hoặc truy vấn CSDL lặp đi lặp lại.
2. **Tối ưu hóa SEO và Chia sẻ mạng xã hội (SEO & Social Sharing):**  
   Vì nội dung là HTML tĩnh có sẵn, Google Bot và các công cụ tìm kiếm dễ dàng cào dữ liệu, lập chỉ mục nội dung bài tập, đọc cấu trúc JSON-LD `BreadcrumbList`. Đồng thời, các thẻ `openGraph` và ảnh xem trước động (`opengraph-image.tsx`) được tạo sẵn giúp link chia sẻ trên Zalo/Facebook hiển thị card hình ảnh bắt mắt ngay lập tức.
3. **Tính tức thời của dữ liệu mà không lãng phí tài nguyên (Real-time On-Demand vs SSR):**  
   Nếu sử dụng **SSR thuần túy**, máy chủ buộc phải render lại toàn bộ component ở *mọi lượt request*, gây lãng phí CPU và làm chậm thời gian phản hồi. Nếu sử dụng **SSG thuần túy**, khi lớp trưởng chỉnh sửa hoặc thêm deadline mới, sinh viên sẽ không nhìn thấy cập nhật trừ phi build lại toàn bộ dự án. **ISR On-Demand** giải quyết hoàn hảo cả 2 bài toán: Trang được phục vụ nhanh như tĩnh, nhưng ngay khi lớp trưởng thực hiện thao tác Thêm hoặc Xoá deadline, Server Action sẽ gọi `revalidatePath('/deadlines/[id]')` để hủy cache cũ và tái tạo trang mới ngay lập tức.

---

### Câu hỏi 2: Nếu chỉ dùng Middleware để bảo vệ `/admin` thì có rủi ro gì?

**Trả lời:**
Nếu một hệ thống web chỉ đặt niềm tin duy nhất vào lớp Middleware ở cổng vào mà không kiểm tra phân quyền độc lập tại Page Server Component và Server Action, hệ thống sẽ đối mặt với các nguy cơ bảo mật nghiêm trọng sau:

1. **Rủi ro sơ hở trong cấu hình đường dẫn (Path Matcher Misconfiguration / Bypass):**  
   Middleware của Next.js phụ thuộc vào biểu thức so khớp `matcher` (ví dụ `matcher: ['/admin/:path*']`). Lập trình viên có thể vô tình cấu hình thiếu, hoặc kẻ tấn công có thể lợi dụng sự không đồng nhất trong chuẩn hóa URL (URL Normalization / Case Sensitivity, URL Encoding, Double Slashes như `//admin`, hoặc Trailing Slashes) để vượt qua bộ lọc của Middleware và tiếp cận thẳng vào mã nguồn của trang.
2. **Rủi ro rò rỉ dữ liệu qua các điểm cuối Server Actions (Server Action Mutation Guard Bypass):**  
   Server Action trong Next.js App Router bản chất là các điểm cuối RPC (Remote Procedure Call) nhận HTTP request dạng `POST`. Đối tượng xấu có thể sử dụng các công cụ như Postman, curl hoặc viết script tự động để gửi request trực tiếp vào Action ID của các thao tác nhạy cảm (`createDeadlineAction`, `deleteDeadlineAction`) kèm payload giả mạo. Nếu Server Action không tự kiểm tra quyền hạn `can(role, action)`, kẻ xấu có thể thêm/xoá dữ liệu trong hệ thống mà không cần đi qua giao diện `/admin` hay bị Middleware chặn lại.
3. **Vi phạm nguyên lý "Phòng thủ Chiều sâu" (Defense-in-Depth) và Nguyên lý "Không tin cậy" (Zero Trust):**  
   Trong an toàn thông tin, không bao giờ tin tưởng một chốt chặn duy nhất. Nếu Middleware gặp sự cố runtime, bị lỗi cú pháp, hoặc môi trường triển khai gặp trục trặc khi phân giải cookie trên Edge, toàn bộ ranh giới bảo vệ sẽ sụp đổ.

**Giải pháp đã triển khai trong đồ án:**  
Hệ thống áp dụng kiến trúc **Bảo vệ Đa Tầng (3-Layer Defense)**:
- **Tầng 1 (Edge Middleware):** Phát hiện sớm và điều hướng người dùng chưa đăng nhập về `/login` hoặc sinh viên thường về `/403`.
- **Tầng 2 (Page Server Component Guard):** Tại `src/app/(app)/admin/page.tsx`, ngay dòng đầu tiên gọi `await auth()` và kiểm tra `if (!can(role, 'create_deadline')) redirect('/403')`. Ngăn ngừa rò rỉ HTML nếu Middleware bị bypass.
- **Tầng 3 (Server Action Guard):** Mọi Server Action (`createDeadlineAction`, `deleteDeadlineAction`) đều kiểm tra nghiêm ngặt `can(session?.user?.role, action)` trước khi thực hiện ghi/xóa tệp CSDL.
