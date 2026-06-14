import Gio from "gi://Gio";
import GLib from "gi://GLib";
import { exit, programArgs } from "system";

const root = GLib.getenv("COLORMAN_ROOT") || GLib.get_current_dir();

for (const name of ["colorman.src", "colorman.data", "colorman.icons"]) {
  const path = GLib.build_filenamev([root, "build", `${name}.gresource`]);
  const resource = Gio.Resource.load(path);
  Gio.resources_register(resource);
}

globalThis.pkg = {
  initGettext() {},
  initFormat() {},
};

const { main } = await import("resource:///org/gnome/Colorman/js/main.js");
const exit_code = await main(["org.gnome.Colorman", ...programArgs]);
exit(exit_code);
