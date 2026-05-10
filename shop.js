/**
 * shop.js — Professional shop system with categories, rarity, preview
 */
"use strict";

const Shop = (() => {
  const LS_PURCHASED_KEY = "GameZone:purchases";
  const LS_EQUIPPED_KEY = "GameZone:equipped";

  const RARITY = {
    common: { label: "Common", color: "#8b9bb4", multiplier: 1 },
    rare: { label: "Rare", color: "#4aa8ff", multiplier: 1.5 },
    epic: { label: "Epic", color: "#a16bff", multiplier: 2.5 },
    legendary: { label: "Legendary", color: "#ffd36a", multiplier: 4 },
  };

  const ITEMS = [
    // Skins
    { id: "skin_neon", name: "Neon Snake", category: "skins", rarity: "rare", price: 500, desc: "Glowing neon trail", preview: "🟢🔵🟣" },
    { id: "skin_rainbow", name: "Rainbow Snake", category: "skins", rarity: "epic", price: 1200, desc: "Color-shifting body", preview: "🌈" },
    { id: "skin_dragon", name: "Dragon Snake", category: "skins", rarity: "legendary", price: 3000, desc: "Fire-breathing dragon", preview: "🐉" },
    { id: "skin_galaxy", name: "Galaxy Snake", category: "skins", rarity: "legendary", price: 5000, desc: "Starfield pattern", preview: "🌌" },
    { id: "skin_pixel", name: "Pixel Art", category: "skins", rarity: "common", price: 200, desc: "Retro pixel look", preview: "👾" },
    { id: "skin_ghost", name: "Ghost", category: "skins", rarity: "rare", price: 700, desc: "Transparent ghostly", preview: "👻" },
    { id: "theme_sunset", name: "Sunset Theme", category: "skins", rarity: "rare", price: 600, desc: "Warm orange tones", preview: "🌅" },
    { id: "theme_ocean", name: "Ocean Theme", category: "skins", rarity: "epic", price: 1500, desc: "Deep blue aesthetic", preview: "🌊" },
    // Power-ups
    { id: "power_shield", name: "Shield", category: "powerups", rarity: "rare", price: 400, desc: "Block one wrong answer", preview: "🛡️" },
    { id: "power_freeze", name: "Time Freeze", category: "powerups", rarity: "epic", price: 800, desc: "Stop timer for 10s", preview: "❄️" },
    { id: "power_double", name: "Double XP", category: "powerups", rarity: "rare", price: 600, desc: "2x XP for next game", preview: "⚡" },
    { id: "power_hint", name: "Hint", category: "powerups", rarity: "common", price: 150, desc: "Remove 2 wrong answers", preview: "💡" },
    { id: "power_revive", name: "Revive", category: "powerups", rarity: "epic", price: 1000, desc: "Continue after game over", preview: "💖" },
    { id: "power_magnet", name: "Coin Magnet", category: "powerups", rarity: "legendary", price: 2500, desc: "2x coins for 1 hour", preview: "🧲" },
    // Themes
    { id: "theme_cyberpunk", name: "Cyberpunk", category: "themes", rarity: "epic", price: 2000, desc: "Neon city vibes", preview: "🌃" },
    { id: "theme_nature", name: "Nature", category: "themes", rarity: "rare", price: 800, desc: "Green forest theme", preview: "🌿" },
    { id: "theme_space", name: "Space", category: "themes", rarity: "legendary", price: 4000, desc: "Galaxy background", preview: "🚀" },
    { id: "theme_retro", name: "Retro Arcade", category: "themes", rarity: "rare", price: 700, desc: "80s arcade style", preview: "🕹️" },
    // Special
    { id: "special_vip", name: "VIP Badge", category: "special", rarity: "legendary", price: 10000, desc: "Exclusive VIP status", preview: "👑" },
    { id: "special_namecolor", name: "Gold Name", category: "special", rarity: "epic", price: 3000, desc: "Golden username", preview: "✨" },
    { id: "special_extralife", name: "Extra Life", category: "special", rarity: "rare", price: 1500, desc: "+1 max heart permanently", preview: "❤️" },
    { id: "special_luckycharm", name: "Lucky Charm", category: "special", rarity: "epic", price: 2000, desc: "+10% coin bonus", preview: "🍀" },
  ];

  let purchased = new Set();
  let equipped = {};

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_PURCHASED_KEY) || "[]");
      purchased = new Set(saved);
      equipped = JSON.parse(localStorage.getItem(LS_EQUIPPED_KEY) || "{}");
    } catch (_) {}
  }

  function save() {
    localStorage.setItem(LS_PURCHASED_KEY, JSON.stringify([...purchased]));
    localStorage.setItem(LS_EQUIPPED_KEY, JSON.stringify(equipped));
  }

  function getItems(category) {
    if (!category || category === 'all') return ITEMS;
    return ITEMS.filter(item => item.category === category);
  }

  function isPurchased(itemId) { return purchased.has(itemId); }
  function isEquipped(itemId) { return Object.values(equipped).includes(itemId); }

  function buy(itemId, playerCoins) {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return { success: false, error: "Item not found" };
    if (purchased.has(itemId)) return { success: false, error: "Already owned" };
    if (playerCoins < item.price) return { success: false, error: "Not enough coins" };
    purchased.add(itemId);
    save();
    return { success: true, item, cost: item.price };
  }

  function equip(itemId) {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item || !purchased.has(itemId)) return false;
    equipped[item.category] = itemId;
    save();
    return true;
  }

  function renderShop(container, category, playerCoins) {
    if (!container) return;
    const items = getItems(category);
    container.innerHTML = '';
    
    items.forEach(item => {
      const owned = isPurchased(item.id);
      const isEq = isEquipped(item.id);
      const rarity = RARITY[item.rarity];
      
      const div = document.createElement('div');
      div.className = `shop-item ${item.rarity} ${owned ? 'owned' : ''} ${isEq ? 'equipped' : ''}`;
      div.innerHTML = `
        <div class="item-rarity-bar" style="background: ${rarity.color}"></div>
        <span class="item-preview">${item.preview}</span>
        <div class="item-info">
          <strong class="item-name">${item.name}</strong>
          <small class="item-desc">${item.desc}</small>
          <span class="item-rarity-label" style="color: ${rarity.color}">${rarity.label}</span>
        </div>
        <div class="item-action">
          ${owned 
            ? (isEq 
              ? '<button class="btn btn-sm equipped-btn" disabled>Equipped</button>' 
              : `<button class="btn btn-sm btn-accent equip-btn" data-id="${item.id}">Equip</button>`)
            : `<button class="btn btn-sm btn-primary buy-btn" data-id="${item.id}" ${playerCoins < item.price ? 'disabled' : ''}>
                <img src="assets/coin.png" class="coin-icon-sm" alt="" /> ${item.price}
              </button>`
          }
        </div>
      `;
      container.appendChild(div);
    });
  }

  load();

  return {
    getItems,
    isPurchased,
    isEquipped,
    buy,
    equip,
    renderShop,
    ITEMS,
    RARITY,
  };
})();

window.Shop = Shop;
