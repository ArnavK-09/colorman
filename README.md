<h1 align="center">🎨 Colorman [VIBECODE] 🎨</h1>
<h2 align="center">A modern GNOME color palette and inspector</h2>

<p align="center">
    <img alt="hero" width="450" src="https://emoji-route.deno.dev/svg/🎨" />
</p>

> [!NOTE]
>
> **Colorman** is a native GNOME 50 desktop app for browsing Tailwind CSS v4 colors and inspecting them in multiple formats (hex, RGB, HSL, OKLCH). It is built with **TypeScript**, **GJS**, **GTK 4**, and **libadwaita**, with UI defined in **Blueprint** (`.blp`) and bundled via **GResource**. The project started from a minimal GNOME TypeScript template and was reshaped into a focused two-page app: a scrollable color grid and a synced color inspector with reverse Tailwind token lookup.

## ⬇️ Download & install

**Version `0.0.69`** · **License: [Unlicense](LICENSE)**

No build tools needed — only **GNOME runtime** (`gjs`, `gtk4`, `libadwaita`).

### Fastest — one command

```bash
curl -fsSL https://github.com/ArnavK-09/colorman/releases/download/v0.0.69/install.sh | bash
```

Then open **Colorman** from Overview search, or run:

```bash
org.gnome.Colorman
```

### Manual — pre-built bundle (like an installer)

1. Open **[GitHub Releases → v0.0.69](https://github.com/ArnavK-09/colorman/releases/tag/v0.0.69)**
2. Download the tarball for your CPU:
   - `colorman-0.0.69-linux-x86_64.tar.gz`
   - `colorman-0.0.69-linux-aarch64.tar.gz`
3. Extract and install:

```bash
tar xzf colorman-0.0.69-linux-x86_64.tar.gz
cd colorman-0.0.69-linux-x86_64
./install.sh
```

Installs to `~/.local` (app menu + dock). System-wide: `sudo ./install.sh /usr`


### Developers — build from source

```bash
git clone https://github.com/ArnavK-09/colorman.git
cd colorman && git checkout v0.0.69
bun install && bun run install-app
```

### Uninstall

**One command** (default `~/.local`):

```bash
curl -fsSL https://raw.githubusercontent.com/ArnavK-09/colorman/master/scripts/uninstall-release.sh | bash
```

Or from a release bundle folder:

```bash
./uninstall.sh
```

System-wide install (`/usr`):

```bash
curl -fsSL https://raw.githubusercontent.com/ArnavK-09/colorman/master/scripts/uninstall-release.sh | sudo bash -s -- /usr
```

**Local dev install:**

```bash
bun run uninstall
```

Then restart GNOME Shell (**Alt+F2** → `r`) if the app still appears in search.

---

## 🌟 Features

> **Colorman** features intro:

- **Color Palette** – Browse all 286 Tailwind v4 preset colors in a responsive grid; click any swatch to inspect it.
- **Color Inspector** – Editable hex, RGB, HSL, OKLCH, and token fields that stay in sync; live preview swatch and Tailwind metadata reverse-lookup.
- **GNOME-native shell** – `Adw.ToolbarView` + header `ViewSwitcher` navigation (Extensions-style), About dialog via header info button.
- **TypeScript-first** – Strict typing with `@girs/*` for GJS/GTK introspection; compile to JS via `tsc`, load from GResource at runtime.
- **Blueprint UI** – Declarative `.blp` templates compiled to GtkBuilder XML, colocated with each page’s TypeScript logic.
- **Hot-reload dev** – `bun run dev` watches `src/` and `logo.svg`, rebuilds, and restarts the app automatically.
- **Dual run modes** – Pre-built GitHub release (no compile) or dev build via Meson.

---

## 🏗️ How the app was built

Colorman follows the standard **GNOME application architecture** for GJS apps:

1. **Blueprint** defines widgets and layout (`.blp` → `.ui`).
2. **TypeScript** implements behavior; classes use `GObject.registerClass` with `Template: "resource:///…"` pointing at compiled UI.
3. **`tsc`** emits JavaScript into `dist/`.
4. **`glib-compile-resources`** packs `dist/*.js` and `build/blueprint/**/*.ui` into three bundles:
   - `colorman.src.gresource` – application code
   - `colorman.data.gresource` – UI templates
   - `colorman.icons.gresource` – app icons for in-process icon lookup
5. **GJS** loads bundles, registers them with `Gio.resources_register`, and imports `main.js` from `resource:///org/gnome/Colorman/js/main.js`.
6. **`Adw.Application`** (`application_id: org.gnome.Colorman`) owns the lifecycle; **`ColormanWindow`** hosts an `Adw.ViewStack` with palette and inspector pages.

Navigation flow: **Palette** emits a `color-selected` signal → window switches to **Inspector** tab → `setColor()` fills all format rows and reverse-lookups the Tailwind token.

### Documentation references

| Topic                    | URL                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------- |
| GJS guide                | https://gjs.guide/                                                                 |
| GTK 4 API                | https://docs.gtk.org/gtk4/                                                         |
| libadwaita               | https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/                          |
| Blueprint compiler       | https://gnome.pages.gitlab.gnome.org/blueprint-compiler/                           |
| GResource                | https://docs.gtk.org/gio/resource.html                                             |
| GNOME app ID conventions | https://wiki.gnome.org/Projects/GnomeShell/ApplicationBased                        |
| Icon theme layout        | https://specifications.freedesktop.org/icon-theme-spec/icon-theme-spec-latest.html |
| Meson                    | https://mesonbuild.com/                                                            |
| Tailwind CSS v4 colors   | https://tailwindcss.com/docs/colors                                                |
| TypeScript               | https://www.typescriptlang.org/docs/                                               |

---

## 🗂️ Project structure

```
colorman/
├── logo.svg                    # Single source of truth for the app icon
├── package.json                # Bun scripts and @girs devDependencies
├── tsconfig.json               # TypeScript → dist/ (rootDir: src, outDir: dist)
├── meson.build                 # Top-level Meson project (install, post_install)
│
├── src/                        # All application source
│   ├── main.ts                 # Entry: pkg init, ColormanApplication.runAsync()
│   ├── application.ts          # Adw.Application, app id, default icon, quit action
│   ├── window/
│   │   ├── window.blp          # Shell: ToolbarView, HeaderBar, ViewSwitcher, ViewStack
│   │   └── window.ts           # Page registration, palette→inspector navigation, AboutDialog
│   ├── pages/
│   │   ├── color-pallete/
│   │   │   ├── index.blp       # Tailwind color grid UI
│   │   │   └── index.ts        # Grid of swatches, emits color-selected
│   │   └── color-inspector/
│   │       ├── index.blp       # Editable format rows + preview swatch
│   │       └── index.ts        # Synced editors, debounced updates, metadata lookup
│   ├── color/
│   │   ├── types.ts            # ColorSelection and shared types
│   │   ├── convert.ts          # hex ↔ rgb ↔ hsl ↔ oklch conversions
│   │   └── tailwind-lookup.ts  # Reverse index: RGBA/OKLCH → Tailwind token name
│   ├── data/
│   │   └── tailwind-colors.ts  # All Tailwind v4 preset colors (generated dataset)
│   ├── org.gnome.Colorman.in   # Production launcher script (Meson configure → bindir)
│   ├── org.gnome.Colorman.src.gresource.xml   # Maps dist/*.js into JS gresource
│   ├── org.gnome.Colorman.data.gresource.xml  # Maps compiled .ui files into UI gresource
│   ├── org.gnome.Colorman.icons.gresource.xml # Maps build/icons into icon gresource
│   └── meson.build             # Blueprint compile, gresource install, launcher binary
│
├── scripts/
│   ├── build-resources.ts      # Icons sync, blueprint compile, gresource build
│   ├── dev.ts                  # File watcher + auto rebuild/restart
│   └── launcher.mjs            # Dev entry: register gresources, import main.js
│
├── data/                       # Installed app metadata (Meson)
│   ├── org.gnome.Colorman.desktop.in    # Desktop entry (Icon, Exec, DBusActivatable)
│   ├── org.gnome.Colorman.metainfo.xml.in
│   ├── org.gnome.Colorman.gschema.xml   # GSettings schema placeholder
│   ├── org.gnome.Colorman.service.in    # D-Bus .service for DBusActivatable
│   └── meson.build             # Installs desktop, metainfo, icons, schema, service
│
├── subprojects/
│   └── blueprint-compiler.wrap # Meson subproject for production blueprint compile
│
├── dist/                       # Generated: tsc output (gitignored)
└── build/                      # Generated: blueprint .ui, gresources, icons (gitignored)
```

### Generated paths (not committed)

| Path                         | Produced by                                  | Used for                                 |
| ---------------------------- | -------------------------------------------- | ---------------------------------------- |
| `dist/**/*.js`               | `bun run build` (`tsc`)                      | Source for `colorman.src.gresource`      |
| `build/blueprint/**/*.ui`    | `blueprint-compiler` in `build-resources.ts` | Source for `colorman.data.gresource`     |
| `build/colorman.*.gresource` | `glib-compile-resources`                     | Dev launcher loads from `build/`         |
| `build/icons/hicolor/...`    | `syncIcons()` in `build-resources.ts`        | GResource icons + Meson symbolic install |

---

## 🌈 Tailwind color data

Colorman does **not** parse Tailwind at runtime. All preset colors live in a static TypeScript dataset: `src/data/tailwind-colors.ts`.

### Dataset shape

| Export              | Contents                                       |
| ------------------- | ---------------------------------------------- |
| `TAILWIND_FAMILIES` | 26 color families (`red`, `orange`, … `olive`) |
| `TAILWIND_SHADES`   | 11 shades per family (`50`, `100`, … `950`)    |
| `TAILWIND_COLORS`   | Nested map: `family → shade → oklch string`    |

**286 colors total** (26 × 11). Each value is a Tailwind CSS v4 **OKLCH** string, e.g.:

```ts
red: {
  500: "oklch(63.7% 0.237 25.331)",
}
```

Source of truth: [Tailwind CSS v4 default palette](https://tailwindcss.com/docs/colors). The file is committed as-is; update it manually when Tailwind adds or changes presets.

### How colors flow through the app

```
tailwind-colors.ts (OKLCH strings)
        │
        ├─► Color Palette
        │     Gtk.CssProvider assigns each swatch:
        │     #swatch-{family}-{shade} { background-color: oklch(...); }
        │     Click → ColorSelection { family, shade, token, oklch }
        │
        └─► Color Inspector + convert.ts
              parseOklch() → Gdk.RGBA
              rgbaToHex / rgbaToRgbString / rgbaToHslString / rgbaToOklchString
              cssColor() → preview swatch background via CssProvider
```

### Reverse lookup (`src/color/tailwind-lookup.ts`)

At module load, two hash maps are built from `TAILWIND_COLORS`:

1. **`oklchLookup`** — normalized OKLCH string → `ColorMeta` (token, family, shade, utility class names)
2. **`rgbaLookup`** — lowercase hex → `ColorMeta`

When you edit a color in the inspector:

- `lookupTailwindByOklch(value)` — exact OKLCH match after normalization (`oklch(63.7% 0.237 25.3)` formatting)
- `lookupTailwindByRgba(rgba)` — hex match after conversion
- If OKLCH edit has no exact match, falls back to RGBA hex lookup

`ColorMeta` fills the metadata rows: `bg-red-500`, `text-red-500`, `border-red-500`, `fill-red-500`, `stroke-red-500`.

### Color conversion (`src/color/convert.ts`)

| Function                                                                  | Role                                                                   |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `parseOklch`                                                              | OKLCH string → `Gdk.RGBA` (used everywhere as internal canonical form) |
| `parseHex` / `parseRgb` / `parseHsl`                                      | User input → `Gdk.RGBA`                                                |
| `rgbaToHex` / `rgbaToRgbString` / `rgbaToHslString` / `rgbaToOklchString` | `Gdk.RGBA` → display strings                                           |
| `cssColor`                                                                | `Gdk.RGBA` → CSS `rgb()` / `rgba()` for preview styling                |

Inspector rows stay synced via debounced `notify::text` handlers; the row you are typing in is skipped to avoid feedback loops, and signal handlers are blocked while programmatically updating other rows.

---

## 🧩 UI components

All layout is **Blueprint** (`.blp`) compiled to GtkBuilder `.ui`, loaded via `Template: "resource:///org/gnome/Colorman/…"`. Behavior is wired in matching `.ts` files with `InternalChildren` for named widgets.

### App shell — `src/window/window.blp`

| Widget                      | Role                                                 |
| --------------------------- | ---------------------------------------------------- |
| `Adw.ApplicationWindow`     | Root window (900×640 default)                        |
| `Adw.ToolbarView`           | Header + content shell                               |
| `Adw.HeaderBar`             | Top bar, `centering-policy: strict`                  |
| `Gtk.Button` `about_button` | Start slot; `help-about-symbolic`, flat; opens About |
| `Adw.ViewSwitcher`          | Center tabs; `policy: narrow`; bound to `stack`      |
| `Adw.ViewStack` `stack`     | Holds palette + inspector pages                      |

Programmatic (not in `.blp`): `Adw.AboutDialog` — icon, version, developers, links; presented on about button click.

### Color Palette — `src/pages/color-pallete/`

**Blueprint**

| Widget                      | Role                                  |
| --------------------------- | ------------------------------------- |
| `Gtk.Box`                   | Page root, vertical                   |
| `Gtk.ScrolledWindow`        | Scrollable grid; `edge-to-edge` style |
| `Gtk.Box` `palette_content` | Container for dynamically built grid  |

**Built in TypeScript** (`index.ts`)

| Widget            | Role                                                                    |
| ----------------- | ----------------------------------------------------------------------- |
| `Gtk.Grid`        | 26 rows × 11 columns of swatches                                        |
| `Gtk.Button`      | Each swatch; classes `flat`, `color-swatch`; `name: swatch-{token}`     |
| `Gtk.CssProvider` | Injects swatch sizes, hover scale, and all 286 `background-color` rules |

Signal: `color-selected` → `ColorSelection` object passed to window.

### Color Inspector — `src/pages/color-inspector/`

**Blueprint**

| Widget                                 | Role                                                                                    |
| -------------------------------------- | --------------------------------------------------------------------------------------- |
| `Gtk.ScrolledWindow`                   | Scrollable page body                                                                    |
| `Gtk.Box` `color_preview`              | 220×220 preview; classes `card`, `color-preview-swatch`                                 |
| `Gtk.Label` `token_display`            | Token title below preview; `title-2` style                                              |
| `Adw.PreferencesGroup` `formats_group` | Editable color formats                                                                  |
| `Adw.EntryRow`                         | `hex_row`, `rgb_row`, `hsl_row`, `oklch_row`, `token_row`                               |
| `Adw.PreferencesGroup` `meta_group`    | Read-only Tailwind metadata                                                             |
| `Adw.ActionRow`                        | `family_row`, `shade_row`, `bg_row`, `text_row`, `border_row`, `fill_row`, `stroke_row` |

**Runtime styling**

| Mechanism                    | Role                                                              |
| ---------------------------- | ----------------------------------------------------------------- |
| `Gtk.CssProvider` on display | Sets `.color-preview-swatch { background-color: … }`              |
| `map` signal on preview      | Re-applies CSS when widget becomes visible (first navigation fix) |

### libadwaita vs GTK split

| Layer          | Used for                                                                        |
| -------------- | ------------------------------------------------------------------------------- |
| **libadwaita** | Window shell, header, tabs, preferences groups, entry/action rows, About dialog |
| **GTK 4**      | Boxes, grid, buttons, labels, scrolled windows, CSS providers                   |

This matches the GNOME HIG pattern used by Settings, Extensions, and similar apps: `Adw.ToolbarView` + header `ViewSwitcher` over an `Adw.ViewStack`.

---

## 🎨 Icons

**One file rules them all:** `logo.svg` at the project root.

On every `bun run build:resources`:

1. **Read** `logo.svg`.
2. **Generate symbolic icon** – extract `<path>` elements, rewrite fills as `currentColor` → `build/icons/hicolor/symbolic/apps/org.gnome.Colorman-symbolic.svg`.
3. **Copy scalable icon** → `build/icons/hicolor/scalable/apps/org.gnome.Colorman.svg`.
4. **Bundle into GResource** – `colorman.icons.gresource` at `/org/gnome/Colorman/icons/...`. GTK resolves this via `resource_base_path: "/org/gnome/Colorman"` on the application (About dialog, in-app icon theme lookup).
5. **Dev install** (when `COLORMAN_INSTALL_DEV_ICONS=1`):
   - Copy both icons to `~/.local/share/icons/hicolor/...`
   - Write `~/.local/share/applications/org.gnome.Colorman.desktop` pointing at the dev launcher
   - Run `gtk-update-icon-cache` and `update-desktop-database`

**Production install** (`bun run install-app`): Meson installs `logo.svg` as the scalable icon and the generated symbolic SVG from `build/icons/`.

**In-app references:**

- `Gtk.Window.set_default_icon_name("org.gnome.Colorman")` in `application.ts`
- `Adw.AboutDialog` → `application_icon: "org.gnome.Colorman"` in `window.ts`
- Desktop entry → `Icon=org.gnome.Colorman`

Replace `logo.svg` and rebuild — icon updates everywhere on next `build:resources` or `dev` cycle.

---

## 🛠️ Development environment

### Two run modes

| Mode          | Command                     | Entry                                         | GResources loaded from             |
| ------------- | --------------------------- | --------------------------------------------- | ---------------------------------- |
| **Dev**       | `bun run dev` / `bun start` | `scripts/launcher.mjs`                        | `build/*.gresource` in project dir |
| **Installed** | `org.gnome.Colorman`        | `src/org.gnome.Colorman.in` → `~/.local/bin/` | Installed datadir bundles          |

### Dev pipeline (`bun run dev`)

```
src/**/*.ts  ──tsc──►  dist/**/*.js
src/**/*.blp ──blueprint-compiler──►  build/blueprint/**/*.ui
logo.svg     ──syncIcons──►         build/icons/ + ~/.local (optional)
                    │
                    ▼
         glib-compile-resources
                    │
                    ▼
    build/colorman.{src,data,icons}.gresource
                    │
                    ▼
         gjs -m scripts/launcher.mjs
                    │
                    ▼
              Colorman window
```

`scripts/dev.ts` watches `src/` (`.ts`, `.blp`, `.svg`) and `logo.svg`. On change it debounces 150ms, runs `build` + `build:resources`, kills the old process, and spawns a fresh `gjs` instance.

`scripts/launcher.mjs` sets `COLORMAN_ROOT` (project root), registers all three gresources, stubs `pkg.initGettext`, and calls `main(["org.gnome.Colorman", ...args])` so GNOME Shell matches the app id to the desktop entry.

### Environment variables

| Variable                     | Set by                                       | Effect                                              |
| ---------------------------- | -------------------------------------------- | --------------------------------------------------- |
| `COLORMAN_ROOT`              | `dev.ts`, `package.json run`, desktop `Exec` | Absolute path to project root for GResource loading |
| `COLORMAN_INSTALL_DEV_ICONS` | `dev`, `run` scripts                         | When `1`, copies icons + desktop file to `~/.local` |

---

## 📜 Bun commands

| Command                   | What it does                                                                                                                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun install`             | Install `@girs/*` type packages and TypeScript from `package.json`.                                                                                                                                         |
| `bun run build`           | Run `tsc`: compile `src/**/*.ts` → `dist/**/*.js`. Required before gresource build.                                                                                                                         |
| `bun run build:resources` | Run `scripts/build-resources.ts`: sync icons from `logo.svg`, compile all `.blp` files, produce three `.gresource` files in `build/`. Does **not** install dev icons unless `COLORMAN_INSTALL_DEV_ICONS=1`. |
| `bun run dev`             | Start file watcher; initial full build + launch; auto-restart on `src/` or `logo.svg` changes. Sets dev icons install flag. **Primary development command.**                                                |
| `bun start`               | Alias for `bun run run`.                                                                                                                                                                                    |
| `bun run run`             | One-shot: `build` → `build:resources` (with dev icons) → launch via `gjs -m scripts/launcher.mjs`. No watch.                                                                                                |
| `bun run setup`           | `meson setup _build --prefix=$HOME/.local` — configure production build directory.                                                                                                                          |
| `bun run install-app`     | Full production path: `build` → `build:resources` → meson compile → meson install to `~/.local`. Installs binary, desktop, metainfo, icons, schema, D-Bus service.                                          |
| `bun run clean`           | Delete `dist/`, `build/`, `_build/`.                                                                                                                                                                        |

Typical workflows:

```bash
# Daily development (hot reload)
bun run dev

# Single run without watcher
bun start

# After changing logo.svg only
COLORMAN_INSTALL_DEV_ICONS=1 bun run build:resources

# Fresh install to app menu
bun run clean && bun run install-app
```

---

## 📦 Publishing (maintainers)

```bash
bun run build:release          # creates release/*.tar.gz + install.sh
git tag v0.0.69 && git push origin v0.0.69   # triggers GitHub Actions release
```

Release assets: pre-built `colorman-0.0.69-linux-*.tar.gz` + `install.sh` (no compile for users). License: **Unlicense**.

---

## 📷 Screenshots

> Here's a working and expected screenshot of Colorman

| Color Palette                             | Color Inspector                           |
| ----------------------------------------- | ----------------------------------------- |
| ![Demo](https://github.com/user-attachments/assets/9b9f7a03-41e3-47d1-b58b-475463540fb1) | ![Demo](https://github.com/user-attachments/assets/3df26cae-7036-4659-ae0c-96c398095dce) |

---

## 💻 Contributing

> [!TIP]  
> We welcome contributions to improve **Colorman**! If you have suggestions, bug fixes, or new feature ideas, follow these steps:

1. **Fork the Repository**  
   Click the **Fork** button at the top-right of the repo page.

2. **Clone Your Fork**  
   Clone the repo locally:

   ```bash
   git clone https://github.com/ArnavK-09/colorman.git
   ```

3. **Create a Branch**  
   Create a new branch for your changes:

   ```bash
   git checkout -b your-feature-branch
   ```

4. **Make Changes**  
   Implement your changes (bug fixes, features, etc.).

5. **Commit and Push**  
   Commit your changes and push the branch:

   ```bash
   git commit -m "feat(scope): description"
   git push origin your-feature-branch
   ```

6. **Open a Pull Request**  
   Open a PR with a detailed description of your changes.

7. **Collaborate and Merge**  
   The maintainers will review your PR, request changes if needed, and merge it once approved.

## 🙋‍♂️ Issues

Found a bug or need help? Please create an issue on the [GitHub repository](https://github.com/ArnavK-09/colorman/issues) with a detailed description.

## 👤 Author

<table>
  <tbody>
    <tr>
        <td align="center" valign="top" width="14.28%"><a href="https://github.com/ArnavK-09"><img src="https://github.com/ArnavK-09.png?s=100" width="130px;" alt="Arnav K"/></a><br /><a href="https://github.com/ArnavK-09"><h4><b>Arnav K</b></h4></a></td>
    </tr>
  </tbody>
</table>

---

<h2 align="center">📄 License</h2>

<p align="center">
<strong>Colorman</strong> is licensed under the <code>Unlicense</code> License. See the <a href="https://github.com/ArnavK-09/colorman/blob/main/LICENSE">LICENSE</a> file for more details.
</p>

---

<p align="center">
    <strong>🌟 If you find this project helpful, please give it a star on GitHub! 🌟</strong>
</p>
