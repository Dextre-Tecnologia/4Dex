(() => {
  const utilityTrack = document.getElementById('utility-track');
  const socialLinks = document.getElementById('social-links');
  if (!utilityTrack || !socialLinks) return;

  function makePickerButton(id, label) {
    const button = document.createElement('button');
    button.id = id;
    button.type = 'button';
    button.className = 'utility-add-btn h-9 w-9 shrink-0 rounded-full border border-white/20 text-xl text-white/80 transition hover:border-cyan-400 hover:text-cyan-300';
    button.textContent = '+';
    button.setAttribute('aria-label', label);
    button.title = label;
    return button;
  }

  const openToolsPicker = makePickerButton('open-tools-picker', 'Adicionar ferramentas');
  const openSocialPicker = makePickerButton('open-social-picker', 'Adicionar redes sociais');
  let lastPickerButton = openToolsPicker;

  const pageName = location.pathname.split('/').filter(Boolean).slice(-2, -1)[0] || 'home';
  const storageKey = `4dex-shortcuts-${pageName}`;
  const tools = [...utilityTrack.children].map((element) => makeItem(element, 'tool'));
  const socials = [...socialLinks.children].map((element) => makeItem(element, 'social'));
  const selected = readSelection();
  const modal = document.createElement('div');

  function makeItem(element, type) {
    const anchor = element.matches('a') ? element : element.querySelector('a');
    if (!anchor) return null;
    const image = anchor.querySelector('img');
    const href = anchor.href;
    const host = new URL(href, location.href).hostname.replace(/^www\./, '');
    const label = element.getAttribute('title') || image?.alt || friendlyName(host);
    return { id: `${type}:${href}`, label, source: element, anchor, type };
  }

  function friendlyName(host) {
    const names = {
      'github.com': 'GitHub',
      'wa.me': 'WhatsApp',
      'ig.me': 'Instagram',
      'linkedin.com': 'LinkedIn',
      'fiverr.com': 'Fiverr',
      'br.fiverr.com': 'Fiverr',
      'workana.com': 'Workana',
      'ytjobs.co': 'YT Jobs',
      'python.org': 'Python',
      'app.powerbi.com': 'Power BI',
      'salesforce.com': 'Salesforce',
      'reactjs.org': 'React',
      'reactnative.dev': 'React Native',
      'vscode.dev': 'Visual Studio Code'
    };
    return names[host] || host.split('.')[0].replace(/[-_]/g, ' ');
  }

  function readSelection() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return {
        tools: Array.isArray(value.tools) ? value.tools : [],
        socials: Array.isArray(value.socials) ? value.socials : []
      };
    } catch {
      return { tools: [], socials: [] };
    }
  }

  function saveSelection() {
    localStorage.setItem(storageKey, JSON.stringify(selected));
  }

  function makeOption(item) {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2 last:border-0';

    const content = document.createElement('div');
    content.className = 'flex min-w-0 flex-1 items-center gap-3 text-left';
    const icon = item.anchor.cloneNode(true);
    icon.className = 'flex h-8 w-8 shrink-0 items-center justify-center [&_img]:max-h-7 [&_img]:max-w-7 [&_i]:text-xl';
    icon.tabIndex = -1;
    icon.setAttribute('aria-hidden', 'true');
    icon.addEventListener('click', (event) => event.preventDefault());

    const label = document.createElement('span');
    label.className = 'block flex-1 truncate text-left text-sm text-white/80';
    label.textContent = item.label;
    content.append(icon, label);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'utility-add-btn h-8 w-8 shrink-0 rounded-full border border-white/20 text-lg text-white/80 hover:border-cyan-400 hover:text-cyan-300';
    button.setAttribute('aria-label', `Adicionar ${item.label}`);
    button.addEventListener('click', () => {
      const entries = selected[item.type === 'tool' ? 'tools' : 'socials'];
      const index = entries.indexOf(item.id);
      if (index >= 0) entries.splice(index, 1);
      else entries.push(item.id);
      saveSelection();
      render();
    });

    row.append(content, button);
    return { row, button, item };
  }

  const optionControls = [...tools, ...socials].filter(Boolean).map(makeOption);
  const toolOptions = optionControls.filter(({ item }) => item.type === 'tool');
  const socialOptions = optionControls.filter(({ item }) => item.type === 'social');

  modal.className = 'fixed inset-0 z-[100] hidden items-center justify-center bg-black/75 p-4 backdrop-blur-sm';
  modal.innerHTML = `
    <section role="dialog" aria-modal="true" aria-labelledby="shortcut-picker-title" class="w-full max-w-sm overflow-hidden border border-white/15 bg-[#090b0d] text-white shadow-2xl">
      <header class="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 id="shortcut-picker-title" class="font-orbit text-sm font-bold uppercase tracking-[0.2em]">Adicionar atalhos</h2>
        <button type="button" data-close-picker aria-label="Fechar" class="h-9 w-9 border border-white/15 text-xl text-white/70 hover:text-white">&times;</button>
      </header>
      <div class="max-h-[60vh] overflow-y-auto p-3">
        <input type="search" data-picker-search aria-label="Pesquisar pelo nome" placeholder="Pesquisar pelo nome..." class="mb-3 h-9 w-full border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none">
        <div class="grid gap-3">
          <section data-picker-section="tools">
            <h3 class="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">Ferramentas</h3>
            <div data-tool-options class="border border-white/10"></div>
            <p data-picker-empty="tools" class="hidden px-3 py-4 text-center text-xs text-white/50">Nenhum resultado encontrado.</p>
          </section>
          <section data-picker-section="socials">
            <h3 class="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">Redes sociais</h3>
            <div data-social-options class="border border-white/10"></div>
            <p data-picker-empty="socials" class="hidden px-3 py-4 text-center text-xs text-white/50">Nenhum resultado encontrado.</p>
          </section>
        </div>
      </div>
    </section>`;
  document.body.appendChild(modal);

  toolOptions.forEach(({ row }) => modal.querySelector('[data-tool-options]').appendChild(row));
  socialOptions.forEach(({ row }) => modal.querySelector('[data-social-options]').appendChild(row));
  const searchInput = modal.querySelector('[data-picker-search]');

  function filterOptions() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    const visibleCounts = { tools: 0, socials: 0 };

    optionControls.forEach(({ row, item }) => {
      const category = item.type === 'tool' ? 'tools' : 'socials';
      const matches = item.label.toLocaleLowerCase().includes(query);
      row.hidden = !matches;
      if (matches) visibleCounts[category] += 1;
    });

    Object.entries(visibleCounts).forEach(([category, count]) => {
      modal.querySelector(`[data-picker-empty="${category}"]`).classList.toggle('hidden', count > 0);
    });
  }

  searchInput.addEventListener('input', filterOptions);
  utilityTrack.replaceChildren();
  socialLinks.replaceChildren();

  function render() {
    utilityTrack.replaceChildren();
    socialLinks.replaceChildren();

    selected.tools
      .map((id) => tools.find((item) => item?.id === id))
      .filter(Boolean)
      .forEach((item) => {
      const link = item.anchor.cloneNode(true);
      link.className = 'flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-70 [&_img]:max-h-6 [&_img]:max-w-6 [&_i]:text-xl';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.title = item.label;
      utilityTrack.appendChild(link);
    });

    selected.socials
      .map((id) => socials.find((item) => item?.id === id))
      .filter(Boolean)
      .forEach((item) => {
        const link = item.anchor.cloneNode(true);
        link.className = 'flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-70 [&_img]:max-h-6 [&_img]:max-w-6 [&_i]:text-xl';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.title = item.label;
        socialLinks.appendChild(link);
    });

      utilityTrack.appendChild(openToolsPicker);
      socialLinks.appendChild(openSocialPicker);

    [...toolOptions, ...socialOptions].forEach(({ button, item }) => {
      const isSelected = selected[item.type === 'tool' ? 'tools' : 'socials'].includes(item.id);
      button.textContent = isSelected ? '\u2713' : '+';
      button.classList.toggle('border-cyan-400', isSelected);
      button.classList.toggle('text-cyan-300', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
      button.setAttribute('aria-label', `${isSelected ? 'Remover' : 'Adicionar'} ${item.label}`);
    });
  }

  function openPicker(event) {
    lastPickerButton = event.currentTarget;
    searchInput.value = '';
    filterOptions();
    const section = lastPickerButton === openToolsPicker ? 'tools' : 'socials';
    modal.querySelectorAll('[data-picker-section]').forEach((panel) => {
      panel.hidden = panel.dataset.pickerSection !== section;
    });
    modal.querySelector('#shortcut-picker-title').textContent = section === 'tools'
      ? 'Adicionar ferramentas'
      : 'Adicionar redes sociais';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.querySelector('[data-close-picker]').focus();
  }

  function closePicker() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    lastPickerButton.focus();
  }

  openToolsPicker.addEventListener('click', openPicker);
  openSocialPicker.addEventListener('click', openPicker);
  modal.querySelector('[data-close-picker]').addEventListener('click', closePicker);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closePicker();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) closePicker();
  });
  render();
})();
