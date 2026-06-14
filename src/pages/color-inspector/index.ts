import GObject from "gi://GObject";
import Gdk from "gi://Gdk?version=4.0";
import GLib from "gi://GLib?version=2.0";
import Gtk from "gi://Gtk?version=4.0";
import Adw from "gi://Adw?version=1";

import {
  cssColor,
  parseHex,
  parseHsl,
  parseOklch,
  parseRgb,
  rgbaToHex,
  rgbaToHslString,
  rgbaToOklchString,
  rgbaToRgbString,
} from "../../color/convert.js";
import {
  lookupTailwindByOklch,
  lookupTailwindByRgba,
  metaFromToken,
} from "../../color/tailwind-lookup.js";
import type { ColorMeta, ColorSelection } from "../../color/types.js";
import {
  TAILWIND_COLORS,
  type TailwindFamily,
  type TailwindShade,
} from "../../data/tailwind-colors.js";

export const ColorInspectorPage = GObject.registerClass(
  {
    GTypeName: "ColorInspectorPage",
    Template: "resource:///org/gnome/Colorman/pages/color-inspector/index.ui",
    InternalChildren: [
      "color_preview",
      "token_display",
      "hex_row",
      "rgb_row",
      "hsl_row",
      "oklch_row",
      "token_row",
      "family_row",
      "shade_row",
      "bg_row",
      "text_row",
      "border_row",
      "fill_row",
      "stroke_row",
    ],
  },
  class ColorInspectorPage extends Gtk.Box {
    declare private _color_preview: Gtk.Box;
    declare private _token_display: Gtk.Label;
    declare private _hex_row: Adw.EntryRow;
    declare private _rgb_row: Adw.EntryRow;
    declare private _hsl_row: Adw.EntryRow;
    declare private _oklch_row: Adw.EntryRow;
    declare private _token_row: Adw.EntryRow;
    declare private _family_row: Adw.ActionRow;
    declare private _shade_row: Adw.ActionRow;
    declare private _bg_row: Adw.ActionRow;
    declare private _text_row: Adw.ActionRow;
    declare private _border_row: Adw.ActionRow;
    declare private _fill_row: Adw.ActionRow;
    declare private _stroke_row: Adw.ActionRow;

    private _rgba = new Gdk.RGBA();
    private _meta: ColorMeta | null = null;
    private _previewProvider = new Gtk.CssProvider();
    private _previewCssAttached = false;
    private _previewColor = "#808080";
    private _textHandlers = new Map<Adw.EntryRow, number>();
    private _debounceSource = 0;

    constructor() {
      super();
      this._rgba.alpha = 1;
      this.bindRows();
    }

    vfunc_constructed(): void {
      super.vfunc_constructed();
      this._color_preview?.connect("map", () => {
        this.applyPreviewCss(this._previewColor);
      });
    }

    setColor(selection: ColorSelection): void {
      const rgba = parseOklch(selection.oklch);
      if (!rgba) return;

      this._meta = metaFromToken(selection.family, selection.shade);

      this.applyRgba(rgba);
    }

    private bindRows(): void {
      this.bindEntryRow(this._hex_row, (value) =>
        this.applyFromHex(value, this._hex_row),
      );
      this.bindEntryRow(this._rgb_row, (value) =>
        this.applyFromRgb(value, this._rgb_row),
      );
      this.bindEntryRow(this._hsl_row, (value) =>
        this.applyFromHsl(value, this._hsl_row),
      );
      this.bindEntryRow(this._oklch_row, (value) =>
        this.applyFromOklch(value, this._oklch_row),
      );
      this.bindEntryRow(this._token_row, (value) =>
        this.applyFromToken(value, this._token_row),
      );
    }

    private bindEntryRow(
      row: Adw.EntryRow,
      apply: (value: string) => void,
    ): void {
      const handler = row.connect("notify::text", () => {
        if (this._debounceSource) GLib.source_remove(this._debounceSource);

        this._debounceSource = GLib.timeout_add(
          GLib.PRIORITY_DEFAULT,
          120,
          () => {
            this._debounceSource = 0;
            apply(row.text);
            return GLib.SOURCE_REMOVE;
          },
        );
      });

      this._textHandlers.set(row, handler);

      row.connect("apply", () => {
        if (this._debounceSource) {
          GLib.source_remove(this._debounceSource);
          this._debounceSource = 0;
        }
        apply(row.text);
      });
    }

    private setRowText(row: Adw.EntryRow, text: string): void {
      const handler = this._textHandlers.get(row);
      if (handler !== undefined) GObject.signal_handler_block(row, handler);
      row.text = text;
      if (handler !== undefined) GObject.signal_handler_unblock(row, handler);
    }

    private applyFromHex(value: string, sourceRow: Adw.EntryRow): void {
      const rgba = parseHex(value);
      if (!rgba) return;
      this.applyRgba(rgba, sourceRow);
    }

    private applyFromRgb(value: string, sourceRow: Adw.EntryRow): void {
      const rgba = parseRgb(value);
      if (!rgba) return;
      this.applyRgba(rgba, sourceRow);
    }

    private applyFromHsl(value: string, sourceRow: Adw.EntryRow): void {
      const rgba = parseHsl(value);
      if (!rgba) return;
      this.applyRgba(rgba, sourceRow);
    }

    private applyFromOklch(value: string, sourceRow: Adw.EntryRow): void {
      const rgba = parseOklch(value);
      if (!rgba) return;
      this.applyRgba(rgba, sourceRow, value);
    }

    private applyFromToken(value: string, sourceRow: Adw.EntryRow): void {
      const token = value.trim();
      const match = token.match(/^([a-z]+)-(\d+)$/);
      if (!match) return;

      const family = match[1] as TailwindFamily;
      const shade = Number.parseInt(match[2], 10) as TailwindShade;
      const oklch = TAILWIND_COLORS[family]?.[shade];
      if (!oklch) return;

      this._meta = metaFromToken(family, shade);

      const rgba = parseOklch(oklch);
      if (!rgba) return;

      this.applyRgba(rgba, sourceRow, oklch);
    }

    private applyRgba(
      rgba: Gdk.RGBA,
      sourceRow?: Adw.EntryRow,
      oklchInput?: string,
    ): void {
      this._rgba.red = rgba.red;
      this._rgba.green = rgba.green;
      this._rgba.blue = rgba.blue;
      this._rgba.alpha = rgba.alpha;

      this._meta = oklchInput
        ? (lookupTailwindByOklch(oklchInput) ??
          lookupTailwindByRgba(this._rgba))
        : lookupTailwindByRgba(this._rgba);

      this.applyPreviewCss(cssColor(this._rgba));
      this.syncFields(sourceRow);
      this.syncMeta();
    }

    private syncFields(sourceRow?: Adw.EntryRow): void {
      if (sourceRow !== this._hex_row) {
        this.setRowText(this._hex_row, rgbaToHex(this._rgba));
      }
      if (sourceRow !== this._rgb_row) {
        this.setRowText(this._rgb_row, rgbaToRgbString(this._rgba));
      }
      if (sourceRow !== this._hsl_row) {
        this.setRowText(this._hsl_row, rgbaToHslString(this._rgba));
      }
      if (sourceRow !== this._oklch_row) {
        this.setRowText(this._oklch_row, rgbaToOklchString(this._rgba));
      }

      if (this._meta) {
        if (sourceRow !== this._token_row) {
          this.setRowText(this._token_row, this._meta.token);
        }
        this._token_display.label = this._meta.token;
      } else if (sourceRow !== this._token_row) {
        this.setRowText(this._token_row, "");
        this._token_display.label = rgbaToHex(this._rgba);
      }
    }

    private syncMeta(): void {
      const empty = "—";

      this._family_row.subtitle = this._meta?.family ?? empty;
      this._shade_row.subtitle = this._meta?.shade ?? empty;
      this._bg_row.subtitle = this._meta?.tailwindBg ?? empty;
      this._text_row.subtitle = this._meta?.tailwindText ?? empty;
      this._border_row.subtitle = this._meta?.tailwindBorder ?? empty;
      this._fill_row.subtitle = this._meta?.tailwindFill ?? empty;
      this._stroke_row.subtitle = this._meta?.tailwindStroke ?? empty;
    }

    private applyPreviewCss(color: string): void {
      this._previewColor = color;
      this._previewProvider.load_from_string(
        `.color-preview-swatch { background-color: ${color}; border-radius: 12px; min-width: 220px; min-height: 220px; }`,
      );

      if (!this._previewCssAttached) {
        const display = Gdk.Display.get_default();
        if (display) {
          Gtk.StyleContext.add_provider_for_display(
            display,
            this._previewProvider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
          );
          this._previewCssAttached = true;
        }
      }

      if (this._color_preview.get_mapped()) {
        this._color_preview.queue_draw();
      }
    }
  },
);
