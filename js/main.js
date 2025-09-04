// =============== Utilities ===============
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const slug = s => s.toLowerCase().replace(/[^a-zA-Zа-яА-Я0-9]+/g, '-').replace(/(^-|-$)/g, '');
const imagePlaceholder = (title, w = 300, h = 450) => `https://dummyimage.com/${w}x${h}/171717/e5e5e5&text=${encodeURIComponent(title)}`;

// theme persistence
const Theme = {
  set(mode) {
    if (mode === 'light') document.documentElement.classList.remove('dark');
    else document.documentElement.classList.add('dark');
    localStorage.setItem('kinoflow:theme', mode);
    $('#themeLight')?.classList.toggle('active', mode === 'light');
    $('#themeDark')?.classList.toggle('active', mode !== 'light');
  },
  init() {
    const saved = localStorage.getItem('kinoflow:theme');
    this.set(saved || 'dark');
    $('#themeLight')?.addEventListener('click', () => this.set('light'));
    $('#themeDark')?.addEventListener('click', () => this.set('dark'));
  }
}

// watchlist in localStorage
const Watchlist = {
  key: 'kinoflow:watchlist',
  get() { try { return new Set(JSON.parse(localStorage.getItem(this.key) || '[]')); } catch { return new Set(); } },
  save(set) { localStorage.setItem(this.key, JSON.stringify([...set])); },
  toggle(id) { const s = this.get(); s.has(id) ? s.delete(id) : s.add(id); this.save(s); return s.has(id); },
  has(id) { return this.get().has(id); }
}

// sample trailer src
const SAMPLE_TRAILER = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

// =============== Data ===============
// NOTE: posters expected at `covers/<slug>.jpg`. Fallback will be used automatically.
const MOVIES = [
  { id: 'inception', title: 'Начало', original: 'Inception', year: 2010, duration: 148, rating: 8.8, genres: ['Фантастика','Триллер'], trend: 94, age: '16+', desc: 'Вор, который проникает в подсознание, получает шанс очистить имя, внедрив идею в чужой мозг.' },
  { id: 'interstellar', title: 'Интерстеллар', original: 'Interstellar', year: 2014, duration: 169, rating: 8.6, genres: ['Фантастика','Драма'], trend: 91, age: '12+', desc: 'Команда исследователей отправляется за пределы галактики в поисках нового дома для человечества.' },
  { id: 'matrix', title: 'Матрица', original: 'The Matrix', year: 1999, duration: 136, rating: 8.7, genres: ['Фантастика','Боевик'], trend: 86, age: '16+', desc: 'Хакер Нео узнаёт истину о мире и вступает в борьбу против машин.' },
  { id: 'mad-max-fury-road', title: 'Безумный Макс: Дорога ярости', original: 'Mad Max: Fury Road', year: 2015, duration: 120, rating: 8.1, genres: ['Боевик','Приключения'], trend: 84, age: '16+', desc: 'В пустоши Макс и Фуриоса спасают людей, бросая вызов тирану.' },
  { id: 'john-wick', title: 'Джон Уик', original: 'John Wick', year: 2014, duration: 101, rating: 7.4, genres: ['Боевик','Триллер'], trend: 78, age: '18+', desc: 'Бывший наёмный убийца возвращается в бизнес после трагедии.' },
  { id: 'parasite', title: 'Паразиты', original: 'Parasite', year: 2019, duration: 132, rating: 8.5, genres: ['Драма','Триллер'], trend: 83, age: '18+', desc: 'Семья бедняков внедряется в дом богачей, что приводит к непредсказуемым последствиям.' },
  { id: 'spirited-away', title: 'Унесённые призраками', original: 'Spirited Away', year: 2001, duration: 125, rating: 8.6, genres: ['Анимация','Фэнтези'], trend: 75, age: '6+', desc: 'Девочка попадает в загадочный мир духов и ищет путь домой.' },
  { id: 'the-dark-knight', title: 'Тёмный рыцарь', original: 'The Dark Knight', year: 2008, duration: 152, rating: 9.0, genres: ['Боевик','Криминал'], trend: 92, age: '16+', desc: 'Бэтмен сталкивается с Джокером, который разрушает устои Готэма.' },
  { id: 'dune', title: 'Дюна', original: 'Dune', year: 2021, duration: 155, rating: 8.2, genres: ['Фантастика','Приключения'], trend: 89, age: '12+', desc: 'Наследник дома Атрейдесов сражается за судьбу пустынной планеты Арракис.' },
  { id: 'blade-runner-2049', title: 'Бегущий по лезвию 2049', original: 'Blade Runner 2049', year: 2017, duration: 164, rating: 8.0, genres: ['Фантастика','Драма'], trend: 74, age: '16+', desc: 'Новый бегущий раскрывает тайну, способную изменить остатки общества.' },
  { id: 'shawshank', title: 'Побег из Шоушенка', original: 'The Shawshank Redemption', year: 1994, duration: 142, rating: 9.1, genres: ['Драма'], trend: 88, age: '16+', desc: 'История надежды и дружбы за стенами тюрьмы Шоушенк.' },
  { id: 'forrest-gump', title: 'Форрест Гамп', original: 'Forrest Gump', year: 1994, duration: 142, rating: 8.8, genres: ['Драма','Роман'], trend: 80, age: '12+', desc: 'Необычная жизнь простодушного, но доброго Форреста.' },
  { id: 'pulp-fiction', title: 'Криминальное чтиво', original: 'Pulp Fiction', year: 1994, duration: 154, rating: 8.9, genres: ['Криминал','Драма'], trend: 82, age: '18+', desc: 'Переплетение историй бандитов, боксера и пары грабителей.' },
  { id: 'fight-club', title: 'Бойцовский клуб', original: 'Fight Club', year: 1999, duration: 139, rating: 8.8, genres: ['Драма','Триллер'], trend: 77, age: '18+', desc: 'Клерк создает тайный клуб, чтобы выплеснуть внутреннюю пустоту.' },
  { id: 'whiplash', title: 'Одержимость', original: 'Whiplash', year: 2014, duration: 107, rating: 8.5, genres: ['Драма','Музыка'], trend: 70, age: '16+', desc: 'Молодой барабанщик сталкивается с жестким наставником.' },
  { id: 'social-network', title: 'Социальная сеть', original: 'The Social Network', year: 2010, duration: 120, rating: 7.8, genres: ['Драма','Биография'], trend: 66, age: '12+', desc: 'История создания Facebook и конфликтов вокруг него.' },
  { id: 'la-la-land', title: 'Ла-Ла Ленд', original: 'La La Land', year: 2016, duration: 128, rating: 8.0, genres: ['Мюзикл','Роман'], trend: 69, age: '12+', desc: 'Любовь музыканта и актрисы в Лос-Анджелесе.' },
  { id: 'her', title: 'Она', original: 'Her', year: 2013, duration: 126, rating: 8.0, genres: ['Роман','Драма'], trend: 65, age: '16+', desc: 'Мужчина влюбляется в интеллектуальную операционную систему.' },
  { id: 'wolf-of-wall-street', title: 'Волк с Уолл-стрит', original: 'The Wolf of Wall Street', year: 2013, duration: 180, rating: 8.2, genres: ['Комедия','Биография'], trend: 71, age: '18+', desc: 'Взлет и падение брокера Джордана Белфорта.' },
  { id: 'lotr-fellowship', title: 'Властелин колец: Братство Кольца', original: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001, duration: 178, rating: 8.8, genres: ['Фэнтези','Приключения'], trend: 90, age: '12+', desc: 'Хоббит Фродо отправляется уничтожить Кольцо Всевластия.' },
  { id: 'lotr-two-towers', title: 'Властелин колец: Две крепости', original: 'The Lord of the Rings: The Two Towers', year: 2002, duration: 179, rating: 8.7, genres: ['Фэнтези','Приключения'], trend: 88, age: '12+', desc: 'Битвы Средиземья набирают обороты.' },
  { id: 'lotr-return-king', title: 'Властелин колец: Возвращение короля', original: 'The Lord of the Rings: The Return of the King', year: 2003, duration: 201, rating: 8.9, genres: ['Фэнтези','Приключения'], trend: 92, age: '12+', desc: 'Заключительная битва за судьбу Средиземья.' },
  { id: 'your-name', title: 'Твоё имя', original: 'Your Name', year: 2016, duration: 106, rating: 8.4, genres: ['Анимация','Роман'], trend: 72, age: '6+', desc: 'Двое подростков странно связаны и пытаются встретиться.' },
  { id: 'spirited-heart', title: 'Шёпот сердца', original: 'Whisper of the Heart', year: 1995, duration: 111, rating: 7.9, genres: ['Анимация','Драма'], trend: 63, age: '6+', desc: 'Девочка находит вдохновение и свой путь.' },
  { id: 'the-godfather', title: 'Крёстный отец', original: 'The Godfather', year: 1972, duration: 175, rating: 9.2, genres: ['Криминал','Драма'], trend: 87, age: '18+', desc: 'Сага о семье Корлеоне и мире мафии.' },
  { id: 'oppenheimer', title: 'Оппенгеймер', original: 'Oppenheimer', year: 2023, duration: 180, rating: 8.4, genres: ['Драма','Биография'], trend: 85, age: '16+', desc: 'История создателя атомной бомбы и моральной дилеммы века.' },
];

// =============== Derived values ===============
const ALL_GENRES = [...new Set(MOVIES.flatMap(m => m.genres))].sort((a,b)=>a.localeCompare(b,'ru'));

// =============== Rendering ===============
const state = {
  query: '',
  sort: 'trending',
  yearMin: 1990,
  yearMax: 2025,
  genres: new Set(),
  nav: 'home', // or 'movies', 'series', 'mylist'
};

function posterUrl(movie, w = 300, h = 450) {
  const p = `covers/${movie.id}.jpg`;
  return p; // will fallback if 404
}
function backdropUrl(movie, w = 1280, h = 720) {
  const p = `covers/${movie.id}-backdrop.jpg`;
  return p;
}

function renderGenres() {
  const box = $('#genreChips');
  box.innerHTML = '';
  ALL_GENRES.forEach(g => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'rounded-full bg-white/5 hover:bg-white/10 ring-1 ring-white/10 px-3 py-2 text-xs text-neutral-200';
    chip.textContent = g;
    chip.dataset.genre = g;
    chip.addEventListener('click', () => {
      if (state.genres.has(g)) state.genres.delete(g); else state.genres.add(g);
      chip.classList.toggle('bg-fuchsia-500/20');
      update();
    });
    box.appendChild(chip);
  });
}

function formatMeta(movie) {
  return `${movie.year} • ${movie.duration} мин • ${movie.genres.join(', ')} • ${movie.age}`;
}

function createCard(movie) {
  const card = document.createElement('article');
  card.className = 'card group relative overflow-hidden rounded-2xl bg-neutral-900/60 ring-1 ring-white/10';

  const img = document.createElement('img');
  img.loading = 'lazy';
  img.alt = movie.title;
  img.className = 'h-[240px] w-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100';
  img.src = posterUrl(movie);
  img.onerror = () => { img.onerror = null; img.src = imagePlaceholder(movie.title); };

  const overlay = document.createElement('div');
  overlay.className = 'absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent';

  const info = document.createElement('div');
  info.className = 'absolute inset-x-0 bottom-0 p-3 flex flex-col gap-1';

  const rowTop = document.createElement('div');
  rowTop.className = 'flex items-center justify-between gap-2';

  const title = document.createElement('h3');
  title.className = 'text-sm font-semibold line-clamp-1';
  title.textContent = movie.title;

  const badge = document.createElement('span');
  badge.className = 'inline-flex items-center rounded-full bg-black/40 px-2 py-0.5 text-[11px] ring-1 ring-white/10';
  badge.textContent = `★ ${movie.rating}`;

  rowTop.append(title, badge);

  const rowBtns = document.createElement('div');
  rowBtns.className = 'mt-1 hidden sm:flex items-center gap-2';

  const btnPlay = document.createElement('button');
  btnPlay.className = 'btn-primary !h-9 flex-1';
  btnPlay.innerHTML = '<span class="inline-flex items-center gap-2 justify-center w-full"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>Смотреть</span>';
  btnPlay.addEventListener('click', () => openDetails(movie, true));

  const btnMore = document.createElement('button');
  btnMore.className = 'btn-secondary !h-9';
  btnMore.textContent = 'Подробнее';
  btnMore.addEventListener('click', () => openDetails(movie));

  const btnFav = document.createElement('button');
  btnFav.className = 'btn-secondary !h-9 aspect-square';
  btnFav.setAttribute('aria-label', 'В мой список');
  const setFavIcon = () => btnFav.innerHTML = Watchlist.has(movie.id) ? '❤' : '♡';
  setFavIcon();
  btnFav.addEventListener('click', (e) => { e.stopPropagation(); Watchlist.toggle(movie.id); setFavIcon(); });

  rowBtns.append(btnPlay, btnMore, btnFav);
  info.append(rowTop, rowBtns);

  card.append(img, overlay, info);
  card.addEventListener('click', () => openDetails(movie));
  return card;
}

function renderGrid(list) {
  const grid = $('#catalogGrid');
  grid.innerHTML = '';
  list.forEach(m => grid.appendChild(createCard(m)));
  $('#emptyState').classList.toggle('hidden', list.length !== 0);
}

function renderHero(movie) {
  $('#heroTitle').textContent = movie.title;
  $('#heroDesc').textContent = movie.desc;
  $('#heroMeta').textContent = `${movie.original} • ★ ${movie.rating}`;
  const img = $('#heroBackdrop');
  img.src = backdropUrl(movie, 1280, 720);
  img.onerror = () => { img.onerror = null; img.src = imagePlaceholder(movie.title, 1280, 720); };
  $('#heroPlay').onclick = () => openDetails(movie, true);
  $('#heroMore').onclick = () => openDetails(movie);
}

function renderTrending(list) {
  const row = $('#trendingRow');
  row.innerHTML = '';
  list.forEach(m => {
    const a = document.createElement('a');
    a.href = '#';
    a.className = 'mr-3 inline-block w-56 snap-start align-top';
    const card = createCard(m);
    card.querySelector('.h-[240px]').classList.add('h-[180px]');
    a.appendChild(card);
    a.addEventListener('click', (e) => { e.preventDefault(); openDetails(m); });
    row.appendChild(a);
  });
  // buttons
  const rowEl = $('#trendingRow');
  $('#trendPrev').onclick = () => rowEl.scrollBy({ left: -480, behavior: 'smooth' });
  $('#trendNext').onclick = () => rowEl.scrollBy({ left:  480, behavior: 'smooth' });
}

// =============== Filtering & Sorting ===============
function applyFilters() {
  const q = state.query.trim().toLowerCase();
  const list = MOVIES.filter(m => {
    if (m.year < state.yearMin || m.year > state.yearMax) return false;
    if (state.genres.size && ![...state.genres].every(g => m.genres.includes(g))) return false;
    if (q && !(`${m.title} ${m.original}`.toLowerCase().includes(q))) return false;
    if (state.nav === 'mylist' && !Watchlist.has(m.id)) return false;
    return true;
  });
  switch (state.sort) {
    case 'rating': list.sort((a,b)=>b.rating - a.rating); break;
    case 'year': list.sort((a,b)=>b.year - a.year); break;
    case 'title': list.sort((a,b)=>a.title.localeCompare(b.title,'ru')); break;
    default: list.sort((a,b)=>b.trend - a.trend); break;
  }
  return list;
}

function update() {
  const filtered = applyFilters();
  renderGrid(filtered);
}

// =============== Modal & Player ===============
let currentMovie = null;
function openDetails(movie, autoplay = false) {
  currentMovie = movie;
  $('#modalTitle').textContent = movie.title;
  $('#modalRating').textContent = `★ ${movie.rating}`;
  $('#modalMeta').textContent = formatMeta(movie);
  $('#modalDesc').textContent = movie.desc;
  const poster = $('#modalPoster');
  poster.src = posterUrl(movie);
  poster.onerror = () => { poster.onerror = null; poster.src = imagePlaceholder(movie.title); };
  $('#detailsModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  const player = $('#modalPlayer');
  player.classList.add('hidden');
  player.pause();
  $('#modalPlay').onclick = () => {
    player.src = SAMPLE_TRAILER;
    player.classList.remove('hidden');
    player.scrollIntoView({ behavior: 'smooth', block: 'end' });
    if (autoplay) player.play().catch(()=>{});
  };
  const btnWatch = $('#modalToggleWatch');
  const syncWatch = () => btnWatch.textContent = Watchlist.has(movie.id) ? 'Убрать из списка' : 'В мой список';
  syncWatch();
  btnWatch.onclick = () => { Watchlist.toggle(movie.id); syncWatch(); update(); };
}

function closeDetails() {
  $('#detailsModal').classList.add('hidden');
  document.body.style.overflow = '';
  const player = $('#modalPlayer');
  player.pause();
}

// =============== Init ===============
function initNav() {
  $$('.nav-link').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      state.nav = a.dataset.nav;
      $$('.nav-link').forEach(x=>x.classList.remove('bg-white/10'));
      a.classList.add('bg-white/10');
      update();
    });
  });
}

function initFilters() {
  $('#searchInput').addEventListener('input', (e)=>{ state.query = e.target.value; update(); });
  $('#sortSelect').addEventListener('change', (e)=>{ state.sort = e.target.value; update(); });
  $('#yearMin').addEventListener('change', (e)=>{ state.yearMin = clamp(parseInt(e.target.value||'1990',10), 1950, 2030); update(); });
  $('#yearMax').addEventListener('change', (e)=>{ state.yearMax = clamp(parseInt(e.target.value||'2025',10), 1950, 2030); update(); });
  $('#resetFilters').addEventListener('click', ()=>{
    state.query=''; state.sort='trending'; state.yearMin=1990; state.yearMax=2025; state.genres.clear();
    $('#searchInput').value=''; $('#sortSelect').value='trending'; $('#yearMin').value='1990'; $('#yearMax').value='2025';
    // clear chip selection
    $$('#genreChips button').forEach(b=>b.classList.remove('bg-fuchsia-500/20'));
    update();
  });
}

function initModal() {
  $('#modalClose').addEventListener('click', closeDetails);
  $('#detailsModal').addEventListener('click', (e)=>{ if (e.target === $('#detailsModal')) closeDetails(); });
  window.addEventListener('keydown', (e)=>{ if (e.key === 'Escape' && !$('#detailsModal').classList.contains('hidden')) closeDetails(); });
}

function init() {
  Theme.init();
  $('#yearNow').textContent = new Date().getFullYear();
  renderGenres();
  initFilters();
  initModal();
  initNav();
  // hero = most trending
  const heroMovie = [...MOVIES].sort((a,b)=>b.trend - a.trend)[0];
  renderHero(heroMovie);
  // trending list = top 10 by trend
  renderTrending([...MOVIES].sort((a,b)=>b.trend - a.trend).slice(0, 10));
  // initial grid
  update();
}

document.addEventListener('DOMContentLoaded', init);
