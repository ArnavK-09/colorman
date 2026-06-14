import GObject from "gi://GObject";
import Gdk from "gi://Gdk?version=4.0";
import Gtk from "gi://Gtk?version=4.0";

import type { ColorSelection } from "../../color/types.js";
import {
  TAILWIND_COLORS,
  TAILWIND_FAMILIES,
  TAILWIND_SHADES,
  type TailwindFamily,
  type TailwindShade,
} from "../../data/tailwind-colors.js";

let paletteCssLoaded = false;

function ensurePaletteCss(): void {
  if (paletteCssLoaded) return;

  const rules = [
    "button.color-swatch { min-width: 2.25rem; min-height: 2.25rem; padding: 0; border-radius: 0.375rem; }",
    "button.color-swatch:hover { transform: translate(0, 0) rotate(0) skewX(0) skewY(0) scaleX(1.05) scaleY(1.05); }",
    ".palette-family { min-width: 5rem; font-weight: 600; }",
    ".palette-shade { opacity: 0.65; font-size: 0.7rem; font-weight: 500; }",
  ];

  for (const family of TAILWIND_FAMILIES) {
    for (const shade of TAILWIND_SHADES) {
      rules.push(
        `#swatch-${family}-${shade} { background-color: ${TAILWIND_COLORS[family][shade]}; }`,
      );
    }
  }

  const display = Gdk.Display.get_default();
  if (!display) return;

  const provider = new Gtk.CssProvider();
  provider.load_from_string(rules.join("\n"));
  Gtk.StyleContext.add_provider_for_display(
    display,
    provider,
    Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
  );
  paletteCssLoaded = true;
}

export const ColorPalletePage = GObject.registerClass(
  {
    GTypeName: "ColorPalletePage",
    Template: "resource:///org/gnome/Colorman/pages/color-pallete/index.ui",
    InternalChildren: ["palette_content"],
    Signals: {
      "color-selected": {
        param_types: [GObject.TYPE_JSOBJECT],
      },
    },
  },
  class ColorPalletePage extends Gtk.Box {
    declare private _palette_content: Gtk.Box;

    constructor() {
      super();
      ensurePaletteCss();
      this.buildPalette();
    }

    private buildPalette(): void {
      const grid = new Gtk.Grid({
        column_spacing: 6,
        row_spacing: 6,
        column_homogeneous: true,
        hexpand: true,
      });

      for (let row = 0; row < TAILWIND_FAMILIES.length; row++) {
        const family = TAILWIND_FAMILIES[row];

        for (let column = 0; column < TAILWIND_SHADES.length; column++) {
          const shade = TAILWIND_SHADES[column];
          grid.attach(
            this.createSwatch(family, shade),
            column + 1,
            row + 1,
            1,
            1,
          );
        }
      }

      this._palette_content.append(grid);
    }

    private createSwatch(
      family: TailwindFamily,
      shade: TailwindShade,
    ): Gtk.Button {
      const token = `${family}-${shade}`;
      const oklch = TAILWIND_COLORS[family][shade];
      const swatch = new Gtk.Button({
        tooltip_text: `${token}\n${oklch}`,
        css_classes: ["flat", "color-swatch"],
        name: `swatch-${token}`,
      });

      swatch.connect("clicked", () => {
        const selection: ColorSelection = { family, shade, token, oklch };
        this.emit("color-selected", selection);
      });

      return swatch;
    }
  },
);
