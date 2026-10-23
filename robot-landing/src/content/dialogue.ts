/**
 * Everything Pixo says. Each line's `id` is also its audio file name:
 * public/audio/fa/<id>.mp3 (made with ElevenLabs). Missing files are fine —
 * the subtitle still shows and the machine "speaks" with a simulated envelope.
 */
export type Line = { id: string; text: string; direction: string }

const line = (id: string, text: string, direction: string): Line => ({ id, text, direction })

export const character = {
  name: 'پیکسو',
  title: 'ماشینِ خیال‌پردازِ پرپیکس',
}

export const dialogue = {
  intro: [
    line('intro-1', 'اوه! بالاخره یکی روشنم کرد. من پیکسو‌ام، ماشینِ خیال‌پردازِ پرپیکس.', 'Surprised, waking up, then proud. Warm, playful.'),
    line('intro-2', 'جرقه‌ها روشن، نوار آماده! سلام، من پیکسو‌ام؛ از حرفات عکس و ویدیو می‌سازم.', 'Energetic, like a machine powering up. Friendly.'),
  ],
  greetNew: [
    line('greet-1', 'خب رفیق، قبلاً تو پرپیکس ثبت‌نام کردی؟', 'Casual, curious question.'),
    line('greet-2', 'یه سؤال؛ قبلاً با هم کار کردیم یا تازه اومدی؟', 'Light, a bit cheeky.'),
    line('greet-3', 'بگو ببینم، عضو پرپیکس هستی یا اولین باره که اومدی؟', 'Friendly and inviting.'),
  ],
  greetBack: [
    line('back-1', 'اِ، تویی؟ خوش برگشتی! مستقیم بریم سراغ ورود؟', 'Happy recognition, upbeat.'),
    line('back-2', 'دوباره اومدی؟ معلومه خوشت اومده! بریم وارد شیم؟', 'Teasing, smiling voice.'),
  ],
  toLogin: [line('login-1', 'ایول! یه ثانیه صبر کن، الان می‌فرستمت صفحه‌ی ورود.', 'Quick, satisfied.')],
  newcomer: [
    line('new-1', 'پس تازه‌واردی! دو راه داری: یا همین الان در کمتر از یه دقیقه ثبت‌نام کن و اعتبار هدیه بگیر، یا اول بذار نشونت بدم چی بلدم.', 'Excited, clear, a little salesy but charming.'),
  ],
  askPhone: [line('phone-1', 'شماره موبایلت رو بزن، بقیه‌ش با من.', 'Confident, reassuring.')],
  badPhone: [line('phone-bad', 'اوه، این شماره یه جوریه! یه بار دیگه چک کن؛ باید با ۰۹ شروع بشه.', 'Gentle, a little funny, not scolding.')],
  toSignup: [line('signup-1', 'عالیه! داری می‌ری که اولین شاهکارت رو بسازی.', 'Celebratory.')],
  demoAsk: [line('demo-ask', 'یکی از این ایده‌ها رو انتخاب کن تا جلوی چشمت بسازمش.', 'Showman, inviting.')],
  computing: [
    line('compute-1', 'یه لحظه... جرقه‌ها دارن کار می‌کنن!', 'Concentrated, building tension.'),
    line('compute-2', 'دارم صفر و یک‌ها رو به تصویر تبدیل می‌کنم...', 'Whispery, mysterious.'),
  ],
  reveal: [
    line('reveal-1', 'تقدیم با عشق! اینو با پرپیکس ساختم. حالا نوبت خودته.', 'Proud reveal, then a direct invitation.'),
    line('reveal-2', 'دیدی؟ فقط با یه جمله! تو هم می‌تونی؛ ثبت‌نام رایگانه.', 'Amazed, then encouraging.'),
  ],
  scrollMore: [line('scroll-1', 'باشه، یه نگاه بنداز پایین. من همین‌جام.', 'Relaxed, easygoing.')],
  nudge: [
    line('nudge-1', 'هنوز اونجایی؟ قول می‌دم ثبت‌نامش از آب خوردن هم راحت‌تره!', 'Playful nudge.'),
    line('nudge-2', 'من که حوصله‌م سر نمی‌ره، ولی جرقه‌هام منتظرن ها!', 'Cheeky.'),
  ],
} satisfies Record<string, Line[]>

export type DialogueKey = keyof typeof dialogue

export const pick = (key: DialogueKey): Line => {
  const lines = dialogue[key]
  return lines[Math.floor(Math.random() * lines.length)]
}
