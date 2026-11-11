// Progressive enhancement: project content and credential links work without JS.
export function initShowcase() {
  const records = [...document.querySelectorAll('.credential')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  filters.forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.filter;
    let count = 0;
    records.forEach(record => {
      record.hidden = selected !== 'all' && record.dataset.category !== selected;
      if (!record.hidden) count += 1;
    });
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    document.querySelector('#certificate-count').textContent = count + (count === 1 ? ' record' : ' records');
  }));

  const disclosure = document.querySelector('.demo-disclosure');
  disclosure.addEventListener('toggle', () => {
    if (!disclosure.open) disclosure.querySelector('video').pause();
  });

  const airframe = document.querySelector('#airframe-image');
  const views = [...document.querySelectorAll('[data-view]')];
  const labels = { orbit: 'Three-quarter', top: 'Top-view', side: 'Side-view' };
  views.forEach(button => button.addEventListener('click', () => {
    const view = button.dataset.view;
    airframe.src = `assets/projects/model-b-xl-${view}.webp`;
    airframe.alt = `${labels[view]} CAD render of the Eclipson Model B XL with twin floats`;
    views.forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
  }));
}
