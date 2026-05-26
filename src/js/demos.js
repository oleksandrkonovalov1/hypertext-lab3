/* ============================================================
   demos.js — Блок 1: Основи JavaScript
   ЛР3 «Dynamic HTML. Форми. Основи JavaScript»
   Ботанічний довідник, варіант 9
   ============================================================ */

// =====================================================
// Завдання 1: Функція з різними розмірами шрифту
// Використовує style.fontSize
// =====================================================

/**
 * Виводить текст із заданим розміром шрифту у вказаний контейнер.
 * @param {string} text — текст для відображення
 * @param {number} size — розмір шрифту в пікселях
 */
function showText(text, size) {
  var output = document.getElementById('font-output');
  var span = document.createElement('span');
  span.textContent = text;
  span.style.fontSize = size + 'px';
  span.title = size + 'px';
  output.appendChild(span);
}

/** Обробник кнопки «Показати» */
function handleShowText() {
  var textInput = document.getElementById('task1-text');
  var sizeInput = document.getElementById('task1-size');
  var text = textInput.value || 'Ботаніка';
  var size = parseInt(sizeInput.value, 10) || 24;
  showText(text, size);
}

/** Показати приклади всіх розмірів */
function showAllSizes() {
  var output = document.getElementById('font-output');
  // Clear previous content safely
  while (output.firstChild) {
    output.removeChild(output.firstChild);
  }
  var plants = ['Соняшник', 'Троянда', 'Дуб', 'Ромашка', 'М\'ята', 'Валеріана'];
  var sizes = [12, 16, 20, 26, 32, 40];
  for (var i = 0; i < plants.length; i++) {
    showText(plants[i], sizes[i]);
  }
}


// =====================================================
// Завдання 2: Зображення у випадковому місці
// Використовує style.top, style.left, setInterval
// =====================================================

var imageIntervalId = null;
var imageRunning = false;

/** Створює маленьке зображення у випадковому місці */
function placeRandomImage() {
  var area = document.getElementById('image-area');
  var areaWidth = area.offsetWidth;
  var areaHeight = area.offsetHeight;

  var img = document.createElement('img');
  // Маленьке зображення квітки
  img.src = 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=80&h=80&fit=crop';
  img.alt = 'Квітка';
  img.style.left = Math.floor(Math.random() * (areaWidth - 50)) + 'px';
  img.style.top = Math.floor(Math.random() * (areaHeight - 50)) + 'px';

  area.appendChild(img);

  // Обмежуємо кількість зображень на екрані
  var images = area.getElementsByTagName('img');
  if (images.length > 15) {
    area.removeChild(images[0]);
  }
}

/** Запустити / зупинити анімацію */
function toggleImageAnimation() {
  var btn = document.getElementById('btn-start-images');
  if (imageRunning) {
    clearInterval(imageIntervalId);
    imageIntervalId = null;
    imageRunning = false;
    btn.textContent = 'Запустити';
  } else {
    placeRandomImage(); // показати одразу
    imageIntervalId = setInterval(placeRandomImage, 1000);
    imageRunning = true;
    btn.textContent = 'Зупинити';
  }
}

/** Очистити область від зображень */
function clearImages() {
  if (imageIntervalId) {
    clearInterval(imageIntervalId);
    imageIntervalId = null;
    imageRunning = false;
    var btn = document.getElementById('btn-start-images');
    btn.textContent = 'Запустити';
  }
  var area = document.getElementById('image-area');
  while (area.firstChild) {
    area.removeChild(area.firstChild);
  }
}


// =====================================================
// Завдання 3: getElementsByTagName + setAttribute
// Знаходимо всі <p> та змінюємо fontSize на 15px
// =====================================================

var originalStyles = [];

/** Змінити шрифт усіх абзаців на 15px */
function changeParagraphs() {
  var paragraphs = document.getElementsByTagName('p');
  originalStyles = [];

  for (var i = 0; i < paragraphs.length; i++) {
    // Зберігаємо оригінальний стиль
    originalStyles.push(paragraphs[i].getAttribute('style') || '');
    // Використовуємо setAttribute для зміни стилю
    var currentStyle = paragraphs[i].getAttribute('style') || '';
    paragraphs[i].setAttribute('style', currentStyle + '; font-size: 15px;');
  }

  var output = document.getElementById('task3-output');
  // Clear and rebuild output safely
  while (output.firstChild) {
    output.removeChild(output.firstChild);
  }
  var resultP = document.createElement('p');
  resultP.style.fontSize = '15px';
  resultP.style.color = '#1b5e20';
  var strong = document.createElement('strong');
  strong.textContent = 'Готово!';
  resultP.appendChild(strong);
  resultP.appendChild(document.createTextNode(' Змінено ' + paragraphs.length + ' абзаців. Всі елементи <p> тепер мають font-size: 15px.'));
  output.appendChild(resultP);
}

/** Скинути стилі абзаців */
function resetParagraphs() {
  var paragraphs = document.getElementsByTagName('p');

  for (var i = 0; i < paragraphs.length; i++) {
    if (i < originalStyles.length) {
      if (originalStyles[i]) {
        paragraphs[i].setAttribute('style', originalStyles[i]);
      } else {
        paragraphs[i].removeAttribute('style');
      }
    }
  }

  var output = document.getElementById('task3-output');
  while (output.firstChild) {
    output.removeChild(output.firstChild);
  }
  var p = document.createElement('p');
  p.textContent = 'Стилі відновлено до початкових значень.';
  output.appendChild(p);
}


// =====================================================
// Завдання 4: Текстовий годинник
// Використовує setInterval об'єкта window
// =====================================================

/** Оновлює відображення годинника */
function updateClock() {
  var now = new Date();

  var hours = now.getHours();
  var minutes = now.getMinutes();
  var seconds = now.getSeconds();

  // Додаємо провідні нулі
  var timeStr =
    (hours < 10 ? '0' : '') + hours + ':' +
    (minutes < 10 ? '0' : '') + minutes + ':' +
    (seconds < 10 ? '0' : '') + seconds;

  var clockEl = document.getElementById('clock');
  if (clockEl) {
    clockEl.textContent = timeStr;
  }

  // Дата
  var days = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'];
  var months = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
                'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];

  var dateStr = days[now.getDay()] + ', ' +
                now.getDate() + ' ' +
                months[now.getMonth()] + ' ' +
                now.getFullYear() + ' р.';

  var dateEl = document.getElementById('clock-date');
  if (dateEl) {
    dateEl.textContent = dateStr;
  }
}

// Запускаємо годинник при завантаженні сторінки
window.addEventListener('DOMContentLoaded', function() {
  updateClock();
  window.setInterval(updateClock, 1000);
});


// =====================================================
// Завдання 5: Ефект поступового затухання (fade-out)
// Використовує таймер для зміни opacity
// =====================================================

var fadeIntervalId = null;
var currentOpacity = 1.0;

/** Запустити ефект затухання */
function startFadeOut() {
  var element = document.getElementById('fade-area');
  // Скинути, якщо вже йде анімація
  if (fadeIntervalId) {
    clearInterval(fadeIntervalId);
  }

  currentOpacity = 1.0;
  element.style.opacity = currentOpacity;

  fadeIntervalId = setInterval(function() {
    currentOpacity -= 0.02;
    if (currentOpacity <= 0) {
      currentOpacity = 0;
      clearInterval(fadeIntervalId);
      fadeIntervalId = null;
    }
    element.style.opacity = currentOpacity;
  }, 50);
}

/** Відновити видимість елемента */
function resetFade() {
  if (fadeIntervalId) {
    clearInterval(fadeIntervalId);
    fadeIntervalId = null;
  }
  var element = document.getElementById('fade-area');
  currentOpacity = 1.0;
  element.style.opacity = 1;
}
