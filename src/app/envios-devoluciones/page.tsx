import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
export const metadata: Metadata = {
  title: 'Envíos y devoluciones',
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <LegalPage
      title='Envíos y devoluciones'
      intro='Borrador sobre fabricación, entregas, devoluciones e incidencias en P&N Impresión 3D.'
    >
      <section>
        <h2>1. Zonas y métodos de envío</h2>
        <p>
          La zona de venta y entrega prevista es{' '}
          <strong>España peninsular</strong>. No se ofrecen inicialmente envíos
          a Baleares, Canarias, Ceuta ni Melilla.{' '}
          <strong>
            [PENDIENTE: TRANSPORTISTA, TARIFAS Y RESTRICCIONES ESPECÍFICAS]
          </strong>
          .
        </p>
      </section>
      <section>
        <h2>2. Gastos y tiempos de entrega</h2>
        <p>
          Los gastos y plazos deben comunicarse antes de confirmar cada pedido.
          Distinguir entre tiempo de fabricación y tiempo de transporte.{' '}
          <strong>
            [PENDIENTE: TARIFAS Y PLAZOS REALES, FECHAS MÁXIMAS Y CONDICIONES DE
            ENTREGA]
          </strong>
          .
        </p>
      </section>
      <section>
        <h2>3. Desistimiento en artículos estándar</h2>
        <p>
          Con carácter general, cuando proceda el derecho de desistimiento, el
          plazo es de 14 días naturales desde la recepción. Se informará
          previamente del procedimiento, dirección de devolución y de quién
          asume sus costes directos, conforme a la normativa aplicable.{' '}
          <strong>[PENDIENTE: DIRECCIÓN Y PROCEDIMIENTO]</strong>.
        </p>
      </section>
      <section>
        <h2>4. Artículos personalizados</h2>
        <p>
          Los productos realizados conforme a especificaciones particulares del
          consumidor o claramente personalizados pueden estar exceptuados del
          desistimiento legal. Esta excepción debe determinarse correctamente y
          comunicarse antes de la compra. La impresión 3D o fabricación tras el
          pedido, por sí solas, no bastan para aplicar la excepción de forma
          general.
        </p>
      </section>
      <section>
        <h2>5. Productos defectuosos o no conformes</h2>
        <p>
          La existencia de una excepción al desistimiento no elimina los
          derechos de garantía legal por falta de conformidad. El cliente debe
          disponer de un canal para comunicar daños, errores o incidencias.{' '}
          <strong>[PENDIENTE: CANAL Y PROCEDIMIENTO]</strong>.
        </p>
      </section>
      <section>
        <h2>6. Reembolsos</h2>
        <p>
          Los plazos, medios de reembolso y condiciones aplicables se
          especificarán conforme a la normativa y al método de pago realmente
          implantado.{' '}
          <strong>
            [PENDIENTE: VALIDAR PROCEDIMIENTO CON STRIPE Y TITULAR]
          </strong>
          .
        </p>
      </section>
    </LegalPage>
  );
}
