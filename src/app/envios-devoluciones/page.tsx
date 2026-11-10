import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Envíos y devoluciones',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <LegalPage
      title='Envíos y devoluciones'
      intro='Consulta nuestras zonas de entrega,
modalidades de recogida, plazos de preparación,
devoluciones y atención de incidencias.'
    >
      <section>
        <h2>1. Destinos y modalidades</h2>
        <p>
          Se realizan envíos por Correos a España peninsular e Islas Baleares,
          con un coste de 8,00 € por pedido, impuestos incluidos. La recogida
          presencial es gratuita en Avda. Antonio Machado, 155, 41230
          Castilblanco de los Arroyos (Sevilla), previa comunicación de
          disponibilidad.
        </p>
        <p>
          No se ofrecen inicialmente entregas a Canarias, Ceuta, Melilla ni
          fuera de España.
        </p>
      </section>
      <section>
        <h2>2. Producción y plazos de entrega</h2>
        <p>
          Los artículos se fabrican habitualmente bajo pedido. La preparación
          requiere entre 48 y 72 horas desde la confirmación del pago, según la
          carga de trabajo.
        </p>
        <p>
          Una vez fabricado el producto, se entrega a Correos. El transporte
          tiene una duración estimada de entre 24 y 72 horas, dependiendo del
          destino, las fechas y las condiciones del servicio.
        </p>
        <p>
          El plazo total habitual estimado es de 72 a 144 horas entre
          fabricación y transporte. Estas estimaciones pueden ampliarse en
          pedidos complejos, períodos de alta demanda o por incidencias
          logísticas.
        </p>
        <p>
          Si un pedido requiere un plazo especial, se informará al comprador
          antes de formalizarlo. Para recogida presencial, avisaremos cuando
          esté preparado. Salvo acuerdo sobre otro plazo de entrega, se aplica
          el máximo legal de 30 días naturales.
        </p>
      </section>
      <section>
        <h2>3. Desistimiento de productos no exceptuados</h2>
        <p>
          Con carácter general, el consumidor dispone de 14 días naturales desde
          la recepción del bien para comunicar su desistimiento sin
          justificarlo, cuando no concurra una excepción legal. Puede
          comunicarlo a{' '}
          <a className='text-[#B5FF67] underline' href='mailto:info@pn3d.es'>
            info@pn3d.es
          </a>{' '}
          mediante una declaración inequívoca o utilizando el modelo incluido
          más abajo.
        </p>
        <p>
          Tras comunicar el desistimiento, deberá devolver o entregar el bien
          sin demoras indebidas y, como regla general, dentro de los 14 días
          naturales siguientes a dicha comunicación. La dirección de devolución
          es Avda. Antonio Machado, 155, 41230 Castilblanco de los Arroyos
          (Sevilla), España, previa coordinación por correo.
        </p>
        <p>
          En caso de desistimiento ordinario,{' '}
          <strong>
            el comprador asume los costes directos de envío de vuelta
          </strong>
          . Puede elegir un medio de transporte adecuado y deberá conservar el
          justificante. Los costes derivados de una falta de conformidad o
          defecto se gestionarán según los derechos de garantía y no se cargarán
          al consumidor cuando deban ser gratuitos por ley.
        </p>
      </section>
      <section>
        <h2>4. Productos hechos según especificaciones del consumidor</h2>
        <p>
          El artículo 103.c) del Real Decreto Legislativo 1/2007 exceptúa del
          desistimiento los bienes confeccionados conforme a las
          especificaciones del consumidor o claramente personalizados. La
          excepción no se aplica automáticamente a cualquier producto impreso
          después de recibir un pedido. Cuando proceda, se informará antes de
          aceptar el encargo.
        </p>
        <p>
          La excepción al desistimiento no afecta a los derechos legales ante
          defectos o faltas de conformidad.
        </p>
      </section>
      <section>
        <h2>5. Reembolso por desistimiento</h2>
        <p>
          Cuando proceda el desistimiento, se reembolsarán los importes
          exigibles legalmente, incluidos los gastos de entrega ordinaria que
          correspondan, sin demoras indebidas y dentro del plazo legal. El
          reembolso se realizará mediante el mismo medio de pago, salvo acuerdo
          válido en contrario. En la venta de bienes, el empresario podrá
          retenerlo hasta recibirlos o disponer de prueba de su devolución,
          cuando corresponda conforme a la ley.
        </p>
      </section>
      <section>
        <h2>6. Artículos dañados, defectos y garantías</h2>
        <p>
          Si un artículo llega dañado o no se corresponde con lo contratado,
          comunícalo a{' '}
          <a className='text-[#B5FF67] underline' href='mailto:info@pn3d.es'>
            info@pn3d.es
          </a>
          , indicando la referencia de pedido y el problema detectado. Puede
          adjuntar fotografías para facilitar la gestión, sin que ello limite
          sus derechos legales.
        </p>
        <p>
          Los gastos de una devolución por falta de conformidad se tratarán
          conforme a los derechos de garantía del consumidor, y no como un
          desistimiento ordinario.
        </p>
      </section>
      <section>
        <h2>7. Modelo de desistimiento</h2>
        <p>
          Puede copiar este texto y enviarlo a info@pn3d.es. Utilícelo solo si
          desea desistir del contrato y el producto no está legalmente
          exceptuado:
        </p>
        <p>
          «A la atención de P&N Impresión 3D: por la presente comunico que
          desisto de mi contrato de compra del siguiente bien: [producto].
          Referencia de pedido: [referencia]. Fecha de recepción: [fecha].
          Nombre y apellidos: [nombre]. Domicilio: [dirección]. Fecha de
          comunicación: [fecha].»
        </p>
      </section>
      <section>
        <h2>8. Contacto y otras condiciones</h2>
        <p>
          Puede consultar también las{' '}
          <Link href='/condiciones-compra' className='text-[#B5FF67] underline'>
            condiciones de compra
          </Link>{' '}
          o ponerse en contacto en info@pn3d.es.
        </p>
      </section>
    </LegalPage>
  );
}
