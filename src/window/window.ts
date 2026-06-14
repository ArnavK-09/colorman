import GObject from "gi://GObject";
import Adw from "gi://Adw?version=1";
import Gtk from "gi://Gtk?version=4.0";

import type { ColorSelection } from "../color/types.js";
import { ColorInspectorPage } from "../pages/color-inspector/index.js";
import { ColorPalletePage } from "../pages/color-pallete/index.js";
import { APP_VERSION } from "../version.js";

export const ColormanWindow = GObject.registerClass(
  {
    GTypeName: "ColormanWindow",
    Template: "resource:///org/gnome/Colorman/window/window.ui",
    InternalChildren: ["stack", "about_button"],
  },
  class ColormanWindow extends Adw.ApplicationWindow {
    declare protected _stack: Adw.ViewStack;
    declare protected _about_button: Gtk.Button;
    private _inspector!: InstanceType<typeof ColorInspectorPage>;
    private _aboutDialog!: Adw.AboutDialog;

    constructor(application: Adw.Application) {
      super({ application });

      const palette = new ColorPalletePage();
      this._inspector = new ColorInspectorPage();

      palette.connect(
        "color-selected",
        (_widget, selection: ColorSelection) => {
          this._stack.set_visible_child_name("inspector");
          this._inspector.setColor(selection);
        },
      );

      this.addPage(
        palette,
        "palette",
        "Color Palette",
        "color-palette-symbolic",
      );
      this.addPage(
        this._inspector,
        "inspector",
        "Color Inspector",
        "color-select-symbolic",
      );

      this._aboutDialog = new Adw.AboutDialog({
        application_name: "Colorman [VIBECODE]",
        application_icon: "org.gnome.Colorman",
        version: APP_VERSION,
        developers: ["ArnavK-09", "Cursor"],
        website: "https://github.com/ArnavK-09/colorman",
        issue_url: "https://github.com/ArnavK-09/colorman/issues",
        support_url: "https://github.com/ArnavK-09/colorman/issues",
      });

      this._about_button.connect("clicked", () => {
        this._aboutDialog.present(this);
      });
    }

    private addPage(
      widget: Gtk.Widget,
      name: string,
      title: string,
      iconName: string,
    ): void {
      this._stack.add_titled(widget, name, title);
      this._stack.get_page(widget)?.set_icon_name(iconName);
    }
  },
);
