import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

type Payload = { weightCentigrams: number; seconds: number; material: "PLA" | "PETG" | "TPU" | "OTHER"; color: string; filename: string; exp: number };
function secret() { const s = process.env.BETTER_AUTH_SECRET; if (!s || s.length < 32) throw new Error("BETTER_AUTH_SECRET no configurado correctamente."); return s; }
export function issueAnalysisTicket(input: Omit<Payload, "exp">) {
  const data = Buffer.from(JSON.stringify({ ...input, exp: Date.now() + 20 * 60_000 })).toString("base64url");
  const sig = createHmac("sha256", secret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}
export function readAnalysisTicket(token: string): Payload {
  if (token.length > 4000) throw new Error("Análisis inválido.");
  const [data, received, extra] = token.split(".");
  if (!data || !received || extra) throw new Error("Análisis inválido.");
  const expected = createHmac("sha256", secret()).update(data).digest();
  const sig = Buffer.from(received, "base64url");
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected)) throw new Error("Análisis modificado o inválido.");
  const value = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as Payload;
  if (!Number.isFinite(value.exp) || value.exp < Date.now() || value.exp > Date.now() + 20 * 60_000) throw new Error("El análisis ha caducado: vuelve a subir el archivo.");
  if (!Number.isSafeInteger(value.weightCentigrams) || value.weightCentigrams <= 0 || value.weightCentigrams > 10_000_000 || !Number.isSafeInteger(value.seconds) || value.seconds <= 0 || value.seconds > 6_000_000 || !["PLA","PETG","TPU","OTHER"].includes(value.material) || typeof value.color !== "string" || value.color.length > 80 || typeof value.filename !== "string" || value.filename.length > 255) throw new Error("Datos del análisis inválidos.");
  return value;
}
