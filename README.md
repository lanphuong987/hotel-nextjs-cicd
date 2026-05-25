# Change Hotel Demo

Landing page Next.js đơn giản cho khách sạn **Change Hotel**, được thiết kế để dễ test quy trình DevOps: branch, pull request, conflict, lint, test, build Docker và deploy.

## Stack

- Next.js 14 App Router
- TypeScript
- ESLint
- Jest + Testing Library
- Docker multi-stage build
- Docker Compose

## Cấu trúc chính

```text
change-hotel-demo/
├── src/
│   ├── app/                 # Next.js routes, layout, global CSS
│   ├── components/          # UI components và test gần component
│   └── data/siteConfig.ts   # Text, CTA, liên hệ, hình ảnh, rooms, amenities
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

Muốn đổi nội dung landing page, sửa file:

```text
src/data/siteConfig.ts
```

## Chạy local

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Lint, test, build

```bash
npm run lint
npm test
npm run build
```

Các lệnh này phù hợp để đưa vào CI/CD pipeline.

## Build Docker

```bash
docker build -t change-hotel-demo:local .
docker run --rm -p 3000:3000 change-hotel-demo:local
```

## Chạy bằng Docker Compose

```bash
docker compose up --build
```

App chạy tại `http://localhost:3000`.

## Gợi ý deploy

### Vercel

1. Push repository lên GitHub/GitLab/Bitbucket.
2. Import project vào Vercel.
3. Build command: `npm run build`.
4. Output mặc định của Next.js được Vercel tự nhận diện.

### Server dùng Docker

1. Build image trong CI:

```bash
docker build -t registry.example.com/change-hotel-demo:${GIT_SHA} .
```

2. Push image lên registry.
3. Trên server, pull image và chạy:

```bash
docker run -d --name change-hotel-demo -p 3000:3000 registry.example.com/change-hotel-demo:${GIT_SHA}
```

### CI/CD mẫu

Pipeline tối thiểu nên có các bước:

```bash
npm ci
npm run lint
npm test
npm run build
docker build -t change-hotel-demo:ci .
```

## Bài tập DevOps dễ tạo

- Tạo branch đổi text trong `src/data/siteConfig.ts`.
- Tạo branch đổi style trong `src/app/globals.css`.
- Tạo conflict bằng cách cùng sửa một room trong `siteConfig.ts`.
- Thêm test mới cho CTA hoặc thông tin liên hệ.
- Thêm GitHub Actions/GitLab CI chạy lint, test, build.
