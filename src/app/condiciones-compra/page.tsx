import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Condiciones de compra',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <LegalPage
      title='Condiciones de compra'
      intro='Información sobre nuestros productos, precios,
formas de pago, fabricación bajo demanda, envíos,
devoluciones y derechos de los consumidores.'
    >
      <section>
        <h2>1. Identificación del vendedor</h2>
        <p>
          El vendedor es Luis Miguel Rodriguez Gutierrez, autónomo, NIF
          77803934V, con domicilio en Avda. Antonio Machado, 155, 41230
          Castilblanco de los Arroyos (Sevilla), España. Correo electrónico:{' '}
          <a className='text-[#B5FF67] underline' href='mailto:info@pn3d.es'>
            info@pn3d.es
          </a>
          . Teléfono: 684 710 115.
        </p>
      </section>
      <section>
        <h2>2. Productos de catálogo y personalizados</h2>
        <p>
          La tienda ofrece artículos impresos en 3D de catálogo y la posibilidad
          de solicitar presupuestos para encargos personalizados. Cada ficha
          identifica las características y variantes anunciadas. Las fotografías
          son ilustrativas del producto descrito, sin perjuicio de las
          características expresamente contratadas.
        </p>
        <p>
          Las solicitudes de presupuesto no implican automáticamente la
          aceptación de un pedido ni un pago. Las condiciones específicas de un
          encargo personalizado deberán comunicarse y aceptarse antes de
          formalizarlo.
        </p>
      </section>
      <section>
        <h2>3. Precio, impuestos y gastos de entrega</h2>
        <p>
          Todos los precios publicados incluyen el 21 % de IVA. Los gastos de
          envío se muestran por separado y se incorporan al importe total del
          pedido antes del pago.
        </p>
        <p>
          El envío mediante Correos a España peninsular y Baleares tiene un
          coste de 8,00 € por pedido, impuestos incluidos. La recogida
          presencial es gratuita. El importe total de los productos y, en su
          caso, del transporte se muestra antes de iniciar el pago.
        </p>
      </section>
      <section>
        <h2>4. Cómo se realiza un pedido</h2>
        <p>
          El cliente selecciona productos y variantes, revisa cantidades e
          importe en el carrito, elige envío o recogida y completa sus datos de
          contacto, entrega y facturación. Posteriormente accede a la pasarela
          de pago de Stripe. Antes de aceptar un pedido debe poder revisar y
          corregir sus datos y conocer las condiciones aplicables.
        </p>
        <p>
          El registro técnico de un pedido con estado «pago pendiente» no
          acredita el cobro. Los pagos se confirman en el servidor tras recibir
          y validar la notificación de Stripe. El cliente puede consultar el
          estado en su cuenta y recibe las comunicaciones de pedido habilitadas.
        </p>
      </section>
      <section>
        <h2>5. Pago y facturación</h2>
        <p>
          Los pagos online se procesan mediante Stripe. La tienda conserva la
          referencia del pago y el estado del pedido, pero no necesita almacenar
          los datos completos de la tarjeta del cliente. La facturación se
          gestiona mediante el programa externo utilizado por el titular, no
          mediante un módulo emisor de facturas de esta web.
        </p>
        <p>
          El titular ha confirmado que su programa externo de facturación cubre
          la emisión de las facturas correspondientes. El cliente puede
          solicitar la factura a través de info@pn3d.es. La tienda no genera
          facturas automáticamente desde su código.
        </p>
      </section>
      <section>
        <h2>6. Fabricación, envío y recogida</h2>
        <p>
          El ámbito de entrega incluye España peninsular e Islas Baleares. No se
          realizan inicialmente envíos a Canarias, Ceuta, Melilla ni al
          extranjero. Los artículos pueden requerir fabricación antes de la
          expedición. La recogida presencial se coordina cuando el pedido está
          terminado.
        </p>
        <p>
          Los productos habituales requieren un plazo estimado de fabricación de
          entre 48 y 72 horas desde la confirmación del pago, dependiendo de la
          carga de trabajo.
        </p>
        <p>
          Una vez fabricados, los pedidos se envían mediante Correos. El
          transporte tiene una duración estimada de entre 24 y 72 horas,
          dependiendo del destino, las fechas de envío y las condiciones del
          servicio.
        </p>
        <p>
          Por tanto, el plazo habitual estimado de fabricación y transporte es
          de entre 72 y 144 horas, sin que constituya una garantía de entrega en
          ese intervalo. Los encargos complejos, los períodos de alta demanda y
          las incidencias logísticas pueden requerir más tiempo.
        </p>
        <p>
          Si un encargo requiere un plazo superior al habitual, se comunicará al
          comprador antes de formalizarlo. La recogida presencial se coordinará
          cuando el producto esté terminado.
        </p>
        <p>
          Consulta{' '}
          <Link
            href='/envios-devoluciones'
            className='text-[#B5FF67] underline'
          >
            Envíos y devoluciones
          </Link>{' '}
          para obtener información adicional.
        </p>
      </section>
      <section>
        <h2>7. Derecho de desistimiento</h2>
        <p>
          En los contratos a distancia sobre bienes no exceptuados, el
          consumidor dispone, con carácter general, de 14 días naturales desde
          la recepción para desistir sin necesidad de justificar su decisión. La
          excepción del artículo 103.c) del Real Decreto Legislativo 1/2007 se
          refiere a bienes confeccionados conforme a especificaciones del
          consumidor o claramente personalizados. La fabricación bajo demanda de
          un producto estándar no basta por sí sola para excluir el
          desistimiento.
        </p>
        <p>
          En los desistimientos ordinarios, el comprador asume los costes
          directos de devolver el producto. Esto no se aplica del mismo modo a
          devoluciones por defectos o falta de conformidad, que se rigen por la
          garantía legal. Las instrucciones y el formulario modelo figuran en{' '}
          <Link
            href='/envios-devoluciones'
            className='text-[#B5FF67] underline'
          >
            Envíos y devoluciones
          </Link>
          .
        </p>
      </section>
      <section>
        <h2>8. Garantía y atención de incidencias</h2>
        <p>
          Los productos están sujetos a los derechos legales de conformidad y
          garantía que correspondan. La personalización no elimina estos
          derechos. Para incidencias, productos dañados o reclamaciones puede
          escribirse a{' '}
          <a className='text-[#B5FF67] underline' href='mailto:info@pn3d.es'>
            info@pn3d.es
          </a>{' '}
          o llamar al teléfono de contacto.
        </p>
      </section>
    </LegalPage>
  );
}
