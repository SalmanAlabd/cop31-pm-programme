'use strict';
(() => {
  const meetings = Array.from(document.querySelectorAll('.meeting'));
  const entries = Array.from(document.querySelectorAll('.schedule-entry'));
  const search = document.getElementById('meeting-search');
  const status = document.getElementById('search-status');
  const expandButton = document.getElementById('expand-all');
  const dayButtons = Array.from(document.querySelectorAll('.day-button'));
  const empty = document.getElementById('empty-result');
  let day = 'all';
  let expand = false;
  let printSnapshot = null;
  const normalize = value => value.normalize('NFKC').replace(/[\u064B-\u065F\u0670]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').toLowerCase().trim();
  const applySearch = () => {
    const query = normalize(search.value);
    let count = 0;
    meetings.forEach(meeting => {
      const match = normalize(meeting.textContent).includes(query);
      meeting.hidden = !match;
      if (match) count += 1;
      if (query && match) meeting.open = true;
    });
    status.textContent = query ? `اللقاءات المطابقة: ${count} من ${meetings.length}` : `عدد بنود اللقاءات: ${meetings.length}`;
    empty.hidden = count !== 0;
  };
  const setDay = selected => {
    day = selected;
    dayButtons.forEach(button => {
      const active = button.dataset.day === day;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    entries.forEach(entry => { entry.hidden = day !== 'all' && entry.dataset.day !== day; });
  };
  dayButtons.forEach(button => button.addEventListener('click', () => setDay(button.dataset.day)));
  search.addEventListener('input', applySearch);
  document.getElementById('clear-search').addEventListener('click', () => {
    search.value = '';
    meetings.forEach(meeting => { meeting.open = expand; });
    applySearch();
    search.focus();
  });
  expandButton.addEventListener('click', () => {
    expand = !expand;
    meetings.forEach(meeting => { if (!meeting.hidden) meeting.open = expand; });
    expandButton.textContent = expand ? 'طي جميع التفاصيل' : 'إظهار جميع التفاصيل';
    expandButton.setAttribute('aria-pressed', String(expand));
  });
  const beforePrint = () => {
    if (printSnapshot) return;
    printSnapshot = {
      details: Array.from(document.querySelectorAll('details')).map(element => [element, element.open]),
      hidden: [...meetings, ...entries].map(element => [element, element.hidden]),
      empty: empty.hidden
    };
    document.querySelectorAll('details').forEach(element => { element.open = true; });
    [...meetings, ...entries].forEach(element => { element.hidden = false; });
    empty.hidden = true;
  };
  const afterPrint = () => {
    if (!printSnapshot) return;
    printSnapshot.details.forEach(([element, open]) => { element.open = open; });
    printSnapshot.hidden.forEach(([element, hidden]) => { element.hidden = hidden; });
    empty.hidden = printSnapshot.empty;
    printSnapshot = null;
  };
  window.addEventListener('beforeprint', beforePrint);
  window.addEventListener('afterprint', afterPrint);
  document.getElementById('print-button').addEventListener('click', () => { beforePrint(); window.print(); });
  const links = Array.from(document.querySelectorAll('[data-section]'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(records => {
      const visible = records.filter(record => record.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length) {
        links.forEach(link => { link.setAttribute('aria-current', String(link.dataset.section === visible[0].target.id)); });
      }
    }, {rootMargin: '-5% 0px -55% 0px', threshold: [0,0.2,0.5]});
    document.querySelectorAll('.document-section').forEach(section => observer.observe(section));
  }
  applySearch();
  setDay('all');
})();
