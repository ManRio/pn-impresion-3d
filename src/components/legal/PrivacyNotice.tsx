import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

type Context = 'account' | 'quote' | 'checkout';
type Props = { context: Context; id?: string };
const information: Record<Context, { purpose: string; legalBasis: string }> = {
  account: {
    purpose: 'Crear y gestionar la cuenta, identificar al cliente y permitirle consultar sus pedidos y presupuestos.',
    legalBasis: 'Medidas precontractuales y ejecución de la relación contractual, según corresponda.',
  },
  quote: {
    purpose: 'Estudiar la solicitud, preparar el presupuesto y responder a las consultas sobre el encargo.',
    legalBasis: 'Aplicación de medidas precontractuales solicitadas por la persona interesada.',
  },
  checkout: {
    purpose: 'Registrar y gestionar pedidos, tramitar su fabricación y entrega y cumplir obligaciones legales.',
    legalBasis: 'Ejecución del contrato y cumplimiento de las obligaciones legales aplicables.',
  },
};
export default function PrivacyNotice({ context, id }: Props) {
  const current = information[context];
  return (
    <aside id={id} aria-label="Información básica de protección de datos" className="rounded-xl border border-[#B5FF67]/25 bg-[#B5FF67]/5 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <ShieldCheck size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-[#B5FF67]" />
        <div>
          <h2 className="text-sm font-bold text-white">Información básica de protección de datos</h2>
          <dl className="mt-3 space-y-2 text-xs leading-6 text-neutral-300 sm:text-sm">
            <div><dt className="inline font-semibold text-white">Responsable: </dt><dd className="inline">Luis Miguel Rodríguez Gutiérrez (P&N Impresión 3D).</dd></div>
            <div><dt className="inline font-semibold text-white">Finalidad: </dt><dd className="inline">{current.purpose}</dd></div>
            <div><dt className="inline font-semibold text-white">Base jurídica: </dt><dd className="inline">{current.legalBasis}</dd></div>
            <div><dt className="inline font-semibold text-white">Destinatarios: </dt><dd className="inline">Proveedores técnicos necesarios para el servicio; pendiente de validar inventario y transferencias internacionales.</dd></div>
            <div><dt className="inline font-semibold text-white">Derechos: </dt><dd className="inline">Acceso, rectificación, supresión y otros derechos aplicables escribiendo a <a className="text-[#B5FF67] underline" href="mailto:info@pn3d.es">info@pn3d.es</a>.</dd></div>
          </dl>
          <p className="mt-4 text-xs leading-6 text-neutral-300 sm:text-sm">Más información en la <Link href="/privacidad" className="font-semibold text-[#B5FF67] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2">política de privacidad</Link>.</p>
        </div>
      </div>
    </aside>
  );
}
