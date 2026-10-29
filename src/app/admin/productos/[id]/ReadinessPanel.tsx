import type { ReadinessCheck } from "@/lib/product-readiness";
import { CheckCircle2, AlertCircle } from "lucide-react";
export default function ReadinessPanel({checks}:{checks:ReadinessCheck[]}) {
 const ok=checks.filter(x=>x.ok).length;
 return <section className="mb-8 rounded-xl border border-white/10 bg-[#1a211e] p-6">
  <div className="flex flex-wrap justify-between gap-3"><h2 className="font-display text-xl font-bold">LISTO PARA PUBLICAR</h2><span className="font-bold text-[#B5FF67]">{ok}/{checks.length}</span></div>
  <p className="my-3 text-sm text-neutral-400">Solo comprobamos lo imprescindible. Las fotografías y el tiempo de impresión son opcionales.</p>
  <div className="space-y-2">{checks.map(c=><div key={c.key} className="flex gap-3 rounded-lg bg-[#101319] p-3">{c.ok?<CheckCircle2 size={19} className="shrink-0 text-[#B5FF67]"/>:<AlertCircle size={19} className="shrink-0 text-amber-400"/>}<div><p className="font-semibold text-sm">{c.label}</p><p className="text-xs text-neutral-400">{c.detail}</p></div></div>)}</div>
 </section>;
}
