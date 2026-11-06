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
      intro='Información sobre los productos, la contratación, los pagos y los derechos de quienes compran en P&N Impresión 3D. Texto pendiente de validación comercial y legal antes de activar cobros reales.'
    >
      <section>
        <h2>1. Identificación del vendedor</h2>
        <p>El vendedor es Luis Miguel Rodriguez Gutierrez, autónomo, NIF 77803934V, con domicilio en Avda. Antonio Machado, 155, 41230 Castilblanco de los Arroyos (Sevilla), España. Correo electrónico: <a className='text-[#B5FF67] underline' href='mailto:info@pn3d.es'>info@pn3d.es</a>. Teléfono: 684 710 115.</p>
      </section>
      <section>
        <h2>2. Productos de catálogo y personalizados</h2>
        <p>La tienda ofrece artículos impresos en 3D de catálogo y la posibilidad de solicitar presupuestos para encargos personalizados. Cada ficha identifica las características y variantes anunciadas. Las fotografías son ilustrativas del producto descrito, sin perjuicio de las características expresamente contratadas.</p>
        <p>Las solicitudes de presupuesto no implican automáticamente la aceptación de un pedido ni un pago. Las condiciones específicas de un encargo personalizado deberán comunicarse y aceptarse antes de formalizarlo.</p>
      </section>
      <section>
        <h2>3. Precio, impuestos y gastos de entrega</h2>
        <p>Los precios publicados para el consumidor son finales e incluyen los impuestos aplicables. El desglose mostrado en el pedido utiliza inicialmente el tipo general del 21 % de IVA, pendiente de confirmación por la gestoría para los productos ofrecidos.</p>
        <p>El envío mediante Correos a España peninsular y Baleares tiene un coste de 8,00 € por pedido, impuestos incluidos. La recogida presencial es gratuita. El importe total de los productos y, en su caso, del transporte se muestra antes de iniciar el pago.</p>
      </section>
      <section>
        <h2>4. Cómo se realiza un pedido</h2>
        <p>El cliente selecciona productos y variantes, revisa cantidades e importe en el carrito, elige envío o recogida y completa sus datos de contacto, entrega y facturación. Posteriormente accede a la pasarela de pago de Stripe. Antes de aceptar un pedido debe poder revisar y corregir sus datos y conocer las condiciones aplicables.</p>
        <p>El registro técnico de un pedido con estado «pago pendiente» no acredita el cobro. Los pagos se confirman en el servidor tras recibir y validar la notificación de Stripe. El cliente puede consultar el estado en su cuenta y recibe las comunicaciones de pedido habilitadas.</p>
        <p><strong>[POR VALIDAR ANTES DE LA VENTA REAL: comprobar en la interfaz la información precontractual, el botón de pedido con obligación de pago, la aceptación de condiciones, los medios de corrección y el contenido de la confirmación remitida por correo.]</strong></p>
      </section>
      <section>
        <h2>5. Pago y facturación</h2>
        <p>Los pagos online se procesan mediante Stripe. La tienda conserva la referencia del pago y el estado del pedido, pero no necesita almacenar los datos completos de la tarjeta del cliente. La facturación se gestiona mediante el programa externo utilizado por el titular, no mediante un módulo emisor de facturas de esta web.</p>
        <p>El titular ha confirmado que su programa externo de facturación cubre la emisión de las facturas correspondientes. El cliente puede solicitar la factura a través de info@pn3d.es. La tienda no genera facturas automáticamente desde su código.</p>
      </section>
      <section>
        <h2>6. Fabricación, envío y recogida</h2>
        <p>El ámbito de entrega incluye España peninsular e Islas Baleares. No se realizan inicialmente envíos a Canarias, Ceuta, Melilla ni al extranjero. Los artículos pueden requerir fabricación antes de la expedición. La recogida presencial se coordina cuando el pedido está terminado.</p>
        <p>Como orientación, los artículos habituales pueden prepararse para su envío en un plazo estimado de 48 a 72 horas desde la confirmación del pago. Este plazo es de preparación o fabricación, no el tiempo de transporte ni una garantía de expedición para todos los pedidos. Puede ampliarse en función del tamaño, las horas de impresión, la complejidad del proyecto y la cola de trabajos existente.</p><p>Antes de finalizar una compra debe facilitarse un plazo o fecha de entrega aplicable al pedido, teniendo en cuenta la fabricación y el transporte. Si un encargo requiere más tiempo, se comunicará el plazo concreto al comprador para que pueda aceptarlo antes de contratar. La recogida presencial se coordinará cuando el pedido esté listo.</p><p><strong>[PENDIENTE DE IMPLEMENTACIÓN/VERIFICACIÓN: comprobar que el checkout informa antes del pago de los plazos de entrega aplicables, especialmente cuando superen la estimación habitual de fabricación.]</strong></p>
        <p>Consulta <Link href='/envios-devoluciones' className='text-[#B5FF67] underline'>Envíos y devoluciones</Link> para obtener información adicional.</p>
      </section>
      <section>
        <h2>7. Derecho de desistimiento</h2>
        <p>En los contratos a distancia sobre bienes no exceptuados, el consumidor dispone, con carácter general, de 14 días naturales desde la recepción para desistir sin necesidad de justificar su decisión. La excepción del artículo 103.c) del Real Decreto Legislativo 1/2007 se refiere a bienes confeccionados conforme a especificaciones del consumidor o claramente personalizados. La fabricación bajo demanda de un producto estándar no basta por sí sola para excluir el desistimiento.</p>
        <p>En los desistimientos ordinarios, el comprador asume los costes directos de devolver el producto. Esto no se aplica del mismo modo a devoluciones por defectos o falta de conformidad, que se rigen por la garantía legal. Las instrucciones y el formulario modelo figuran en <Link href='/envios-devoluciones' className='text-[#B5FF67] underline'>Envíos y devoluciones</Link>.</p>
      </section>
      <section>
        <h2>8. Garantía y atención de incidencias</h2>
        <p>Los productos están sujetos a los derechos legales de conformidad y garantía que correspondan. La personalización no elimina estos derechos. Para incidencias, productos dañados o reclamaciones puede escribirse a <a className='text-[#B5FF67] underline' href='mailto:info@pn3d.es'>info@pn3d.es</a> o llamar al teléfono de contacto.</p>
        <p><strong>[POR VALIDAR: protocolo de atención de incidencias y devoluciones, y datos de comunicación de reclamaciones.]</strong></p>
      </section>
      <section>
        <h2>9. Revisión previa a la publicación comercial</h2>
        <p>La política orientativa de preparación, los gastos directos de devolución por desistimiento y el uso del programa externo de facturación han sido confirmados por el titular. Queda pendiente comprobar que el checkout informe del plazo concreto de entrega de cada pedido, las condiciones aplicables, la obligación de pago y la confirmación contractual, además de revisar los restantes textos legales. No activar cobros reales antes de estas verificaciones.</p>
      </section>
    </LegalPage>
  );
}
