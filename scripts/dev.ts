import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const logoPath = join(root, "logo.svg");
let appProcess: ReturnType<typeof spawn> | null = null;
let rebuildTimer: ReturnType<typeof setTimeout> | null = null;
let rebuilding = false;

async function rebuild(): Promise<void> {
  if (rebuilding) return;

  rebuilding = true;

  try {
    const build = spawn("bun", ["run", "build"], {
      cwd: root,
      stdio: "inherit",
    });
    await new Promise<void>((resolve, reject) => {
      build.on("exit", (code) =>
        code === 0 ? resolve() : reject(new Error(`tsc exited with ${code}`)),
      );
    });

    const resources = spawn("bun", ["run", "build:resources"], {
      cwd: root,
      stdio: "inherit",
      env: {
        ...process.env,
        COLORMAN_INSTALL_DEV_ICONS: "1",
      },
    });
    await new Promise<void>((resolve, reject) => {
      resources.on("exit", (code) =>
        code === 0
          ? resolve()
          : reject(new Error(`build:resources exited with ${code}`)),
      );
    });

    restartApp();
  } finally {
    rebuilding = false;
  }
}

function scheduleRebuild(): void {
  if (rebuildTimer) clearTimeout(rebuildTimer);

  rebuildTimer = setTimeout(() => {
    rebuild().catch((error) => {
      console.error(error);
    });
  }, 150);
}

function restartApp(): void {
  if (appProcess) appProcess.kill("SIGTERM");

  appProcess = spawn("gjs", ["-m", join(root, "scripts/launcher.mjs")], {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      COLORMAN_ROOT: root,
    },
  });

  appProcess.on("exit", () => {
    appProcess = null;
  });
}

process.on("SIGINT", () => {
  if (appProcess) appProcess.kill("SIGTERM");
  process.exit(0);
});

await rebuild();

watch(logoPath, () => scheduleRebuild());

watch(join(root, "src"), { recursive: true }, (_event, filename) => {
  if (!filename) return;

  if (
    filename.endsWith(".ts") ||
    filename.endsWith(".blp") ||
    filename.endsWith(".svg")
  ) {
    scheduleRebuild();
  }
});

console.log("Watching src/ for changes. Press Ctrl+C to stop.");
