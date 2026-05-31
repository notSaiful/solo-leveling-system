# Solo Leveling System — Obsidian Vault

This folder is configured as an **Obsidian vault**.

## How to Open in Obsidian

1. Download Obsidian from https://obsidian.md
2. Open Obsidian → "Open folder as vault"
3. Select this folder: `/Users/saiful/solo-leveling-system`
4. The vault is ready to use

## Vault Structure

```
solo-leveling-system/
├── CLAUDE.md                  ← Start here (Project Brain)
├── OBSIDIAN_VAULT_README.md   ← This file
├── memory/                    ← Complete Claude memory (user profile + all projects)
│   ├── user_profile.md
│   ├── solo-leveling-system.md
│   ├── agentive-platform.md
│   ├── halal-stock-agent.md
│   ├── geowind-india-project.md
│   ├── ai-personalized-medicine.md
│   ├── langsmith-sarah-integration.md
│   └── MEMORY.md              ← Index of all memories
├── src/                       ← Source code
├── ios/                       ← Capacitor iOS project
├── supabase/                  ← Database schema
├── .github/workflows/          ← CI/CD automation
├── build-ios-ipa.sh          ← Automated IPA builder
└── .obsidian/                 ← Obsidian settings (auto-managed)
```

## Key Notes

- **CLAUDE.md** is the main project instruction file — contains purpose, architecture, completed work, pending tasks, and development guidelines
- **memory/** contains the complete Claude persistent memory (user profile + all projects) — accessible via Obsidian graph and search
- All code is in `src/` — the vault is primarily for project documentation
- You can create additional notes in the root or a `docs/` folder
- Wiki-links like `[[CLAUDE.md]]` work for cross-referencing

## Useful Obsidian Plugins (Optional)

- **Dataview** — Query project metadata
- **Kanban** — Track pending tasks
- **Graph View** — Visualize note relationships

---

*Open `CLAUDE.md` to begin exploring the project.*
