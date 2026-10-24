# landing-page-perpix

لندینگ‌پیج سینمایی پرپیکس با شخصیت سه‌بعدی «پیکسو».

```bash
pnpm install
pnpm dev      # http://localhost:5176
pnpm build    # خروجی استاتیک (HTML پیش‌رندرشده) در out/
```

- **محتوا و ترجمه:** همه‌ی متن‌ها در `src/i18n/locales/<زبان>/*.json` هستند (فعلاً فقط `fa`)؛ داده‌های بدون زبان (قیمت‌ها، شناسه‌ها) در `src/content/` و لینک‌ها در `src/config.ts`.
- **ویدیوها و صدا:** راهنمای ساختشان در [docs/ASSETS.md](docs/ASSETS.md) است. فایل‌ها به `public/demo/` و `public/audio/fa/` می‌روند.
- **ساختار پروژه:** در [CLAUDE.md](CLAUDE.md) توضیح داده شده است.

## منابع
- آیکن‌ها: [Solar](https://www.figma.com/community/file/1166831539721848736) از 480 Design، با مجوز CC BY 4.0 و از طریق Iconify.
- ویدیوها، صداها و تصویر پیکسو مخصوص همین پروژه ساخته شده‌اند.

## گردش کار گیت
- `main` همیشه نسخه‌ی قابل انتشار است.
- هر تغییر روی یک برنچ جدا انجام می‌شود و با Pull Request وارد `main` می‌شود.
- با هر push و Pull Request، بررسی خودکار (GitHub Actions در `.github/workflows/ci.yml`) اجرا می‌شود: نصب از روی lockfile، بررسی تایپ‌ها و ساخت نسخه‌ی نهایی. خروجی ساخته‌شده (`dist`) هم به‌عنوان artifact ذخیره می‌شود.
