import GObject from "gi://GObject";
import Gio from "gi://Gio";
import Adw from "gi://Adw?version=1";
import Gtk from "gi://Gtk?version=4.0";

import { ColormanWindow } from "./window/window.js";

export const ColormanApplication = GObject.registerClass(
  class ColormanApplication extends Adw.Application {
    constructor() {
      super({
        application_id: "org.gnome.Colorman",
        flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
        resource_base_path: "/org/gnome/Colorman",
      });

      Gtk.Window.set_default_icon_name("org.gnome.Colorman");

      const quitAction = new Gio.SimpleAction({ name: "quit" });
      quitAction.connect("activate", () => this.quit());
      this.add_action(quitAction);
      this.set_accels_for_action("app.quit", ["<control>q"]);
    }

    vfunc_activate() {
      let { active_window } = this;

      if (!active_window) active_window = new ColormanWindow(this);

      active_window.present();
    }
  },
);
