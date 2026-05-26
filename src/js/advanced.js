/* ============================================================
   advanced.js — Блок 3: Розширені JavaScript-завдання
   ЛР3 «Dynamic HTML. Форми. Основи JavaScript»
   Ботанічний довідник, варіант 9
   ============================================================ */

// =====================================================
// Завдання 1: Рекламний банер з приховуванням на 1 день
// Використовує localStorage для зберігання часу приховування
// =====================================================

var AD_STORAGE_KEY = 'botanical_ad_dismissed_at';
var AD_DURATION_MS = 24 * 60 * 60 * 1000; // 24 години в мілісекундах

/** Перевіряємо, чи треба показувати рекламу */
function checkAdVisibility() {
  var banner = document.getElementById('ad-banner');
  var status = document.getElementById('ad-status');
  var dismissedAt = localStorage.getItem(AD_STORAGE_KEY);

  if (dismissedAt) {
    var elapsed = Date.now() - parseInt(dismissedAt, 10);
    if (elapsed < AD_DURATION_MS) {
      // Ще не минула доба — ховаємо
      banner.classList.add('ad-hidden');
      var remaining = AD_DURATION_MS - elapsed;
      var hoursLeft = Math.floor(remaining / (1000 * 60 * 60));
      var minutesLeft = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      status.textContent = 'Реклама прихована. Залишилось: ' +
        hoursLeft + ' год. ' + minutesLeft + ' хв.';
      return;
    } else {
      // Час вийшов — показуємо знову
      localStorage.removeItem(AD_STORAGE_KEY);
    }
  }

  banner.classList.remove('ad-hidden');
  status.textContent = '';
}

/** Приховати рекламу на 24 години */
function dismissAd() {
  localStorage.setItem(AD_STORAGE_KEY, String(Date.now()));
  checkAdVisibility();
}

/** Скинути приховування (для демонстрації) */
function resetAd() {
  localStorage.removeItem(AD_STORAGE_KEY);
  checkAdVisibility();
}


// =====================================================
// Завдання 2: Блокнот з localStorage
// Записи відображаються як посилання з датою створення
// =====================================================

var NOTES_STORAGE_KEY = 'botanical_notepad_notes';
var currentNoteId = null;

/** Отримати всі записи з localStorage */
function getNotes() {
  var data = localStorage.getItem(NOTES_STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }
  return [];
}

/** Зберегти всі записи в localStorage */
function setNotes(notes) {
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

/** Форматування дати для відображення */
function formatDate(timestamp) {
  var d = new Date(timestamp);
  var day = d.getDate();
  var month = d.getMonth() + 1;
  var year = d.getFullYear();
  var hours = d.getHours();
  var minutes = d.getMinutes();

  return (day < 10 ? '0' : '') + day + '.' +
         (month < 10 ? '0' : '') + month + '.' +
         year + ' ' +
         (hours < 10 ? '0' : '') + hours + ':' +
         (minutes < 10 ? '0' : '') + minutes;
}

/** Відобразити список записів */
function renderNotesList() {
  var list = document.getElementById('notes-list');
  // Clear list safely
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  var notes = getNotes();

  if (notes.length === 0) {
    var emptyLi = document.createElement('li');
    emptyLi.style.color = '#999';
    emptyLi.style.fontSize = '0.85em';
    emptyLi.textContent = 'Немає записів';
    list.appendChild(emptyLi);
    return;
  }

  for (var i = 0; i < notes.length; i++) {
    (function(note) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#';
      a.textContent = formatDate(note.created);
      if (note.id === currentNoteId) {
        a.classList.add('active-note');
      }
      a.addEventListener('click', function(e) {
        e.preventDefault();
        loadNote(note.id);
      });
      li.appendChild(a);
      list.appendChild(li);
    })(notes[i]);
  }
}

/** Завантажити запис у текстове поле */
function loadNote(noteId) {
  var notes = getNotes();
  for (var i = 0; i < notes.length; i++) {
    if (notes[i].id === noteId) {
      currentNoteId = noteId;
      document.getElementById('note-text').value = notes[i].text;
      renderNotesList();
      return;
    }
  }
}

/** Зберегти поточний запис */
function saveNote() {
  var text = document.getElementById('note-text').value;
  if (!text.trim()) {
    alert('Введіть текст запису!');
    return;
  }

  var notes = getNotes();

  if (currentNoteId !== null) {
    // Оновлюємо існуючий запис
    for (var i = 0; i < notes.length; i++) {
      if (notes[i].id === currentNoteId) {
        notes[i].text = text;
        break;
      }
    }
  } else {
    // Створюємо новий запис
    var newNote = {
      id: Date.now(),
      created: Date.now(),
      text: text
    };
    notes.unshift(newNote); // Додаємо на початок
    currentNoteId = newNote.id;
  }

  setNotes(notes);
  renderNotesList();
}

/** Новий запис */
function newNote() {
  currentNoteId = null;
  document.getElementById('note-text').value = '';
  renderNotesList();
}

/** Видалити поточний запис */
function deleteNote() {
  if (currentNoteId === null) {
    alert('Оберіть запис для видалення!');
    return;
  }

  var notes = getNotes();
  var filtered = [];
  for (var i = 0; i < notes.length; i++) {
    if (notes[i].id !== currentNoteId) {
      filtered.push(notes[i]);
    }
  }
  setNotes(filtered);
  currentNoteId = null;
  document.getElementById('note-text').value = '';
  renderNotesList();
}

/** Очистити всі записи */
function clearAllNotes() {
  if (!confirm('Видалити всі записи?')) return;
  localStorage.removeItem(NOTES_STORAGE_KEY);
  currentNoteId = null;
  document.getElementById('note-text').value = '';
  renderNotesList();
}


// =====================================================
// Ініціалізація при завантаженні сторінки
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
  checkAdVisibility();
  renderNotesList();
});
