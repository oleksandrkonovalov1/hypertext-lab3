#!/usr/bin/env node

/**
 * DOCX report generator for Lab 3 — Hypertext & Hypermedia
 * Topic: Динамічний HTML. Форми. Основи JavaScript
 * Variant 9: Ботанічний довідник
 *
 * Formatting: ДСТУ 3008:2015 compact lab style
 * - Key fragments only in body (section 3), full code in ДОДАТОК А
 * - Grey background + blue left accent for code blocks
 * - keepNext on all headings and captions
 * - pageBreakBefore on sections 4, 5, ДОДАТОК А
 * - Short code blocks (<=25 lines) keepTogether, long blocks flow naturally
 *
 * Usage: npm run report
 */

import {
  Document, Packer, Paragraph, TextRun, Header,
  AlignmentType, PageNumber, HeadingLevel,
  PageBreak, BorderStyle, ShadingType,
} from "docx";
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Constants (ДСТУ 3008:2015) ─────────────────────────────────────

const MM_TO_DXA = 56.693;
const PT_TO_HALF_PT = 2;

const FONT = "Times New Roman";
const FONT_CODE = "Courier New";
const BODY_SIZE = 14 * PT_TO_HALF_PT;
const CODE_SIZE = 9 * PT_TO_HALF_PT;
const TITLE_SIZE = 14 * PT_TO_HALF_PT;
const LINE_SPACING_15 = 360;
const FIRST_LINE_INDENT = Math.round(12.5 * MM_TO_DXA);
const CODE_LEFT_INDENT = 283;
const CODE_BORDER_COLOR = "4472C4";
const CODE_BG_COLOR = "F2F2F2";

const margins = {
  top: Math.round(20 * MM_TO_DXA),
  bottom: Math.round(20 * MM_TO_DXA),
  left: Math.round(30 * MM_TO_DXA),
  right: Math.round(15 * MM_TO_DXA),
};

// ─── Helpers ────────────────────────────────────────────────────────

function titleRun(text, opts = {}) {
  return new TextRun({
    text,
    font: FONT,
    size: TITLE_SIZE,
    bold: opts.bold ?? false,
    ...opts,
  });
}

function bodyRun(text, opts = {}) {
  return new TextRun({ text, font: FONT, size: BODY_SIZE, ...opts });
}

function centeredParagraph(runs, spacing = {}) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 0, line: LINE_SPACING_15, lineRule: "auto", ...spacing },
    children: Array.isArray(runs) ? runs : [runs],
  });
}

function emptyLine() {
  return centeredParagraph(titleRun(""));
}

function sectionHeading(number, title, { pageBreakBefore: pbBefore = false } = {}) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120, line: LINE_SPACING_15, lineRule: "auto" },
    keepNext: true,
    pageBreakBefore: pbBefore,
    children: [
      new TextRun({
        text: [number, title].filter(Boolean).join(" ").toUpperCase(),
        font: FONT,
        size: BODY_SIZE,
        bold: true,
      }),
    ],
  });
}

function subsectionHeading(number, title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 120, after: 60, line: LINE_SPACING_15, lineRule: "auto" },
    indent: { firstLine: FIRST_LINE_INDENT },
    keepNext: true,
    children: [
      new TextRun({
        text: `${number} ${title}`,
        font: FONT,
        size: BODY_SIZE,
        bold: true,
      }),
    ],
  });
}

function bodyParagraph(text) {
  return new Paragraph({
    spacing: { after: 0, line: LINE_SPACING_15, lineRule: "auto" },
    indent: { firstLine: FIRST_LINE_INDENT },
    alignment: AlignmentType.JUSTIFIED,
    children: [bodyRun(text)],
  });
}

function codeParagraph(text, { keepLines = false, keepNext = false } = {}) {
  return new Paragraph({
    spacing: { after: 0, line: 240, lineRule: "auto" },
    indent: { left: CODE_LEFT_INDENT },
    shading: { fill: CODE_BG_COLOR, color: "auto", type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: CODE_BORDER_COLOR, space: 4 } },
    keepLines,
    keepNext,
    children: [
      new TextRun({ text: text || " ", font: FONT_CODE, size: CODE_SIZE, shading: { fill: CODE_BG_COLOR, color: "auto", type: ShadingType.CLEAR } }),
    ],
  });
}

function listingCaption(number, title) {
  return new Paragraph({
    spacing: { before: 120, after: 60, line: LINE_SPACING_15, lineRule: "auto" },
    indent: { firstLine: FIRST_LINE_INDENT },
    keepNext: true,
    children: [bodyRun(`Лістинг ${number} — ${title}`)],
  });
}

function codeBlock(text) {
  const lines = text.split("\n");
  const keepTogether = lines.length <= 25;
  return lines.map((line, i) => codeParagraph(line, {
    keepLines: keepTogether,
    keepNext: keepTogether && i < lines.length - 1,
  }));
}

function controlQuestion(number, question, answer) {
  return [
    new Paragraph({
      spacing: { before: 120, after: 60, line: LINE_SPACING_15, lineRule: "auto" },
      indent: { firstLine: FIRST_LINE_INDENT },
      keepNext: true,
      children: [bodyRun(`${number}. ${question}`, { bold: true })],
    }),
    bodyParagraph(answer),
  ];
}

// ─── Source code reader ─────────────────────────────────────────────

function readSourceFiles() {
  const srcDir = join(__dirname, "..", "..", "src");
  const files = [];
  function walk(dir, prefix = "") {
    const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "media") continue; // skip media folder
        walk(fullPath, prefix ? `${prefix}/${entry.name}` : entry.name);
      } else if (
        entry.name.endsWith(".html") ||
        entry.name.endsWith(".css") ||
        entry.name.endsWith(".js")
      ) {
        files.push({
          name: prefix ? `${prefix}/${entry.name}` : entry.name,
          content: readFileSync(fullPath, "utf-8"),
        });
      }
    }
  }
  walk(srcDir);
  return files;
}

// ─── Key fragments for body ─────────────────────────────────────────

const showTextFragment = `function showText(text, size) {
  var output = document.getElementById('font-output');
  var span = document.createElement('span');
  span.textContent = text;
  span.style.fontSize = size + 'px';
  span.title = size + 'px';
  output.appendChild(span);
}`;

const randomImageFragment = `function placeRandomImage() {
  var area = document.getElementById('image-area');
  var img = document.createElement('img');
  img.src = '...';
  img.style.left = Math.floor(Math.random() * (area.offsetWidth - 50)) + 'px';
  img.style.top = Math.floor(Math.random() * (area.offsetHeight - 50)) + 'px';
  area.appendChild(img);
}
imageIntervalId = setInterval(placeRandomImage, 1000);`;

const changeParagraphsFragment = `function changeParagraphs() {
  var paragraphs = document.getElementsByTagName('p');
  originalStyles = [];
  for (var i = 0; i < paragraphs.length; i++) {
    originalStyles.push(paragraphs[i].getAttribute('style') || '');
    var currentStyle = paragraphs[i].getAttribute('style') || '';
    paragraphs[i].setAttribute('style', currentStyle + '; font-size: 15px;');
  }
}`;

const clockFragment = `function updateClock() {
  var now = new Date();
  var timeStr =
    (now.getHours() < 10 ? '0' : '') + now.getHours() + ':' +
    (now.getMinutes() < 10 ? '0' : '') + now.getMinutes() + ':' +
    (now.getSeconds() < 10 ? '0' : '') + now.getSeconds();
  document.getElementById('clock').textContent = timeStr;
}
window.setInterval(updateClock, 1000);`;

const fadeOutFragment = `function startFadeOut() {
  var element = document.getElementById('fade-area');
  currentOpacity = 1.0;
  element.style.opacity = currentOpacity;
  fadeIntervalId = setInterval(function() {
    currentOpacity -= 0.02;
    if (currentOpacity <= 0) {
      currentOpacity = 0;
      clearInterval(fadeIntervalId);
    }
    element.style.opacity = currentOpacity;
  }, 50);
}`;

const tooltipFragment = `triggers[i].addEventListener('click', function(e) {
  e.stopPropagation();
  activeTrigger = this;
  var text = this.getAttribute('data-tooltip');
  tooltip.textContent = text;
  tooltip.classList.add('visible');

  var left = e.clientX + 12;
  var top = e.clientY + 12;
  if (left + tooltip.offsetWidth > window.innerWidth - 12)
    left = e.clientX - tooltip.offsetWidth - 12;
  if (top + tooltip.offsetHeight > window.innerHeight - 12)
    top = e.clientY - tooltip.offsetHeight - 12;

  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
});`;

const dragDropFragment = `function swapColumns(src, dest) {
  var rows = dragTable.rows;
  for (var r = 0; r < rows.length; r++) {
    var cellSrc = rows[r].cells[src];
    var cellDest = rows[r].cells[dest];
    if (src < dest) {
      rows[r].insertBefore(cellDest, cellSrc);
    } else {
      rows[r].insertBefore(cellSrc, cellDest);
    }
  }
}`;

const adBannerFragment = `function dismissAd() {
  localStorage.setItem(AD_STORAGE_KEY, String(Date.now()));
  checkAdVisibility();
}

function checkAdVisibility() {
  var banner = document.getElementById('ad-banner');
  var dismissedAt = localStorage.getItem(AD_STORAGE_KEY);
  if (dismissedAt) {
    var elapsed = Date.now() - parseInt(dismissedAt, 10);
    if (elapsed < 24 * 60 * 60 * 1000) {
      banner.classList.add('ad-hidden');
      return;
    }
  }
  banner.classList.remove('ad-hidden');
}`;

const notepadFragment = `function saveNote() {
  var text = document.getElementById('note-text').value;
  var notes = getNotes();
  if (currentNoteId !== null) {
    for (var i = 0; i < notes.length; i++) {
      if (notes[i].id === currentNoteId) {
        notes[i].text = text;
        break;
      }
    }
  } else {
    notes.unshift({ id: Date.now(), created: Date.now(), text: text });
    currentNoteId = notes[0].id;
  }
  setNotes(notes);
  renderNotesList();
}`;

// ─── TITLE PAGE ─────────────────────────────────────────────────────

const titlePageParagraphs = [
  centeredParagraph(titleRun("Міністерство освіти і науки України")),
  centeredParagraph(titleRun("Харківський національний університет радіоелектроніки")),
  emptyLine(),
  centeredParagraph(titleRun("Кафедра програмної інженерії")),
  emptyLine(), emptyLine(), emptyLine(), emptyLine(),
  centeredParagraph(titleRun("ЗВІТ", { bold: true })),
  centeredParagraph(titleRun("з лабораторної роботи № 3")),
  centeredParagraph(titleRun("з дисципліни «Гіпертекст та гіпермедіа»")),
  centeredParagraph(titleRun("на тему: «Динамічний HTML. Форми. Основи JavaScript»")),
  emptyLine(), emptyLine(),
  centeredParagraph(titleRun("Варіант 9")),
  emptyLine(),
  new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 0, line: LINE_SPACING_15, lineRule: "auto" },
    children: [titleRun("Виконав: ст. гр. ПЗПІ-25-6")],
  }),
  new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 0, line: LINE_SPACING_15, lineRule: "auto" },
    children: [titleRun("Коновалов О. О.")],
  }),
  emptyLine(),
  new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 0, line: LINE_SPACING_15, lineRule: "auto" },
    children: [titleRun("Перевірив: Зибіна К. В.")],
  }),
  emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(),
  centeredParagraph(titleRun("Харків — 2026")),
];

// ─── BODY ───────────────────────────────────────────────────────────

const bodyParagraphs = [
  // Body starts on new page (after title)
  new Paragraph({ children: [new PageBreak()] }),

  // Section 1
  sectionHeading("1", "Мета роботи"),
  bodyParagraph("Вивчити основи мови JavaScript для створення динамічних веб-сторінок. Навчитися працювати з DOM-деревом, подіями, таймерами, стилями елементів, а також з localStorage для збереження даних між сесіями браузера."),

  // Section 2
  sectionHeading("2", "Завдання"),
  bodyParagraph("Розробити інтерактивний веб-сайт «Ботанічний довідник» (варіант 9) з використанням JavaScript. Реалізувати три блоки завдань різного рівня складності:"),
  bodyParagraph("Блок 1 (оцінка 3): створити функцію зміни розміру шрифту; реалізувати розташування зображень у випадкових місцях через setInterval; використати getElementsByTagName та setAttribute для зміни стилів абзаців; створити текстовий годинник через setInterval; реалізувати ефект поступового затухання (fade-out)."),
  bodyParagraph("Блок 2 (оцінка 4): реалізувати спливаючу підказку (tooltip) з автопозиціюванням; перетягування колонок таблиці через HTML5 Drag and Drop API; зміну кольору квадрата зі списку; відображення координат миші та коду клавіші."),
  bodyParagraph("Блок 3 (оцінка 5): реалізувати рекламний банер із приховуванням на 24 години через localStorage; блокнот зі збереженням записів у localStorage."),

  // Section 3
  sectionHeading("3", "Хід роботи"),

  // 3.1 Block 1
  subsectionHeading("3.1", "Блок 1 — Основи JavaScript"),

  bodyParagraph("Для реалізації блоку 1 створено сторінку demos.html та скрипт js/demos.js з п'ятьма завданнями на основи роботи з DOM та таймерами."),

  bodyParagraph("Завдання 1 — функція зміни розміру шрифту. Створено функцію showText(text, size), яка приймає текстовий рядок та розмір шрифту в пікселях. Функція створює елемент span через document.createElement, встановлює його textContent та style.fontSize, після чого додає до контейнера виводу."),
  listingCaption("3.1", "Функція showText — створення елемента з заданим розміром шрифту"),
  ...codeBlock(showTextFragment),

  bodyParagraph("Завдання 2 — зображення у випадковому місці. Використано setInterval для виклику функції placeRandomImage кожну секунду. Функція створює елемент img та встановлює style.top і style.left у випадкові значення в межах контейнера за допомогою Math.random та offsetWidth/offsetHeight."),
  listingCaption("3.2", "Розташування зображення у випадковому місці через setInterval"),
  ...codeBlock(randomImageFragment),

  bodyParagraph("Завдання 3 — getElementsByTagName та setAttribute. За допомогою document.getElementsByTagName('p') знайдено всі абзаци на сторінці. Для кожного елемента зберігається оригінальний стиль, а потім через setAttribute('style', ...) додається font-size: 15px."),
  listingCaption("3.3", "Зміна стилів абзаців через getElementsByTagName та setAttribute"),
  ...codeBlock(changeParagraphsFragment),

  bodyParagraph("Завдання 4 — текстовий годинник. Створено функцію updateClock, що зчитує поточний час через new Date та оновлює textContent елемента. Функція запускається через window.setInterval кожну секунду."),
  listingCaption("3.4", "Текстовий годинник через setInterval"),
  ...codeBlock(clockFragment),

  bodyParagraph("Завдання 5 — ефект поступового затухання. Реалізовано плавне зникнення блоку через поступове зменшення opacity з 1.0 до 0 за допомогою setInterval з кроком 0.02 кожні 50 мс."),
  listingCaption("3.5", "Ефект fade-out через зміну opacity"),
  ...codeBlock(fadeOutFragment),

  // 3.2 Block 2
  subsectionHeading("3.2", "Блок 2 — Інтерактивні завдання"),

  bodyParagraph("Для реалізації блоку 2 створено сторінку interactive.html та скрипт js/interactive.js з чотирма завданнями на обробку подій та інтерактивність."),

  bodyParagraph("Завдання 1 — спливаюча підказка (tooltip). Реалізовано tooltip, що з'являється при кліку на виділене слово. Підказка автоматично позиціюється з урахуванням меж вікна браузера через перевірку clientX, clientY та offsetWidth, offsetHeight елемента."),
  listingCaption("3.6", "Спливаюча підказка з автопозиціюванням"),
  ...codeBlock(tooltipFragment),

  bodyParagraph("Завдання 2 — перетягування колонок таблиці. За допомогою HTML5 Drag and Drop API реалізовано можливість перетягувати заголовки таблиці для зміни порядку колонок. Функція swapColumns проходить усі рядки таблиці та використовує insertBefore для переміщення комірок."),
  listingCaption("3.7", "Функція обміну колонок таблиці"),
  ...codeBlock(dragDropFragment),

  bodyParagraph("Завдання 3 — зміна кольору квадрата зі списку. Зліва розміщено список із п'яти тематичних кольорів, справа — квадрат. При кліку на елемент списку зчитується data-color через getAttribute та змінюється style.backgroundColor квадрата."),

  bodyParagraph("Завдання 4 — координати миші та код клавіші. Через обробники подій mousemove та keydown відображаються поточні координати курсора (clientX, clientY) та інформація про натиснуту клавішу (key, keyCode) у реальному часі."),

  // 3.3 Block 3
  subsectionHeading("3.3", "Блок 3 — Розширені завдання"),

  bodyParagraph("Для реалізації блоку 3 створено сторінку advanced.html та скрипт js/advanced.js з двома завданнями, що використовують localStorage для збереження стану між сесіями."),

  bodyParagraph("Завдання 1 — рекламний банер із приховуванням. Реалізовано банер, який можна приховати на 24 години натисканням кнопки. Час приховування зберігається в localStorage через setItem. При повторному відвідуванні функція checkAdVisibility перевіряє, чи минула доба, та показує або ховає банер."),
  listingCaption("3.8", "Рекламний банер із збереженням стану в localStorage"),
  ...codeBlock(adBannerFragment),

  bodyParagraph("Завдання 2 — блокнот із збереженням. Реалізовано блокнот, де можна створювати, переглядати, редагувати та видаляти записи. Записи зберігаються в localStorage як JSON-масив. Зліва відображаються посилання з датою створення кожного запису."),
  listingCaption("3.9", "Збереження та оновлення записів блокнота"),
  ...codeBlock(notepadFragment),

  // Section 4 — new page
  sectionHeading("4", "Результати", { pageBreakBefore: true }),
  bodyParagraph("В результаті виконання лабораторної роботи розроблено інтерактивний веб-сайт «Ботанічний довідник», що складається з шести сторінок: index.html (головна), plants.html (каталог рослин), contact.html (контакти), demos.html (блок 1), interactive.html (блок 2), advanced.html (блок 3)."),
  bodyParagraph("Усі одинадцять завдань з трьох блоків реалізовано та інтегровано в єдиний дизайн сайту. JavaScript-скрипти демонструють роботу з DOM-деревом, подіями, таймерами, HTML5 Drag and Drop API та localStorage."),

  // Section 5 — new page
  sectionHeading("5", "Висновки", { pageBreakBefore: true }),
  bodyParagraph("У ході лабораторної роботи було вивчено основи мови JavaScript для створення динамічних веб-сторінок. Реалізовано 11 завдань з трьох блоків складності."),
  bodyParagraph("У блоці 1 освоєно роботу з DOM-елементами через createElement, getElementsByTagName, setAttribute, використання таймерів setInterval та setTimeout, динамічну зміну стилів через style.fontSize, style.opacity, style.top, style.left."),
  bodyParagraph("У блоці 2 реалізовано інтерактивні елементи: tooltip з автопозиціюванням, drag-and-drop колонок таблиці через HTML5 Drag API, зміну кольору елемента зі списку, відображення координат миші та кодів клавіш у реальному часі."),
  bodyParagraph("У блоці 3 реалізовано роботу з localStorage для збереження стану між сесіями: рекламний банер із приховуванням на 24 години та блокнот із можливістю створення, перегляду, редагування та видалення записів."),
  bodyParagraph("Усі завдання інтегровані в тематику «Ботанічний довідник» (варіант 9) та оформлені в єдиному дизайні із існуючими сторінками сайту."),

  // Control questions — new page
  sectionHeading("6", "Відповіді на контрольні запитання", { pageBreakBefore: true }),

  ...controlQuestion(1, "Що таке DOM? Для чого потрібен DOM?",
    "DOM (Document Object Model) — це програмний інтерфейс для HTML- і XML-документів, що представляє документ як дерево вузлів. Кожен елемент, атрибут і текстовий фрагмент є вузлом цього дерева. DOM потрібен для того, щоб програми та скрипти могли динамічно звертатися до вмісту, структури та стилю документа, змінювати їх. Завдяки DOM JavaScript може додавати, видаляти або модифікувати елементи сторінки без її перезавантаження."),

  ...controlQuestion(3, "З якою метою розроблена мова JavaScript?",
    "JavaScript була розроблена у 1995 році Бренданом Айком у компанії Netscape з метою додати інтерактивність до статичних веб-сторінок. Початкова мета — надати веб-розробникам можливість створювати динамічний контент, валідувати форми на клієнтській стороні, реагувати на дії користувача (кліки, наведення, натискання клавіш) та змінювати вміст сторінки без звернення до сервера."),

  ...controlQuestion(5, "Які типи даних характерні для JavaScript?",
    "JavaScript має примітивні типи: Number (числа), String (рядки), Boolean (true/false), undefined, null, Symbol (ES6), BigInt (ES2020); та об'єктний тип Object (об'єкти, масиви, функції, дати тощо). JavaScript є мовою з динамічною типізацією — тип змінної визначається під час виконання."),

  ...controlQuestion(7, "Які базові події підтримуються в JavaScript?",
    "Базові події JavaScript: події миші — click, dblclick, mousedown, mouseup, mousemove, mouseenter, mouseleave; події клавіатури — keydown, keyup, keypress; події фокусу — focus, blur; події форм — submit, reset, change, input; події документа — DOMContentLoaded, load, unload, resize, scroll; події перетягування — dragstart, drag, dragover, drop, dragend; події торкання — touchstart, touchmove, touchend."),

  ...controlQuestion(9, "Як підключити бібліотеку скриптів?",
    "Існує кілька способів підключення JavaScript до HTML-документа: зовнішній файл через <script src=\"path/to/script.js\"></script>; вбудований скрипт через <script>код</script>; inline-обробники через атрибути onclick тощо; з атрибутами defer (виконання після парсингу HTML) та async (виконання одразу після завантаження); модулі ES6 через <script type=\"module\" src=\"...\"></script>."),

  ...controlQuestion(11, "Назвіть різницю між методами GET і POST.",
    "GET передає дані через URL-рядок (query string), має обмеження на довжину (~2048 символів), дані видимі в адресній стрічці, кешується браузером, підходить для запитів на отримання даних, є ідемпотентним. POST передає дані в тілі HTTP-запиту, не має практичного обмеження на обсяг, дані не відображаються в URL, не кешується за замовчуванням, підходить для відправки форм і зміни даних на сервері."),

  ...controlQuestion(13, "Чому функції в JS називають об'єктами першого класу?",
    "Функції в JavaScript є об'єктами першого класу (First-class Objects), тому що мають усі можливості звичайних об'єктів: їх можна присвоювати змінним, передавати як аргументи іншим функціям (callback), повертати з функцій, зберігати в масивах та об'єктах, мати власні властивості та методи. Це робить можливим функціональне програмування, створення замикань (closures) та каррінг."),

  ...controlQuestion(15, "Як в JS викликати функцію?",
    "Функцію в JavaScript можна викликати кількома способами: прямий виклик myFunction(arg1, arg2); як метод об'єкта obj.method(); через call — func.call(thisArg, arg1, arg2); через apply — func.apply(thisArg, [args]); через bind — var bound = func.bind(thisArg); як конструктор — new MyClass(); через IIFE — (function() { ... })()."),

  ...controlQuestion(17, "Навіщо в JavaScript перед змінною писати var?",
    "Ключове слово var використовується для оголошення змінної з областю видимості функції (function scope). Без var змінна стає глобальною (властивістю window), що може призвести до конфліктів імен та помилок. Var забезпечує обмеження області видимості функцією, hoisting (підняття оголошення на початок функції), запобігання забрудненню глобального простору імен. У сучасному JS (ES6+) рекомендується використовувати let та const замість var."),

  ...controlQuestion(19, "Хто створив JavaScript і чому мова називається JavaScript?",
    "JavaScript створив Брендан Айк у 1995 році в компанії Netscape Communications. Мова була розроблена за 10 днів під назвою Mocha, потім перейменована на LiveScript. Назву JavaScript отримала завдяки маркетинговій угоді між Netscape та Sun Microsystems: Java була дуже популярною, і назва JavaScript мала асоціювати нову мову з Java. Насправді JavaScript і Java — це принципово різні мови з різною семантикою та типізацією."),
];

// ─── ДОДАТОК А ──────────────────────────────────────────────────────

const appendixParagraphs = [
  sectionHeading("", "Додаток А", { pageBreakBefore: true }),
  centeredParagraph(bodyRun("Вихідний код програми", { bold: true })),
  emptyLine(),
];

const sourceFiles = readSourceFiles();
let listingCounter = 1;
for (const file of sourceFiles) {
  const num = `А.${listingCounter}`;
  appendixParagraphs.push(listingCaption(num, file.name));
  appendixParagraphs.push(...codeBlock(file.content.trimEnd()));
  appendixParagraphs.push(emptyLine());
  listingCounter++;
}

// ─── DOCUMENT ───────────────────────────────────────────────────────

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: FONT, size: BODY_SIZE, language: { value: "uk-UA" } },
        paragraph: { spacing: { after: 0, line: LINE_SPACING_15, lineRule: "auto" } },
      },
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: BODY_SIZE, bold: true, font: FONT },
        paragraph: { spacing: { before: 240, after: 120, line: LINE_SPACING_15, lineRule: "auto" }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: BODY_SIZE, bold: true, font: FONT },
        paragraph: { spacing: { before: 120, after: 60, line: LINE_SPACING_15, lineRule: "auto" }, outlineLevel: 1 },
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { ...margins, header: 708, footer: 708 },
      },
      titlePage: true,
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: BODY_SIZE })],
        })],
      }),
    },
    children: [...titlePageParagraphs, ...bodyParagraphs, ...appendixParagraphs],
  }],
});

const outputPath = join(__dirname, "Звіт_ЛР3_Коновалов_ПЗПІ-25-6.docx");
const buffer = await Packer.toBuffer(doc);
writeFileSync(outputPath, buffer);
console.log(`Created: ${outputPath}`);
