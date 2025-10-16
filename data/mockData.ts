// data/mockData.ts
import { Waiter, Category, MenuItem, InventoryItem, Table, RestaurantSettings } from '../types';

export const mockWaiters: Waiter[] = [
  { id: 'w1', name: 'مسؤول', pin: '4714', role: 'ADMIN' },
  { id: 'w2', name: 'نبيل', pin: '9999', role: 'MANAGER' },
  { id: 'w3', name: 'شاهد', pin: '9999', role: 'MANAGER' },
];

export const mockCategories: Category[] = [
  { id: 'cat-bebidas', name: 'Bebidas', imageUrl: 'https://img.icons8.com/plasticine/100/soda-bottle.png' },
  { id: 'cat-shisha', name: 'Shisha', imageUrl: 'https://img.icons8.com/plasticine/100/hookah.png' },
  { id: 'cat-comida', name: 'Comida', imageUrl: 'https://img.icons8.com/plasticine/100/hamburger.png' },
  { id: 'cat-cafe', name: 'Cafe', imageUrl: 'https://img.icons8.com/plasticine/100/cafe.png' },
  { id: 'cat-vino', name: 'Vino', imageUrl: 'https://img.icons8.com/plasticine/100/wine-bottle.png' },
];

export const mockInventory: InventoryItem[] = [
  // Soft Drinks
  { id: 'inv-cocacola', name: 'Coca-Cola', quantity: 100, unit: 'unidades', lowStockThreshold: 10, categoryId: 'cat-bebidas' },
  { id: 'inv-fanta-lima', name: 'Fanta Limón', quantity: 100, unit: 'unidades', lowStockThreshold: 10, categoryId: 'cat-bebidas' },
  { id: 'inv-fanta-naranja', name: 'Fanta Naranja', quantity: 100, unit: 'unidades', lowStockThreshold: 10, categoryId: 'cat-bebidas' },
  { id: 'inv-aquarius-limon', name: 'Aquarius Limón', quantity: 100, unit: 'unidades', lowStockThreshold: 10, categoryId: 'cat-bebidas' },
  { id: 'inv-aquarius-naranja', name: 'Aquarius Naranja', quantity: 100, unit: 'unidades', lowStockThreshold: 10, categoryId: 'cat-bebidas' },
  { id: 'inv-schweppes-limon', name: 'Schweppes Limón', quantity: 100, unit: 'unidades', lowStockThreshold: 10, categoryId: 'cat-bebidas' },
  { id: 'inv-nestea-maracuya', name: 'Nestea Maracuyá', quantity: 100, unit: 'unidades', lowStockThreshold: 10, categoryId: 'cat-bebidas' },
  { id: 'inv-nestea-limon', name: 'Nestea Limón', quantity: 100, unit: 'unidades', lowStockThreshold: 10, categoryId: 'cat-bebidas' },
  { id: 'inv-hawai', name: 'Hawái', quantity: 100, unit: 'unidades', lowStockThreshold: 10, categoryId: 'cat-bebidas' },
  { id: 'inv-poms', name: 'Poms', quantity: 100, unit: 'unidades', lowStockThreshold: 10, categoryId: 'cat-bebidas' },
  { id: 'inv-energy', name: 'Energy Drink', quantity: 100, unit: 'unidades', lowStockThreshold: 10, categoryId: 'cat-bebidas' },
  { id: 'inv-vichy-catalan', name: 'Vichy Catalán', quantity: 100, unit: 'unidades', lowStockThreshold: 10, categoryId: 'cat-bebidas' },
  { id: 'inv-sprite', name: 'Sprite', quantity: 100, unit: 'unidades', lowStockThreshold: 10, categoryId: 'cat-bebidas' },
  { id: 'inv-cocacola-cero', name: 'Coca-Cola Zero', quantity: 100, unit: 'unidades', lowStockThreshold: 10, categoryId: 'cat-bebidas' },
  { id: 'inv-zumo-mango', name: 'Zumo Mango', quantity: 100, unit: 'unidades', lowStockThreshold: 10, categoryId: 'cat-bebidas' },
  { id: 'inv-zumo-melocoton', name: 'Zumo Melocotón', quantity: 100, unit: 'unidades', lowStockThreshold: 10, categoryId: 'cat-bebidas' },
  { id: 'inv-agua-1.5', name: 'Agua 1.5L', quantity: 100, unit: 'unidades', lowStockThreshold: 10, categoryId: 'cat-bebidas' },
  { id: 'inv-agua-0.5', name: 'Agua 0.5L', quantity: 100, unit: 'unidades', lowStockThreshold: 10, categoryId: 'cat-bebidas' },
  
  // Food
  { id: 'inv4', name: 'Fries', quantity: 20, unit: 'kg', lowStockThreshold: 5, categoryId: 'cat-comida' },

  // Alcohol
  { id: 'inv-jack-daniels', name: 'Jack Daniel\'s', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-red-label', name: 'Red Label', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-jagermeister', name: 'Jägermeister', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-brugal-extra-viejo', name: 'Brugal Extra Viejo', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-vodka', name: 'Vodka', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-malibu', name: 'Malibú', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-ballantines', name: 'Ballantine\'s', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-chivas', name: 'Chivas Regal', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-licor-43', name: 'Licor 43', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-jdb', name: 'J&B', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-bombay-sapphire', name: 'Bombay Sapphire', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-fireball', name: 'Fireball', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-baileys', name: 'Baileys', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-brugal-anejo', name: 'Brugal Añejo', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-belvedere', name: 'Belvedere', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-negroni', name: 'Negrita', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-puerto-de-indias', name: 'Puerto de Indias', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-ron-barcelo', name: 'Ron Barceló', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-anis-del-mono', name: 'Anís del Mono', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
  { id: 'inv-black-label', name: 'Black Label', quantity: 100, unit: 'botellas', lowStockThreshold: 10, categoryId: 'cat-vino' },
];

export const mockMenuItems: MenuItem[] = [
  // Shisha
  { id: 'm-shisha', name: 'Shisha', price: 8, categoryId: 'cat-shisha', imageUrl: 'https://img.icons8.com/?size=256&id=Zo4vu203R2eP&format=png', stockItemId: '', stockConsumption: 0, ingredients: [] },
  { id: 'm-cabeza', name: 'Cabeza', price: 5, categoryId: 'cat-shisha', imageUrl: 'https://img.icons8.com/?size=256&id=36166&format=png', stockItemId: '', stockConsumption: 0, ingredients: [] },
  
  // Bebidas
  { id: 'm-cocacola', name: 'Coca-Cola', price: 3, categoryId: 'cat-bebidas', imageUrl: 'https://img.icons8.com/color/48/coca-cola.png', stockItemId: 'inv-cocacola', stockConsumption: 1, ingredients: [] },
  { id: 'm-fanta-lima', name: 'Fanta Limón', price: 3, categoryId: 'cat-bebidas', imageUrl: 'https://img.icons8.com/color/48/fanta.png', stockItemId: 'inv-fanta-lima', stockConsumption: 1, ingredients: [] },
  { id: 'm-fanta-naranja', name: 'Fanta Naranja', price: 3, categoryId: 'cat-bebidas', imageUrl: 'https://img.icons8.com/color/48/fanta.png', stockItemId: 'inv-fanta-naranja', stockConsumption: 1, ingredients: [] },
  { id: 'm-aquarius-limon', name: 'Aquarius Limón', price: 3, categoryId: 'cat-bebidas', imageUrl: 'https://img.icons8.com/fluency/48/lemon.png', stockItemId: 'inv-aquarius-limon', stockConsumption: 1, ingredients: [] },
  { id: 'm-aquarius-naranja', name: 'Aquarius Naranja', price: 3, categoryId: 'cat-bebidas', imageUrl: 'https://img.icons8.com/fluency/48/orange.png', stockItemId: 'inv-aquarius-naranja', stockConsumption: 1, ingredients: [] },
  { id: 'm-schweppes-limon', name: 'Schweppes Limón', price: 3, categoryId: 'cat-bebidas', imageUrl: 'https://img.icons8.com/fluency/48/lemonade.png', stockItemId: 'inv-schweppes-limon', stockConsumption: 1, ingredients: [] },
  { id: 'm-nestea-maracuya', name: 'Nestea Maracuyá', price: 3, categoryId: 'cat-bebidas', imageUrl: 'https://img.icons8.com/fluency/48/passion-fruit.png', stockItemId: 'inv-nestea-maracuya', stockConsumption: 1, ingredients: [] },
  { id: 'm-nestea-limon', name: 'Nestea Limón', price: 3, categoryId: 'cat-bebidas', imageUrl: 'https://img.icons8.com/fluency/48/iced-tea.png', stockItemId: 'inv-nestea-limon', stockConsumption: 1, ingredients: [] },
  { id: 'm-hawai', name: 'Hawái', price: 3, categoryId: 'cat-bebidas', imageUrl: 'https://img.icons8.com/fluency/48/coconut-cocktail.png', stockItemId: 'inv-hawai', stockConsumption: 1, ingredients: [] },
  { id: 'm-poms', name: 'Poms', price: 3, categoryId: 'cat-bebidas', imageUrl: 'https://img.icons8.com/fluency/48/apple.png', stockItemId: 'inv-poms', stockConsumption: 1, ingredients: [] },
  { id: 'm-energy', name: 'Energy Drink', price: 3, categoryId: 'cat-bebidas', imageUrl: 'https://img.icons8.com/color/48/energy-drink.png', stockItemId: 'inv-energy', stockConsumption: 1, ingredients: [] },
  { id: 'm-vichy-catalan', name: 'Vichy Catalán', price: 3, categoryId: 'cat-bebidas', imageUrl: 'https://img.icons8.com/fluency/48/bottle-of-water.png', stockItemId: 'inv-vichy-catalan', stockConsumption: 1, ingredients: [] },
  { id: 'm-sprite', name: 'Sprite', price: 3, categoryId: 'cat-bebidas', imageUrl: 'https://img.icons8.com/color/48/sprite.png', stockItemId: 'inv-sprite', stockConsumption: 1, ingredients: [] },
  { id: 'm-cocacola-cero', name: 'Coca-Cola Zero', price: 3, categoryId: 'cat-bebidas', imageUrl: 'https://img.icons8.com/color/48/coca-cola.png', stockItemId: 'inv-cocacola-cero', stockConsumption: 1, ingredients: [] },
  { id: 'm-zumo-mango', name: 'Zumo Mango', price: 3, categoryId: 'cat-bebidas', imageUrl: 'https://img.icons8.com/fluency/48/mango.png', stockItemId: 'inv-zumo-mango', stockConsumption: 1, ingredients: [] },
  { id: 'm-zumo-melocoton', name: 'Zumo Melocotón', price: 3, categoryId: 'cat-bebidas', imageUrl: 'https://img.icons8.com/fluency/48/peach.png', stockItemId: 'inv-zumo-melocoton', stockConsumption: 1, ingredients: [] },
  { id: 'm-agua-1.5', name: 'Agua 1.5L', price: 1.5, categoryId: 'cat-bebidas', imageUrl: 'https://img.icons8.com/fluency/48/plastic-bottle.png', stockItemId: 'inv-agua-1.5', stockConsumption: 1, ingredients: [] },
  { id: 'm-agua-0.5', name: 'Agua 0.5L', price: 1, categoryId: 'cat-bebidas', imageUrl: 'https://img.icons8.com/fluency/48/water-bottle.png', stockItemId: 'inv-agua-0.5', stockConsumption: 1, ingredients: [] },
  
  // Comida
  { id: 'm4', name: 'French Fries', price: 5, categoryId: 'cat-comida', imageUrl: 'https://img.icons8.com/plasticine/100/hamburger.png', stockItemId: 'inv4', stockConsumption: 0.5, ingredients: ['Potatoes', 'Salt'] },
  
  // Cafe
  { id: 'm-cafe-solo', name: 'Café Solo', price: 1.5, categoryId: 'cat-cafe', imageUrl: 'https://img.icons8.com/fluency/48/espresso-cup.png', stockItemId: '', stockConsumption: 0, ingredients: [] },
  { id: 'm-cafe-leche', name: 'Café con Leche', price: 2, categoryId: 'cat-cafe', imageUrl: 'https://img.icons8.com/fluency/48/cafe.png', stockItemId: '', stockConsumption: 0, ingredients: [] },

  // Vino / Alcohol
  { id: 'm-jack-daniels', name: 'Jack Daniel\'s', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/whisky.png', stockItemId: 'inv-jack-daniels', stockConsumption: 1, ingredients: [] },
  { id: 'm-red-label', name: 'Red Label', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/whisky.png', stockItemId: 'inv-red-label', stockConsumption: 1, ingredients: [] },
  { id: 'm-jagermeister', name: 'Jägermeister', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/liqueur.png', stockItemId: 'inv-jagermeister', stockConsumption: 1, ingredients: [] },
  { id: 'm-brugal-extra-viejo', name: 'Brugal Extra Viejo', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/rum.png', stockItemId: 'inv-brugal-extra-viejo', stockConsumption: 1, ingredients: [] },
  { id: 'm-vodka', name: 'Vodka', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/vodka.png', stockItemId: 'inv-vodka', stockConsumption: 1, ingredients: [] },
  { id: 'm-malibu', name: 'Malibú', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/coconut-cocktail.png', stockItemId: 'inv-malibu', stockConsumption: 1, ingredients: [] },
  { id: 'm-ballantines', name: 'Ballantine\'s', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/whisky.png', stockItemId: 'inv-ballantines', stockConsumption: 1, ingredients: [] },
  { id: 'm-chivas', name: 'Chivas Regal', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/whisky.png', stockItemId: 'inv-chivas', stockConsumption: 1, ingredients: [] },
  { id: 'm-licor-43', name: 'Licor 43', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/liqueur.png', stockItemId: 'inv-licor-43', stockConsumption: 1, ingredients: [] },
  { id: 'm-jdb', name: 'J&B', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/whisky.png', stockItemId: 'inv-jdb', stockConsumption: 1, ingredients: [] },
  { id: 'm-bombay-sapphire', name: 'Bombay Sapphire', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/gin.png', stockItemId: 'inv-bombay-sapphire', stockConsumption: 1, ingredients: [] },
  { id: 'm-fireball', name: 'Fireball', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/whisky.png', stockItemId: 'inv-fireball', stockConsumption: 1, ingredients: [] },
  { id: 'm-baileys', name: 'Baileys', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/liqueur.png', stockItemId: 'inv-baileys', stockConsumption: 1, ingredients: [] },
  { id: 'm-brugal-anejo', name: 'Brugal Añejo', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/rum.png', stockItemId: 'inv-brugal-anejo', stockConsumption: 1, ingredients: [] },
  { id: 'm-belvedere', name: 'Belvedere', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/vodka.png', stockItemId: 'inv-belvedere', stockConsumption: 1, ingredients: [] },
  { id: 'm-negroni', name: 'Negrita', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/rum.png', stockItemId: 'inv-negroni', stockConsumption: 1, ingredients: [] },
  { id: 'm-puerto-de-indias', name: 'Puerto de Indias', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/gin.png', stockItemId: 'inv-puerto-de-indias', stockConsumption: 1, ingredients: [] },
  { id: 'm-ron-barcelo', name: 'Ron Barceló', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/rum.png', stockItemId: 'inv-ron-barcelo', stockConsumption: 1, ingredients: [] },
  { id: 'm-anis-del-mono', name: 'Anís del Mono', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/liqueur.png', stockItemId: 'inv-anis-del-mono', stockConsumption: 1, ingredients: [] },
  { id: 'm-black-label', name: 'Black Label', price: 3, categoryId: 'cat-vino', imageUrl: 'https://img.icons8.com/color/48/whisky.png', stockItemId: 'inv-black-label', stockConsumption: 1, ingredients: [] },
];

export const mockTables: Table[] = [
  { id: 't1', number: 1, area: 'Bar', shape: 'square', x: 10, y: 10, width: 10, height: 10 },
  { id: 't2', number: 2, area: 'Bar', shape: 'square', x: 30, y: 10, width: 10, height: 10 },
  { id: 't3', number: 10, area: 'VIP', shape: 'circle', x: 20, y: 30, width: 15, height: 15 },
  { id: 't4', number: 20, area: 'Barra', shape: 'rectangle', x: 5, y: 50, width: 40, height: 8 },
  { id: 't5', number: 30, area: 'Gaming', shape: 'square', x: 70, y: 20, width: 12, height: 12 },
  { id: 'fixture1', number: 99, area: 'Bar', shape: 'fixture', x: 50, y: 50, width: 20, height: 5 },
];

export const mockRestaurantSettings: RestaurantSettings = {
  name: 'SHISHA MARRAKECH',
  address: 'Caller huelva N5 Terrassa',
  phone: '698-231-260',
  footer: '¡Gracias por su visita!',
  logoUrl: 'https://i.imgur.com/K073x4c.png'
};