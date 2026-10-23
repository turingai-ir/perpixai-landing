# راهنمای ساخت محتوا: ویدیوها و صدای پیکسو

## ۱. سه ویدیوی «نمایش جادو»

ویدیوها را با Gemini بسازید و با همین نام‌ها در `public/demo/` بگذارید.

- **فرمت:** MP4 با کدک H.264، ابعاد ۱۲۸۰×۷۲۰، نسبت ۱۶:۹، ۸ تا ۱۰ ثانیه، **بدون صدا**، حجم ترجیحاً زیر ۴ مگابایت.
- **آماده‌سازی برای وب:** فایل اصلی Gemini را بدهید. نسخه‌ی ۷۲۰p بدون صدا به دو فرمت MP4 و WebM ساخته می‌شود، همراه با تصویر پوستر. بعد در `src/content/demos.ts` مقدار `ready: true` را بگذارید.
- **تصویر پوستر (اختیاری):** اولین فریم با همان نام و پسوند `.jpg`، مثلاً `paykan-rain.jpg`.
- **متن داخل ویدیو نگذارید.** مدل‌های ویدیو حروف فارسی را خراب می‌سازند. پرامپت فارسی را خود سایت زیر ویدیو نشان می‌دهد.
- پرامپت‌ها انگلیسی هستند، چون مدل‌ها با انگلیسی نتیجه‌ی دقیق‌تری می‌دهند.

### `paykan-rain.mp4` — پیکانِ نوستالژی زیر بارانِ نئونی
```
Cinematic night shot in Tehran: a vintage 1970s Iranian Paykan sedan, cream-white, drives slowly toward the camera down a narrow rain-soaked street. Neon signs in magenta and electric blue reflect in deep puddles; raindrops streak through the headlight beams. Low-angle tracking shot, shallow depth of field, anamorphic lens flares, subtle film grain, moody magenta-and-teal color grade. Milad Tower glows faintly through the mist in the background. Slow, smooth dolly-in. No text, no subtitles, no logos. 8 seconds, 16:9.
```

### `yalda-pomegranate.mp4` — اناری که شب یلدا ستاره می‌شود
```
Macro cinematic shot of a Yalda night table: candlelight, an open book of Hafez poetry, nuts and watermelon slices softly out of focus. A ripe red pomegranate slowly splits open in slow motion; its glowing ruby seeds float upward and transform into twinkling stars drifting into a deep indigo night sky. Warm amber candlelight blending into a magical magenta and blue glow, shallow depth of field, slow push-in, dreamy and emotional. No text, no subtitles, no people. 8 seconds, 16:9.
```

### `flying-carpet.mp4` — فرشِ پرنده بر فراز نقش جهان
```
Epic aerial cinematic shot at golden hour: an intricately woven red-and-navy Persian carpet glides gracefully over Naqsh-e Jahan Square in Isfahan; the turquoise dome of Sheikh Lotfollah Mosque and the long fountains glow below. The carpet's tassels ripple in the wind as a flock of white pigeons flies alongside. The camera follows from slightly behind and above, then slowly rises to reveal the whole square. Warm sunlight, volumetric haze, rich saturated colors, smooth drone-like motion. No text, no subtitles, no logos. 8 seconds, 16:9.
```

اگر ایده یا ویدیو را عوض کردید، متن دکمه (`chip`) و پرامپت فارسی (`prompt`) را هم در `src/content/demos.ts` به‌روز کنید.

## ۲. صدای پیکسو (ElevenLabs)

- برای همه‌ی جمله‌ها از **یک صدا** استفاده کنید: پرانرژی، صمیمی و کمی شیطون. شبیه یک رفیق باهوش، نه گوینده‌ی رسمی.
- هر فایل را **دقیقاً** با نام ستون اول ذخیره کنید و در `public/audio/fa/` بگذارید.
- فرمت MP3 باشد و سکوت ابتدا و انتهای فایل را ببُرید.
- ستون «لحن» برای تنظیم حس صداست. اگر ElevenLabs از تگ‌های احساسی پشتیبانی کرد، می‌توانید از آن کمک بگیرید.
- هر فایلی که هنوز آماده نیست مشکلی ایجاد نمی‌کند. زیرنویس نمایش داده می‌شود و ماشین بدون صدا «حرف می‌زند».
- برای تغییر متن جمله‌ها، `src/content/dialogue.ts` را ویرایش کنید.

| فایل | متن | لحن |
| --- | --- | --- |
| `intro-1.mp3` | اوه! بالاخره یکی روشنم کرد. من پیکسو‌ام، ماشینِ خیال‌پردازِ پرپیکس. | Surprised, waking up, then proud. Warm, playful. |
| `intro-2.mp3` | جرقه‌ها روشن، نوار آماده! سلام، من پیکسو‌ام؛ از حرفات عکس و ویدیو می‌سازم. | Energetic, like a machine powering up. Friendly. |
| `greet-1.mp3` | خب رفیق، قبلاً تو پرپیکس ثبت‌نام کردی؟ | Casual, curious question. |
| `greet-2.mp3` | یه سؤال؛ قبلاً با هم کار کردیم یا تازه اومدی؟ | Light, a bit cheeky. |
| `greet-3.mp3` | بگو ببینم، عضو پرپیکس هستی یا اولین باره که اومدی؟ | Friendly and inviting. |
| `back-1.mp3` | اِ، تویی؟ خوش برگشتی! مستقیم بریم سراغ ورود؟ | Happy recognition, upbeat. |
| `back-2.mp3` | دوباره اومدی؟ معلومه خوشت اومده! بریم وارد شیم؟ | Teasing, smiling voice. |
| `login-1.mp3` | ایول! یه ثانیه صبر کن، الان می‌فرستمت صفحه‌ی ورود. | Quick, satisfied. |
| `new-1.mp3` | پس تازه‌واردی! دو راه داری: یا همین الان در کمتر از یه دقیقه ثبت‌نام کن و اعتبار هدیه بگیر، یا اول بذار نشونت بدم چی بلدم. | Excited, clear, a little salesy but charming. |
| `phone-1.mp3` | شماره موبایلت رو بزن، بقیه‌ش با من. | Confident, reassuring. |
| `phone-bad.mp3` | اوه، این شماره یه جوریه! یه بار دیگه چک کن؛ باید با ۰۹ شروع بشه. | Gentle, a little funny, not scolding. |
| `signup-1.mp3` | عالیه! داری می‌ری که اولین شاهکارت رو بسازی. | Celebratory. |
| `demo-ask.mp3` | یکی از این ایده‌ها رو انتخاب کن تا جلوی چشمت بسازمش. | Showman, inviting. |
| `compute-1.mp3` | یه لحظه... جرقه‌ها دارن کار می‌کنن! | Concentrated, building tension. |
| `compute-2.mp3` | دارم صفر و یک‌ها رو به تصویر تبدیل می‌کنم... | Whispery, mysterious. |
| `reveal-1.mp3` | تقدیم با عشق! اینو با پرپیکس ساختم. حالا نوبت خودته. | Proud reveal, then a direct invitation. |
| `reveal-2.mp3` | دیدی؟ فقط با یه جمله! تو هم می‌تونی؛ ثبت‌نام رایگانه. | Amazed, then encouraging. |
| `scroll-1.mp3` | باشه، یه نگاه بنداز پایین. من همین‌جام. | Relaxed, easygoing. |
| `nudge-1.mp3` | هنوز اونجایی؟ قول می‌دم ثبت‌نامش از آب خوردن هم راحت‌تره! | Playful nudge. |
| `nudge-2.mp3` | من که حوصله‌م سر نمی‌ره، ولی جرقه‌هام منتظرن ها! | Cheeky. |

### متن آماده با تگ‌های Eleven v4

برای هر فایل، متن همان خط را بدون نام فایل در ElevenLabs کپی کنید. تگ‌ها انگلیسی‌اند و داخل `[ ]` می‌آیند؛ متن فارسی است.

```
intro-1    [startled] اوه! [excited] بالاخره یکی روشنم کرد. [proudly] من پیکسو‌ام، ماشینِ خیال‌پردازِ پرپیکس.
intro-2    [energetic, powering up] جرقه‌ها روشن، نوار آماده! [warmly] سلام، من پیکسو‌ام؛ [playfully] از حرفات عکس و ویدیو می‌سازم.
greet-1    [casual, curious] خب رفیق... قبلاً تو پرپیکس ثبت‌نام کردی؟
greet-2    [mischievously] یه سؤال؛ [curious] قبلاً با هم کار کردیم یا تازه اومدی؟
greet-3    [friendly] بگو ببینم، [curious] عضو پرپیکس هستی یا اولین باره که اومدی؟
back-1     [surprised, happy] اِ، تویی؟ [excited] خوش برگشتی! [playfully] مستقیم بریم سراغ ورود؟
back-2     [teasing] دوباره اومدی؟ [laughs] معلومه خوشت اومده! [cheerfully] بریم وارد شیم؟
login-1    [satisfied] ایول! [quickly] یه ثانیه صبر کن، الان می‌فرستمت صفحه‌ی ورود.
new-1      [excited] پس تازه‌واردی! [enthusiastic] دو راه داری: یا همین الان در کمتر از یه دقیقه ثبت‌نام کن و اعتبار هدیه بگیر... [mischievously] یا اول بذار نشونت بدم چی بلدم.
phone-1    [confident, reassuring] شماره موبایلت رو بزن، [warmly] بقیه‌ش با من.
phone-bad  [amused] اوه، این شماره یه جوریه! [gently] یه بار دیگه چک کن؛ باید با صفر نُه شروع بشه.
signup-1   [celebratory] عالیه! [excited] داری می‌ری که اولین شاهکارت رو بسازی.
demo-ask   [showman, inviting] یکی از این ایده‌ها رو انتخاب کن... [dramatically] تا جلوی چشمت بسازمش.
compute-1  [concentrating] یه لحظه... [excited whisper] جرقه‌ها دارن کار می‌کنن!
compute-2  [whispers, mysterious] دارم صفر و یک‌ها رو... [slowly] به تصویر تبدیل می‌کنم...
reveal-1   [proudly] تقدیم با عشق! [satisfied] اینو با پرپیکس ساختم. [warmly] حالا نوبت خودته.
reveal-2   [amazed] دیدی؟ فقط با یه جمله! [encouraging] تو هم می‌تونی؛ ثبت‌نام رایگانه.
scroll-1   [relaxed] باشه، یه نگاه بنداز پایین. [warmly] من همین‌جام.
nudge-1    [playfully] هنوز اونجایی؟ [mischievously] قول می‌دم ثبت‌نامش از آب خوردن هم راحت‌تره!
nudge-2    [sighs] من که حوصله‌م سر نمی‌ره... [cheeky] ولی جرقه‌هام منتظرن ها!
```
