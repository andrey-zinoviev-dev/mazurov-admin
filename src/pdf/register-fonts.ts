import path from "node:path";
import { Font } from "@react-pdf/renderer";

const fontsDir = path.join(process.cwd(), "src/pdf/fonts");

let registered = false;

export function registerEstimateFonts(): void {
  if (registered) return;

  Font.register({
    family: "Roboto",
    fonts: [
      {
        src: path.join(fontsDir, "Roboto-Regular.ttf"),
        fontWeight: 400,
      },
      {
        src: path.join(fontsDir, "Roboto-Bold.ttf"),
        fontWeight: 700,
      },
    ],
  });

  registered = true;
}

export function getEstimateLogoPath(): string {
  return path.join(process.cwd(), "public", "logo.png");
}
