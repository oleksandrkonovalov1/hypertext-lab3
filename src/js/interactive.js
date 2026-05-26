/* ============================================================
   interactive.js — Блок 2: Інтерактивні JavaScript-завдання
   ЛР3 «Dynamic HTML. Форми. Основи JavaScript»
   Ботанічний довідник, варіант 9
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {

  // =====================================================
  // Завдання 1: Спливаюча підказка (tooltip)
  // Автопозиціювання, клік для показу, клік поза — ховається
  // =====================================================

  var tooltip = document.getElementById('custom-tooltip');
  var activeTrigger = null;

  // Обробник кліку на тригерах
  var triggers = document.querySelectorAll('.tooltip-trigger');
  for (var i = 0; i < triggers.length; i++) {
    triggers[i].addEventListener('click', function(e) {
      e.stopPropagation();

      // Якщо клікнули на той самий тригер — ховаємо
      if (activeTrigger === this) {
        hideTooltip();
        return;
      }

      activeTrigger = this;
      var text = this.getAttribute('data-tooltip');
      tooltip.textContent = text;
      tooltip.classList.add('visible');

      // Позиціювання: спочатку ставимо біля кліку
      var clickX = e.clientX;
      var clickY = e.clientY;

      // Тимчасово показуємо для вимірювання розмірів
      tooltip.style.left = '0px';
      tooltip.style.top = '0px';

      var tipW = tooltip.offsetWidth;
      var tipH = tooltip.offsetHeight;
      var winW = window.innerWidth;
      var winH = window.innerHeight;
      var margin = 12;

      // Обчислюємо позицію — не виходити за межі екрана
      var left = clickX + margin;
      var top = clickY + margin;

      // Якщо виходить за правий край
      if (left + tipW > winW - margin) {
        left = clickX - tipW - margin;
      }
      // Якщо виходить за нижній край
      if (top + tipH > winH - margin) {
        top = clickY - tipH - margin;
      }
      // Якщо виходить за лівий край
      if (left < margin) {
        left = margin;
      }
      // Якщо виходить за верхній край
      if (top < margin) {
        top = margin;
      }

      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
    });
  }

  function hideTooltip() {
    tooltip.classList.remove('visible');
    activeTrigger = null;
  }

  // Клік будь-де — ховає tooltip
  document.addEventListener('click', function(e) {
    if (e.target !== tooltip && !tooltip.contains(e.target)) {
      hideTooltip();
    }
  });


  // =====================================================
  // Завдання 2: Перетягування колонок таблиці
  // Drag-and-drop заголовків для зміни порядку колонок
  // =====================================================

  var dragTable = document.getElementById('drag-table');
  if (dragTable) {
    var dragSrcCol = null;

    var headers = dragTable.querySelectorAll('th');
    for (var h = 0; h < headers.length; h++) {
      headers[h].addEventListener('dragstart', handleDragStart);
      headers[h].addEventListener('dragover', handleDragOver);
      headers[h].addEventListener('dragenter', handleDragEnter);
      headers[h].addEventListener('dragleave', handleDragLeave);
      headers[h].addEventListener('drop', handleDrop);
      headers[h].addEventListener('dragend', handleDragEnd);
    }

    function handleDragStart(e) {
      dragSrcCol = getColumnIndex(this);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(dragSrcCol));
      // Помічаємо колонку
      markColumn(dragSrcCol, 'dragging', true);
    }

    function handleDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }

    function handleDragEnter(e) {
      e.preventDefault();
      this.classList.add('drag-over');
    }

    function handleDragLeave() {
      this.classList.remove('drag-over');
    }

    function handleDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.remove('drag-over');

      var destCol = getColumnIndex(this);
      if (dragSrcCol !== null && dragSrcCol !== destCol) {
        swapColumns(dragSrcCol, destCol);
      }
    }

    function handleDragEnd() {
      // Прибираємо маркери
      var allTh = dragTable.querySelectorAll('th');
      for (var i = 0; i < allTh.length; i++) {
        allTh[i].classList.remove('drag-over');
      }
      if (dragSrcCol !== null) {
        markColumn(dragSrcCol, 'dragging', false);
      }
      dragSrcCol = null;
    }

    function getColumnIndex(th) {
      var row = th.parentNode;
      var cells = row.children;
      for (var i = 0; i < cells.length; i++) {
        if (cells[i] === th) return i;
      }
      return -1;
    }

    function markColumn(colIndex, className, add) {
      var rows = dragTable.rows;
      for (var r = 0; r < rows.length; r++) {
        if (rows[r].cells[colIndex]) {
          if (add) {
            rows[r].cells[colIndex].classList.add(className);
          } else {
            rows[r].cells[colIndex].classList.remove(className);
          }
        }
      }
    }

    function swapColumns(src, dest) {
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
    }
  }


  // =====================================================
  // Завдання 3: Зміна кольору квадрата зі списку
  // Список кольорів зліва, квадрат справа
  // =====================================================

  var colorList = document.getElementById('color-list');
  var colorSquare = document.getElementById('color-square');

  if (colorList && colorSquare) {
    var colorItems = colorList.querySelectorAll('li');
    for (var c = 0; c < colorItems.length; c++) {
      colorItems[c].addEventListener('click', function() {
        // Прибираємо клас selected у всіх
        for (var j = 0; j < colorItems.length; j++) {
          colorItems[j].classList.remove('selected');
        }
        // Додаємо selected поточному
        this.classList.add('selected');
        // Змінюємо колір квадрата
        var color = this.getAttribute('data-color');
        colorSquare.style.backgroundColor = color;
      });
    }
  }


  // =====================================================
  // Завдання 4: Координати миші та код клавіші
  // Відображення в реальному часі
  // =====================================================

  var mouseXEl = document.getElementById('mouse-x');
  var mouseYEl = document.getElementById('mouse-y');
  var keyCodeEl = document.getElementById('key-code');
  var keyValueEl = document.getElementById('key-value');

  if (mouseXEl) {
    document.addEventListener('mousemove', function(e) {
      mouseXEl.textContent = e.clientX;
      mouseYEl.textContent = e.clientY;
    });

    document.addEventListener('keydown', function(e) {
      keyCodeEl.textContent = e.key;
      keyValueEl.textContent = e.keyCode || e.which;
    });
  }

});
