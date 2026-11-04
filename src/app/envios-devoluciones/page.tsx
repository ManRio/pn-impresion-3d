import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Envíos y devoluciones',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <LegalPage title='Envíos y devoluciones'
      intro='Información sobre entregas, recogida, desistimiento e incidencias de P&N Impresión 3D. Borrador sujeto a validación antes de abrir la tienda.'>
      <section>
        <h2>1. Ámbito y métodos de entrega</h2>
        <p>Realizamos entregas en España peninsular e Islas Baleares mediante Correos, con un coste fijo anunciado de <strong>8,00 € por pedido</strong>. También se ofrece recogida presencial gratuita en Avda. Antonio Machado, 155, 41230 Castilblanco de los Arroyos (Sevilla), previa confirmación de disponibilidad. No se contemplan inicialmente envíos a Canarias, Ceuta, Melilla ni al extranjero.</p>
      </section>
      <section>
        <h2>2. Fabricación y plazos</h2>
        <p>Los encargos pueden requerir un período de fabricación antes de su expedición. <strong>[PENDIENTE: plazo de fabricación y entrega de Correos; fecha máxima de entrega o criterio de cálculo]</strong>. Estos datos se comunicarán antes de aceptar una compra con obligación de pago.</p>
      </section>
      <section>
        <h2>3. Desistimiento de productos de catálogo</h2>
        <p>En las compras a distancia de productos que no estén legalmente exceptuados, el consumidor dispone, como regla general, de <strong>14 días naturales desde la recepción</strong> para comunicar el desistimiento sin necesidad de justificarlo. Puede notificarlo en <a className='text-[#B5FF67] underline' href='mailto:info@pn3d.es'>info@pn3d.es</a>. La devolución física podrá dirigirse, previa coordinación, a Avda. Antonio Machado, 155, 41230 Castilblanco de los Arroyos (Sevilla).</p>
        <p><strong>[PENDIENTE: determinar e informar expresamente quién asume los gastos directos de devolución y facilitar formulario modelo de desistimiento]</strong>.</p>
      </section>
      <section>
        <h2>4. Productos personalizados</h2>
        <p>Conforme al artículo 103.c) del Real Decreto Legislativo 1/2007, el derecho de desistimiento no se aplica a bienes confeccionados conforme a las especificaciones del consumidor o claramente personalizados. La mera fabricación bajo demanda de un artículo estándar no basta para aplicar esta excepción. La posible excepción se informará expresamente antes de confirmar cada encargo.</p>
      </section>
      <section>
        <h2>5. Defectos, daños y falta de conformidad</h2>
        <p>Los derechos legales de garantía y las medidas frente a la falta de conformidad se mantienen también en productos personalizados. Para incidencias escribe a <a className='text-[#B5FF67] underline' href='mailto:info@pn3d.es'>info@pn3d.es</a> o consulta <Link className='text-[#B5FF67] underline' href='/contacto'>Contacto</Link>.</p>
      </section>
      <section>
        <h2>6. Reembolsos</h2>
        <p>Cuando proceda legalmente el desistimiento, el reembolso comprende las cantidades exigibles por la normativa, incluidos los gastos de entrega ordinaria que correspondan. Se realizará por el medio de pago original salvo acuerdo válido en contrario. <strong>[PENDIENTE: procedimiento operativo de reintegros cuando se active Stripe]</strong>.</p>
      </section>
    </LegalPage>
  );
}
