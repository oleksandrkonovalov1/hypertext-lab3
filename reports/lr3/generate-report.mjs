/**
 * generate-report.mjs
 * Генерація DOCX-звіту для ЛР3 «Dynamic HTML. Форми. Основи JavaScript»
 * Ботанічний довідник, варіант 9
 */

import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, TabStopPosition, TabStopType,
  BorderStyle, Table, TableRow, TableCell,
  WidthType, ShadingType, PageBreak
} from 'docx';
import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, '..', '..', 'src');

// ── Helpers ──────────────────────────────────────────
function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 240, after: 120 },
  });
}

function para(text, opts = {}) {
  const runs = Array.isArray(text)
    ? text
    : [new TextRun({ text, size: 28, font: 'Times New Roman', ...opts })];
  return new Paragraph({
    children: runs,
    spacing: { after: 100 },
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
  });
}

function bold(text) {
  return new TextRun({ text, bold: true, size: 28, font: 'Times New Roman' });
}

function normal(text) {
  return new TextRun({ text, size: 28, font: 'Times New Roman' });
}

function code(text) {
  return new TextRun({ text, font: 'Courier New', size: 22 });
}

function codeBlock(content) {
  const lines = content.split('\n');
  return lines.map(line =>
    new Paragraph({
      children: [new TextRun({ text: line, font: 'Courier New', size: 20 })],
      spacing: { after: 0 },
    })
  );
}

function readSrc(filename) {
  return readFileSync(join(SRC, filename), 'utf-8');
}

function emptyLine() {
  return new Paragraph({ text: '', spacing: { after: 100 } });
}

function pageBreak() {
  return new Paragraph({
    children: [new TextRun({ break: 1 })],
    pageBreakBefore: true,
  });
}

// ── Title page ───────────────────────────────────────
function titlePage() {
  const center = AlignmentType.CENTER;
  return [
    new Paragraph({
      alignment: center,
      spacing: { before: 0, after: 60 },
      children: [new TextRun({ text: 'ХАРКІВСЬКИЙ НАЦІОНАЛЬНИЙ УНІВЕРСИТЕТ РАДІОЕЛЕКТРОНІКИ', size: 24, font: 'Times New Roman', bold: true })],
    }),
    new Paragraph({
      alignment: center,
      spacing: { after: 60 },
      children: [new TextRun({ text: 'Кафедра програмної інженерії', size: 24, font: 'Times New Roman' })],
    }),
    emptyLine(), emptyLine(), emptyLine(), emptyLine(),
    new Paragraph({
      alignment: center,
      spacing: { after: 60 },
      children: [new TextRun({ text: 'ЗВІТ', size: 32, font: 'Times New Roman', bold: true })],
    }),
    new Paragraph({
      alignment: center,
      spacing: { after: 60 },
      children: [new TextRun({ text: 'з лабораторної роботи №3', size: 28, font: 'Times New Roman', bold: true })],
    }),
    new Paragraph({
      alignment: center,
      spacing: { after: 60 },
      children: [new TextRun({ text: 'з дисципліни «Гіпертекст та гіпермедіа»', size: 28, font: 'Times New Roman' })],
    }),
    new Paragraph({
      alignment: center,
      spacing: { after: 60 },
      children: [new TextRun({ text: 'Тема: «Dynamic HTML. Форми. Основи JavaScript»', size: 28, font: 'Times New Roman' })],
    }),
    new Paragraph({
      alignment: center,
      spacing: { after: 60 },
      children: [new TextRun({ text: 'Варіант 9 — «Ботанічний довідник»', size: 28, font: 'Times New Roman' })],
    }),
    emptyLine(), emptyLine(), emptyLine(), emptyLine(),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: 'Виконав: ', size: 28, font: 'Times New Roman' }),
        new TextRun({ text: 'ст. гр. ПЗПІ-25-6 Коновалов О.О.', size: 28, font: 'Times New Roman', bold: true }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: 'Перевірив: ', size: 28, font: 'Times New Roman' }),
        new TextRun({ text: 'викладач кафедри ПІ', size: 28, font: 'Times New Roman', bold: true }),
      ],
    }),
    emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(),
    new Paragraph({
      alignment: center,
      children: [new TextRun({ text: 'Харків 2026', size: 28, font: 'Times New Roman' })],
    }),
  ];
}

// ── Section 1: Theme and goal ────────────────────────
function section1() {
  return [
    pageBreak(),
    heading('1. Тема та мета роботи', HeadingLevel.HEADING_1),
    para([
      bold('Тема: '),
      normal('Dynamic HTML. Форми. Основи JavaScript.'),
    ]),
    para([
      bold('Мета: '),
      normal('Вивчити основи мови JavaScript для створення динамічних веб-сторінок. Навчитися працювати з DOM-деревом, подіями, таймерами, стилями елементів, а також з localStorage для збереження даних між сесіями браузера.'),
    ]),
    para([
      bold('Варіант: '),
      normal('9 — «Ботанічний довідник»'),
    ]),
  ];
}

// ── Section 2: Sequence of actions + code snippets ───
function section2() {
  const items = [];
  items.push(pageBreak());
  items.push(heading('2. Послідовність виконання роботи', HeadingLevel.HEADING_1));

  // Block 1
  items.push(heading('2.1. Блок 1 — Основи JavaScript (оцінка 3)', HeadingLevel.HEADING_2));
  items.push(para('Для реалізації блоку 1 створено сторінку demos.html та скрипт js/demos.js, що містять 5 обов\'язкових завдань.'));

  items.push(heading('Завдання 1. Функція зміни розміру шрифту', HeadingLevel.HEADING_3));
  items.push(para('Створено функцію showText(text, size), яка приймає два аргументи: текстовий рядок та розмір шрифту. Функція створює елемент <span>, встановлює його textContent та style.fontSize, після чого додає до контейнера виводу.'));
  items.push(...codeBlock(`function showText(text, size) {
  var output = document.getElementById('font-output');
  var span = document.createElement('span');
  span.textContent = text;
  span.style.fontSize = size + 'px';
  output.appendChild(span);
}`));
  items.push(emptyLine());

  items.push(heading('Завдання 2. Зображення у випадковому місці', HeadingLevel.HEADING_3));
  items.push(para('Використано setInterval для виклику функції placeRandomImage() кожну секунду. Функція створює елемент <img> та встановлює його style.top і style.left у випадкові значення в межах контейнера.'));
  items.push(...codeBlock(`function placeRandomImage() {
  var area = document.getElementById('image-area');
  var img = document.createElement('img');
  img.src = '...';
  img.style.left = Math.floor(Math.random() * (area.offsetWidth - 50)) + 'px';
  img.style.top = Math.floor(Math.random() * (area.offsetHeight - 50)) + 'px';
  area.appendChild(img);
}
imageIntervalId = setInterval(placeRandomImage, 1000);`));
  items.push(emptyLine());

  items.push(heading('Завдання 3. getElementsByTagName + setAttribute', HeadingLevel.HEADING_3));
  items.push(para('За допомогою document.getElementsByTagName("p") знайдено всі абзаци на сторінці. Для кожного елемента викликано setAttribute("style", ...) зі значенням font-size: 15px.'));
  items.push(...codeBlock(`function changeParagraphs() {
  var paragraphs = document.getElementsByTagName('p');
  for (var i = 0; i < paragraphs.length; i++) {
    var currentStyle = paragraphs[i].getAttribute('style') || '';
    paragraphs[i].setAttribute('style', currentStyle + '; font-size: 15px;');
  }
}`));
  items.push(emptyLine());

  items.push(heading('Завдання 4. Текстовий годинник', HeadingLevel.HEADING_3));
  items.push(para('Створено функцію updateClock(), що зчитує поточний час через new Date() та оновлює вміст елемента. Функція викликається через window.setInterval кожну секунду.'));
  items.push(...codeBlock(`function updateClock() {
  var now = new Date();
  var timeStr = (now.getHours() < 10 ? '0' : '') + now.getHours() + ':' +
                (now.getMinutes() < 10 ? '0' : '') + now.getMinutes() + ':' +
                (now.getSeconds() < 10 ? '0' : '') + now.getSeconds();
  document.getElementById('clock').textContent = timeStr;
}
window.setInterval(updateClock, 1000);`));
  items.push(emptyLine());

  items.push(heading('Завдання 5. Ефект поступового затухання', HeadingLevel.HEADING_3));
  items.push(para('Реалізовано плавне зникнення блоку через поступове зменшення opacity з 1.0 до 0 за допомогою setInterval з кроком 0.02 кожні 50 мс.'));
  items.push(...codeBlock(`function startFadeOut() {
  var element = document.getElementById('fade-area');
  currentOpacity = 1.0;
  fadeIntervalId = setInterval(function() {
    currentOpacity -= 0.02;
    if (currentOpacity <= 0) {
      currentOpacity = 0;
      clearInterval(fadeIntervalId);
    }
    element.style.opacity = currentOpacity;
  }, 50);
}`));
  items.push(emptyLine());

  // Block 2
  items.push(heading('2.2. Блок 2 — Інтерактивні завдання (оцінка 4)', HeadingLevel.HEADING_2));
  items.push(para('Для реалізації блоку 2 створено сторінку interactive.html та скрипт js/interactive.js з 4 завданнями.'));

  items.push(heading('Завдання 1. Спливаюча підказка (tooltip)', HeadingLevel.HEADING_3));
  items.push(para('Реалізовано tooltip, що з\'являється при кліку на виділене слово. Підказка автоматично позиціюється з урахуванням меж екрану. Клік в іншому місці ховає tooltip.'));

  items.push(heading('Завдання 2. Перетягування колонок таблиці', HeadingLevel.HEADING_3));
  items.push(para('За допомогою HTML5 Drag and Drop API реалізовано можливість перетягувати заголовки таблиці для зміни порядку колонок. Дані переміщуються разом із заголовками.'));

  items.push(heading('Завдання 3. Зміна кольору квадрата', HeadingLevel.HEADING_3));
  items.push(para('Зліва розміщено список із 5 кольорів (тематичних для ботаніки), справа — чорний квадрат. При кліку на елемент списку змінюється style.backgroundColor квадрата.'));

  items.push(heading('Завдання 4. Координати миші та код клавіші', HeadingLevel.HEADING_3));
  items.push(para('Через обробники подій mousemove та keydown відображаються поточні координати курсора (clientX, clientY) та інформація про натиснуту клавішу (key, keyCode).'));

  // Block 3
  items.push(heading('2.3. Блок 3 — Розширені завдання (оцінка 5)', HeadingLevel.HEADING_2));
  items.push(para('Для реалізації блоку 3 створено сторінку advanced.html та скрипт js/advanced.js з 2 завданнями.'));

  items.push(heading('Завдання 1. Рекламний банер з приховуванням', HeadingLevel.HEADING_3));
  items.push(para('Реалізовано рекламний банер, який можна приховати на 24 години. Час приховування зберігається в localStorage. При повторному відвідуванні сторінки перевіряється, чи минула доба.'));
  items.push(...codeBlock(`function dismissAd() {
  localStorage.setItem(AD_STORAGE_KEY, String(Date.now()));
  checkAdVisibility();
}

function checkAdVisibility() {
  var dismissedAt = localStorage.getItem(AD_STORAGE_KEY);
  if (dismissedAt) {
    var elapsed = Date.now() - parseInt(dismissedAt, 10);
    if (elapsed < 24 * 60 * 60 * 1000) {
      banner.classList.add('ad-hidden');
      return;
    }
  }
  banner.classList.remove('ad-hidden');
}`));
  items.push(emptyLine());

  items.push(heading('Завдання 2. Блокнот із збереженням', HeadingLevel.HEADING_3));
  items.push(para('Реалізовано блокнот, де можна створювати, переглядати, редагувати та видаляти записи. Записи зберігаються в localStorage як JSON-масив. Зліва відображаються посилання з датою створення запису.'));
  items.push(...codeBlock(`function saveNote() {
  var text = document.getElementById('note-text').value;
  var notes = getNotes();
  if (currentNoteId !== null) {
    // Оновлення існуючого запису
    for (var i = 0; i < notes.length; i++) {
      if (notes[i].id === currentNoteId) {
        notes[i].text = text;
        break;
      }
    }
  } else {
    // Створення нового запису
    notes.unshift({ id: Date.now(), created: Date.now(), text: text });
  }
  setNotes(notes);
  renderNotesList();
}`));

  return items;
}

// ── Section 3: Site map + full code ──────────────────
function section3() {
  const items = [];
  items.push(pageBreak());
  items.push(heading('3. Карта сайту та лістинг коду', HeadingLevel.HEADING_1));

  items.push(heading('3.1. Карта сайту', HeadingLevel.HEADING_2));
  items.push(...codeBlock(`hypertext-lab3/src/
  index.html          <-- Головна сторінка (з ЛР1)
  plants.html         <-- Каталог рослин (з ЛР1)
  contact.html        <-- Контакти та медіа (з ЛР1)
  demos.html          <-- Блок 1: Основи JavaScript
  interactive.html    <-- Блок 2: Інтерактивні завдання
  advanced.html       <-- Блок 3: Розширені завдання
  style.css           <-- Стилі (розширені для ЛР3)
  js/
    demos.js          <-- Скрипти блоку 1
    interactive.js    <-- Скрипти блоку 2
    advanced.js       <-- Скрипти блоку 3
  media/
    nature-sounds.mp3
    botanical-garden.mp4
    botanical-garden.webm
    garden-poster.jpg`));

  // Code listings
  const files = [
    ['demos.html', '3.2'],
    ['interactive.html', '3.3'],
    ['advanced.html', '3.4'],
    ['js/demos.js', '3.5'],
    ['js/interactive.js', '3.6'],
    ['js/advanced.js', '3.7'],
    ['style.css', '3.8'],
  ];

  for (const [file, num] of files) {
    items.push(pageBreak());
    items.push(heading(`${num}. Лістинг ${file}`, HeadingLevel.HEADING_2));
    const content = readSrc(file);
    items.push(...codeBlock(content));
  }

  return items;
}

// ── Section 4: Screenshots placeholder ───────────────
function section4() {
  return [
    pageBreak(),
    heading('4. Знімки екранів у браузерах', HeadingLevel.HEADING_1),
    para('Знімки екранів додаються окремо після запуску сайту в браузерах Chrome та Firefox.'),
    para('[Скріншот 1: demos.html — Блок 1, завдання 1-5]'),
    para('[Скріншот 2: interactive.html — Блок 2, tooltip + drag]'),
    para('[Скріншот 3: interactive.html — Блок 2, колір + координати]'),
    para('[Скріншот 4: advanced.html — Блок 3, рекламний банер]'),
    para('[Скріншот 5: advanced.html — Блок 3, блокнот]'),
    para('[Скріншот 6: Головна сторінка з оновленою навігацією]'),
  ];
}

// ── Section 5: Conclusions ───────────────────────────
function section5() {
  return [
    pageBreak(),
    heading('5. Висновки', HeadingLevel.HEADING_1),
    para('У ході виконання лабораторної роботи №3 було вивчено основи мови JavaScript та її застосування для створення динамічних веб-сторінок. Реалізовано 11 завдань з трьох блоків складності:'),
    para([bold('Блок 1 (5 завдань): '), normal('освоєно роботу з DOM-елементами через createElement, getElementsByTagName, setAttribute; використання таймерів setInterval/setTimeout; динамічну зміну стилів через style.fontSize, style.opacity, style.top, style.left.')]),
    para([bold('Блок 2 (4 завдання): '), normal('реалізовано інтерактивні елементи: tooltip з автопозиціюванням, drag-and-drop колонок таблиці через HTML5 Drag API, зміна кольору елемента зі списку, відображення координат миші та кодів клавіш у реальному часі.')]),
    para([bold('Блок 3 (2 завдання): '), normal('реалізовано роботу з localStorage для збереження стану між сесіями: рекламний банер із приховуванням на 24 години та блокнот із можливістю створення, перегляду, редагування та видалення записів.')]),
    para('Усі завдання інтегровані в тематику «Ботанічний довідник» (варіант 9) та оформлені в єдиному дизайні із існуючими сторінками ЛР1.'),
  ];
}

// ── Section 6: Control questions (odd) ───────────────
function section6() {
  return [
    pageBreak(),
    heading('6. Відповіді на контрольні запитання (непарні)', HeadingLevel.HEADING_1),

    heading('1. Що таке DOM? Для чого потрібен DOM?', HeadingLevel.HEADING_3),
    para('DOM (Document Object Model) — це програмний інтерфейс для HTML- і XML-документів, що представляє документ як дерево вузлів (nodes). Кожен елемент, атрибут і текстовий фрагмент є вузлом цього дерева. DOM потрібен для того, щоб програми та скрипти могли динамічно звертатися до вмісту, структури та стилю документа, змінювати їх. Завдяки DOM JavaScript може додавати, видаляти або модифікувати елементи сторінки без її перезавантаження.'),

    heading('3. З якою метою розроблена мова JavaScript?', HeadingLevel.HEADING_3),
    para('JavaScript була розроблена у 1995 році Бренданом Айком (Brendan Eich) у компанії Netscape з метою додати інтерактивність до статичних веб-сторінок. Початкова мета — надати веб-розробникам можливість створювати динамічний контент, валідувати форми на клієнтській стороні, реагувати на дії користувача (кліки, наведення, натискання клавіш) та змінювати вміст сторінки без звернення до сервера.'),

    heading('5. Які типи даних характерні для JavaScript?', HeadingLevel.HEADING_3),
    para('JavaScript має наступні типи даних: примітивні — Number (числа, включаючи цілі та з плаваючою точкою), String (рядки), Boolean (true/false), undefined (невизначене значення), null (порожнє значення), Symbol (унікальний ідентифікатор, ES6), BigInt (великі цілі числа, ES2020); та об\'єктний тип — Object (об\'єкти, масиви, функції, дати тощо). JavaScript є мовою з динамічною типізацією — тип змінної визначається під час виконання.'),

    heading('7. Які базові події підтримуються в JavaScript?', HeadingLevel.HEADING_3),
    para('Базові події JavaScript поділяються на категорії: події миші — click, dblclick, mousedown, mouseup, mousemove, mouseenter, mouseleave, mouseover, mouseout; події клавіатури — keydown, keyup, keypress; події фокусу — focus, blur, focusin, focusout; події форм — submit, reset, change, input, select; події документа — DOMContentLoaded, load, unload, beforeunload, resize, scroll; події перетягування — dragstart, drag, dragover, dragenter, dragleave, drop, dragend; події торкання — touchstart, touchmove, touchend.'),

    heading('9. Як підключити бібліотеку скриптів?', HeadingLevel.HEADING_3),
    para('Існує кілька способів підключення JavaScript до HTML-документа: 1) Зовнішній файл: <script src="path/to/script.js"></script> — найпоширеніший спосіб, дозволяє кешувати скрипт. 2) Вбудований скрипт: <script>код...</script> — код розміщується безпосередньо в HTML. 3) Inline-обробники: <button onclick="..."> — не рекомендується. 4) Атрибути defer та async: <script src="..." defer></script> — defer завантажує скрипт паралельно, виконує після парсингу HTML; async — виконує одразу після завантаження. 5) Модулі ES6: <script type="module" src="..."></script>.'),

    heading('11. Назвіть різницю між методами GET і POST.', HeadingLevel.HEADING_3),
    para('GET передає дані через URL-рядок (query string), має обмеження на довжину (~2048 символів), дані видимі в адресній стрічці, кешується браузером, підходить для запитів на отримання даних, є ідемпотентним. POST передає дані в тілі HTTP-запиту, не має практичного обмеження на обсяг даних, дані не відображаються в URL, не кешується за замовчуванням, підходить для відправки форм і зміни даних на сервері, не є ідемпотентним.'),

    heading('13. Чому функції в JS називають об\'єктами першого класу?', HeadingLevel.HEADING_3),
    para('Функції в JavaScript є об\'єктами першого класу (First-class Objects), тому що вони мають усі можливості звичайних об\'єктів: їх можна присвоювати змінним (var fn = function() {}); передавати як аргументи іншим функціям (callback); повертати з функцій; зберігати в масивах та об\'єктах; мати власні властивості та методи. Це робить можливим функціональне програмування, створення замикань (closures), каррінг та інші патерни.'),

    heading('15. Як в JS викликати функцію?', HeadingLevel.HEADING_3),
    para('Функцію в JavaScript можна викликати кількома способами: 1) Прямий виклик: myFunction(arg1, arg2). 2) Як метод об\'єкта: obj.method(). 3) Через call: func.call(thisArg, arg1, arg2). 4) Через apply: func.apply(thisArg, [arg1, arg2]). 5) Через bind: var bound = func.bind(thisArg); bound(). 6) Як конструктор: new MyClass(). 7) Через IIFE (Immediately Invoked Function Expression): (function() { ... })(). 8) За допомогою оператора розпакування: func(...args).'),

    heading('17. Навіщо в JavaScript перед змінною писати var?', HeadingLevel.HEADING_3),
    para('Ключове слово var використовується для оголошення змінної з областю видимості функції (function scope). Без var змінна стає глобальною (властивістю window), що може призвести до конфліктів імен та помилок. Var забезпечує: обмеження області видимості змінної функцією; hoisting (підняття оголошення на початок функції); запобігання забрудненню глобального простору імен. У сучасному JS (ES6+) рекомендується використовувати let (блочна область видимості) та const (незмінна змінна) замість var.'),

    heading('19. Хто створив JavaScript і чому мова називається JavaScript?', HeadingLevel.HEADING_3),
    para('JavaScript створив Брендан Айк (Brendan Eich) у 1995 році, працюючи в компанії Netscape Communications. Мова була розроблена за 10 днів під початковою назвою Mocha, потім перейменована на LiveScript. Назву JavaScript отримала завдяки маркетинговій угоді між Netscape та Sun Microsystems: на той час Java була дуже популярною, і назва JavaScript мала асоціювати нову мову з Java для залучення розробників. Насправді JavaScript і Java — це принципово різні мови з різною семантикою, типізацією та областями застосування.'),
  ];
}

// ── Build document ───────────────────────────────────
async function main() {
  const doc = new Document({
    creator: 'Коновалов О.О.',
    title: 'Звіт ЛР3 — Dynamic HTML, JavaScript',
    description: 'Звіт з лабораторної роботи №3 з дисципліни Гіпертекст та гіпермедіа',
    styles: {
      default: {
        document: {
          run: { size: 28, font: 'Times New Roman' },
          paragraph: { spacing: { line: 276 } },
        },
        heading1: {
          run: { size: 32, bold: true, font: 'Times New Roman', color: '1b5e20' },
        },
        heading2: {
          run: { size: 30, bold: true, font: 'Times New Roman', color: '2e7d32' },
        },
        heading3: {
          run: { size: 28, bold: true, font: 'Times New Roman', color: '388e3c' },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, bottom: 1134, left: 1701, right: 850 },
          },
        },
        children: [
          ...titlePage(),
          ...section1(),
          ...section2(),
          ...section3(),
          ...section4(),
          ...section5(),
          ...section6(),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = join(__dirname, 'Звіт_ЛР3_Коновалов_ПЗПІ-25-6.docx');
  writeFileSync(outPath, buffer);
  console.log('Report generated:', outPath);
}

main().catch(err => {
  console.error('Error generating report:', err);
  process.exit(1);
});
