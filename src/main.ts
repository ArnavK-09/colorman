import { ColormanApplication } from "./application.js";

pkg.initGettext();
pkg.initFormat();

export function main(argv: string[]) {
  const application = new ColormanApplication();
  return application.runAsync(argv);
}
