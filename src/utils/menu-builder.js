const FULL_MENU = [
  { id: 'home',        label: 'Inicio',       route: '/home',       icon: 'Home' },
  { id: 'products',    label: 'Productos',    route: '/products',   icon: 'Package' },
  { id: 'categories',  label: 'Categorías',   route: '/categories', icon: 'Tag' },
  { id: 'employees',   label: 'Empleados',    route: '/employees',  icon: 'Users' },
  { id: 'schedules',   label: 'Turnos',       route: '/schedules',  icon: 'Calendar' },
  { id: 'sales',       label: 'Ventas',       route: '/sales',      icon: 'ShoppingCart' },
  { id: 'whatsapp_sales',   label: 'Pedidos IA',  route: '/whatsapp_sales',  icon: 'Whatsapp' },
  { id: 'purchases',   label: 'Compras',      route: '/purchases',  icon: 'Truck' },
  { id: 'cash',        label: 'Caja',         route: '/cash',       icon: 'Wallet' },
  { id: 'stores',      label: 'Tiendas',      route: '/stores',     icon: 'Building' },
  { id: 'providers',   label: 'Proveedores',  route: '/providers',  icon: 'Handshake' },
  // { id: 'settings',    label: 'Ajustes',      route: '/settings',   icon: 'Settings' },
];

const PERMIT_TO_MENU = {
  // VIEW_EMPLOYEES: ['employees'],
  // VIEW_SCHEDULES: ['schedules'],
  // VIEW_CASH: ['cash'],
};

function limitedMenu() {
  const exclude = new Set(['employees', 'schedules', 'cash']);
  return FULL_MENU.filter(m => !exclude.has(m.id));
}

function buildMenu({ isAdmin, permits }) {
  if (isAdmin) return FULL_MENU;
  const names = new Set((permits || []).map(p => p.name));

  if (names.has('ACCESS_ALL')) return FULL_MENU;

  const allowedIds = new Set();
  names.forEach(name => {
    const ids = PERMIT_TO_MENU[name];
    if (ids) ids.forEach(id => allowedIds.add(id));
  });

  if (allowedIds.size > 0) {
    const base = new Set(['home', 'products', 'categories', 'settings']);
    return FULL_MENU.filter(m => base.has(m.id) || allowedIds.has(m.id));
  }

  return limitedMenu();
}

module.exports = { buildMenu, FULL_MENU, PERMIT_TO_MENU };