# interactiverpgmap
InteractiveRpgMap – fullscreen &amp; minimap core w/ player marker, smooth pan, scalable tile mapping, window design modes, addon API

Documentaiton found here: https://github.com/Lonsdale201/rpgmakermyplugins/wiki

# Interactive RPG Map – Plugin Setup Guide

## 🔃 Plugin Load Order

It is **critical** to maintain the following load order in your **Plugin Manager**, especially if you're using interactive map features:

0. `Gamemory` *(optional)*  
1. `InteractiveRpgMap`  *(required)*
2. `InteractiveMapElements` *(optional)*  
3. `InteractiveMapNpc` *(optional)*  
4. `InteractiveMapManager` *(optional)*  
5. `InteractiveMapUserMarkers` *(optional)*  
6. `InteractiveMapRouter` *(optional)* 
7. `InteractiveMapNotes` *(optional)* 
8. `InteractiveRpgMapControls` *(required)*

---

## ✅ Minimal Setup

To get started, you only need:

- `InteractiveRpgMap`
- `InteractiveRpgMapControls`

You **do not need** the other plugins unless you want features like:

- Clickable Points of Interest (POI)
- NPC overlays on the map
- Advanced navigation and map switching
- Interactive portrait windows
- Plactable custom markers
- Route creator

---

## ⚠ Why You Need `InteractiveRpgMapControls`

The `InteractiveRpgMapControls` plugin is **required** because it defines:

- What key or button opens the map
- Whether the map is accessible from the menu
- Zoom and navigation shortcuts
- Navigate between maps
- Hide routes 
- etc

> ⚠️ Without this plugin, the map cannot be opened — unless you call it manually via a **Plugin Command**.

---

## 🚀 Next Step: Configuration Guide

Once you've installed the two required plugins, go to the official setup guide:

👉 [**Interactive Rpg Map (Core) – Setup Instructions**](https://github.com/Lonsdale201/rpgmakermyplugins/wiki/Interactive-Rpg-Map-(Core))

In this guide, you'll learn how to:

- Link in-game maps to their editor names
- Add custom full-map images
- Configure zoom, tracking, and marker behavior
- Customize the map UI with custom frames, skins, and overlays

---

## 🧩 Optional Plugins

| Plugin Name             | Description |
|-------------------------|-------------|
| `InteractiveMapElements` | Add static POIs (e.g. towns, doors) with click interaction |
| `InteractiveMapNpc`      | Shows live NPCs/events from the current map |
| `InteractiveMapManager`  | Enables map-to-map navigation, teleport logic, fast-travel buttons |
| `InteractiveMapUserMarkers`  | Players can place their own pins on the maps. |
| `InteractiveMapRouter`  | Simple route marker like a basic GPS |

---

_This document is part of the **Interactive RPG Map plugin suite** maintained by **Lonsdale**._  
📁 [GitHub Repo](https://github.com/Lonsdale201/rpgmakermyplugins)
