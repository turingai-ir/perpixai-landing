# تست انتقال شماره به صفحه‌ی ورود

وقتی کاربر شماره‌اش را به پیکسو می‌دهد، به این آدرس فرستاده می‌شود:

```
https://app.perpixai.ir/auth/login?phone=09121234567
```

این شکل با تیم بک‌اند توافق شده است: پارامتر `phone` با شماره‌ی ۱۱ رقمی که با `09` شروع می‌شود.

## تست بدون تغییر کد

این گزینه‌ها را به آخر آدرس لندینگ اضافه کنید، مثلاً `http://localhost:5176/?authDebug=1`:

| گزینه | کار | مقدارها |
| --- | --- | --- |
| `authDebug=1` | به‌جای رفتن، آدرس نهایی را روی صفحه نشان می‌دهد و یک دکمه برای باز کردنش می‌گذارد | — |
| `phoneParam=…` | اسم پارامتر را عوض می‌کند | مثلاً `mobile`، `phoneNumber`، `username` |
| `phoneFormat=…` | شکل شماره را عوض می‌کند | `local` = 09121234567 · `national` = 9121234567 · `intl` = +989121234567 |

نمونه‌ها:
```
/?authDebug=1
/?authDebug=1&phoneParam=mobile
/?authDebug=1&phoneParam=mobile&phoneFormat=intl
/?phoneParam=username&phoneFormat=national
```

مقصد همیشه همان `app.perpixai.ir` است و از طریق آدرس قابل تغییر نیست.

## وقتی تیم بک‌اند جواب داد

یکی از این دو کار کافی است:
- در `src/config.ts` مقدار `phone.param` و `phone.format` را عوض کنید، یا
- موقع build متغیرهای `NEXT_PUBLIC_PHONE_PARAM` و `NEXT_PUBLIC_PHONE_FORMAT` را بدهید (نمونه در `.env.example`).
