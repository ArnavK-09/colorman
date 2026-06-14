import { $ } from "bun";
import { Glob } from "bun";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const root = join(import.meta.dir, "..");
const buildDir = join(root, "build");
const blueprintDir = join(buildDir, "blueprint");
const srcDir = join(root, "src");
const appId = "org.gnome.Colorman";
const logoPath = join(root, "logo.svg");

function makeSymbolic(scalable: string): string {
  const viewBox = scalable.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 36 36";
  const pathTags = [...scalable.matchAll(/<path\b[^>]*\/>/g)].map(
    (match) => match[0],
  );
  const paths = pathTags
    .map((tag) => {
      const d = tag.match(/\sd="([^"]+)"/)?.[1];
      if (!d) return "";
      return `  <path fill="currentColor" d="${d}"/>`;
    })
    .filter(Boolean)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="${viewBox}">
${paths}
</svg>
`;
}

async function writeFileEnsured(dest: string, contents: string): Promise<void> {
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, contents);
}

async function syncIcons(): Promise<void> {
  if (!existsSync(logoPath)) {
    throw new Error(`Missing logo at ${logoPath}`);
  }

  const scalable = await readFile(logoPath, "utf8");
  const symbolic = makeSymbolic(scalable);

  await writeFileEnsured(
    join(buildDir, "icons/hicolor/scalable/apps", `${appId}.svg`),
    scalable,
  );
  await writeFileEnsured(
    join(buildDir, "icons/hicolor/symbolic/apps", `${appId}-symbolic.svg`),
    symbolic,
  );

  if (process.env.COLORMAN_INSTALL_DEV_ICONS !== "1") return;

  try {
    const iconRoot = join(homedir(), ".local/share/icons/hicolor");
    const appsDir = join(homedir(), ".local/share/applications");
    const gjs = (await $`which gjs`.text()).trim();
    const launcher = join(root, "scripts/launcher.mjs");

    await writeFileEnsured(
      join(iconRoot, "scalable/apps", `${appId}.svg`),
      scalable,
    );
    await writeFileEnsured(
      join(iconRoot, "symbolic/apps", `${appId}-symbolic.svg`),
      symbolic,
    );
    await writeFileEnsured(
      join(appsDir, `${appId}.desktop`),
      `[Desktop Entry]
Name=Colorman
Comment=Color tools
Exec=env COLORMAN_ROOT=${root} ${gjs} -m ${launcher}
Icon=${appId}
Terminal=false
Type=Application
Categories=Utility;
Keywords=color;palette;
StartupNotify=true
StartupWMClass=${appId}
`,
    );

    try {
      await $`gtk-update-icon-cache -f -t ${iconRoot}`.quiet();
    } catch {}
    try {
      await $`update-desktop-database ${appsDir}`.quiet();
    } catch {}
  } catch {}
}

await syncIcons();

const blpFiles: string[] = [];
for await (const file of new Glob("**/*.blp").scan(srcDir)) {
  blpFiles.push(join(srcDir, file));
}

if (blpFiles.length === 0) {
  throw new Error("No blueprint files found");
}

await mkdir(blueprintDir, { recursive: true });

await $`blueprint-compiler batch-compile --minify ${blueprintDir} ${srcDir} ${blpFiles}`;

await $`glib-compile-resources --sourcedir=${blueprintDir} --target=${join(buildDir, "colorman.data.gresource")} ${join(srcDir, "org.gnome.Colorman.data.gresource.xml")}`;
await $`glib-compile-resources --sourcedir=${srcDir} --target=${join(buildDir, "colorman.src.gresource")} ${join(srcDir, "org.gnome.Colorman.src.gresource.xml")}`;
await $`glib-compile-resources --sourcedir=${buildDir} --target=${join(buildDir, "colorman.icons.gresource")} ${join(srcDir, "org.gnome.Colorman.icons.gresource.xml")}`;
