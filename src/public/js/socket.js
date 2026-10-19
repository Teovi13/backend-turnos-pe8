const socket = io();

const priceFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

const createElement = (tag, options = {}, children = []) => {
  const element = document.createElement(tag);
  if (options.className) element.className = options.className;
  if (options.text !== undefined) element.textContent = options.text;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => element.setAttribute(key, value));
  }
  children.forEach((child) => element.append(child));
  return element;
};

const toastElement = document.getElementById('toast');
let toastTimer = null;

const showToast = (message) => {
  if (!toastElement) return;
  toastElement.textContent = message;
  toastElement.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastElement.hidden = true;
  }, 3500);
};

const statusElement = document.getElementById('socket-status');

const setStatus = (online) => {
  if (!statusElement) return;
  statusElement.textContent = online ? 'En vivo' : 'Sin conexión';
  statusElement.className = `status ${online ? 'status--online' : 'status--offline'}`;
};

socket.on('connect', () => setStatus(true));
socket.on('disconnect', () => setStatus(false));

const servicesBody = document.getElementById('services-body');

if (servicesBody) {
  const emptyMessage = document.getElementById('services-empty');
  const countElement = document.getElementById('services-count');
  const form = document.getElementById('service-form');
  const formMessage = document.getElementById('form-message');

  const availabilityBadge = (available) =>
    createElement('span', {
      className: `badge ${available ? 'badge--on' : 'badge--off'}`,
      text: available ? 'Disponible' : 'No disponible',
    });

  const buildRow = (service) => {
    const cell = (label, content, className) => {
      const td = createElement('td', { className, attrs: { 'data-label': label } });
      if (typeof content === 'string') td.textContent = content;
      else td.append(content);
      return td;
    };

    const toggleButton = createElement('button', {
      className: 'btn btn--small',
      text: service.available ? 'Desactivar' : 'Activar',
      attrs: { type: 'button', 'data-action': 'toggle', 'data-available': String(service.available) },
    });
    const deleteButton = createElement('button', {
      className: 'btn btn--small btn--danger',
      text: 'Eliminar',
      attrs: { type: 'button', 'data-action': 'delete' },
    });
    const actions = createElement('td', { attrs: { 'data-label': 'Acciones' } }, [
      createElement('div', { className: 'actions' }, [toggleButton, deleteButton]),
    ]);

    return createElement('tr', { attrs: { 'data-id': service.id } }, [
      cell('Nombre', service.name, 'strong'),
      cell('Descripción', service.description),
      cell('Duración', `${service.duration} min`),
      cell('Precio', priceFormatter.format(service.price)),
      cell('Categoría', createElement('span', { className: 'tag', text: service.category })),
      cell('Disponibilidad', availabilityBadge(service.available)),
      actions,
    ]);
  };

  const findRow = (id) => servicesBody.querySelector(`tr[data-id="${CSS.escape(id)}"]`);

  const refreshCounters = () => {
    const total = servicesBody.children.length;
    countElement.textContent = total;
    emptyMessage.hidden = total > 0;
  };

  const highlight = (row) => {
    row.classList.remove('row--flash');
    void row.offsetWidth;
    row.classList.add('row--flash');
  };

  socket.on('service:created', (service) => {
    if (findRow(service.id)) return;
    const row = buildRow(service);
    servicesBody.append(row);
    highlight(row);
    refreshCounters();
    showToast(`Nuevo servicio: ${service.name}`);
  });

  socket.on('service:updated', (service) => {
    const current = findRow(service.id);
    const row = buildRow(service);
    if (current) current.replaceWith(row);
    else servicesBody.append(row);
    highlight(row);
    refreshCounters();
    showToast(`Servicio actualizado: ${service.name}`);
  });

  socket.on('service:deleted', ({ id }) => {
    const row = findRow(id);
    if (!row) return;
    const name = row.querySelector('td').textContent;
    row.remove();
    refreshCounters();
    showToast(`Servicio eliminado: ${name}`);
  });

  const request = async (method, url, body) => {
    const options = { method, headers: {} };
    if (body !== undefined) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error inesperado');
    return data.payload;
  };

  servicesBody.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const { id } = button.closest('tr').dataset;
    button.disabled = true;

    try {
      if (button.dataset.action === 'toggle') {
        const available = button.dataset.available !== 'true';
        await request('PUT', `/api/services/${id}`, { available });
      } else if (button.dataset.action === 'delete') {
        await request('DELETE', `/api/services/${id}`);
      }
    } catch (error) {
      showToast(error.message);
      button.disabled = false;
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const toNumber = (value) => (value.trim() === '' ? null : Number(value));
    const body = {
      name: data.get('name').trim(),
      description: data.get('description').trim(),
      duration: toNumber(data.get('duration')),
      price: toNumber(data.get('price')),
      category: data.get('category').trim(),
      available: data.get('available') === 'on',
    };

    formMessage.textContent = '';
    formMessage.className = 'form__message';

    try {
      await request('POST', '/api/services', body);
      form.reset();
      form.elements.available.checked = true;
      formMessage.textContent = 'Servicio creado.';
      formMessage.classList.add('form__message--ok');
    } catch (error) {
      formMessage.textContent = error.message;
      formMessage.classList.add('form__message--error');
    }
  });
}

const categoriesContainer = document.getElementById('availability-categories');

if (categoriesContainer) {
  const unavailableList = document.getElementById('unavailable-list');
  const availableEmpty = document.getElementById('available-empty');
  const unavailableEmpty = document.getElementById('unavailable-empty');
  const totalAvailable = document.getElementById('total-available');
  const totalServices = document.getElementById('total-services');

  const buildServiceItem = (service) =>
    createElement('li', { className: 'service-item' }, [
      createElement('div', {}, [
        createElement('span', { className: 'strong', text: service.name }),
        createElement('span', { className: 'muted', text: service.description }),
      ]),
      createElement('div', { className: 'service-item__meta' }, [
        createElement('span', { text: `${service.duration} min` }),
        createElement('span', { className: 'strong', text: priceFormatter.format(service.price) }),
      ]),
    ]);

  const buildCategory = ({ category, services }) =>
    createElement('article', { className: 'category' }, [
      createElement('h3', { className: 'category__title' }, [
        `${category} `,
        createElement('span', { className: 'muted', text: `(${services.length})` }),
      ]),
      createElement('ul', { className: 'service-list' }, services.map(buildServiceItem)),
    ]);

  const buildChip = (service) =>
    createElement('li', { className: 'chip' }, [
      `${service.name} `,
      createElement('span', { className: 'muted', text: `· ${service.category}` }),
    ]);

  socket.on('availability:updated', (availability) => {
    categoriesContainer.replaceChildren(...availability.categories.map(buildCategory));
    unavailableList.replaceChildren(...availability.unavailable.map(buildChip));
    totalAvailable.textContent = availability.totalAvailable;
    totalServices.textContent = availability.totalServices;
    availableEmpty.hidden = availability.totalAvailable > 0;
    unavailableEmpty.hidden = availability.unavailable.length > 0;
    showToast('Disponibilidad actualizada');
  });
}
