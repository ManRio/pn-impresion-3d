import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Condiciones de compra',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <LegalPage title='Condiciones de compra'
      intro='Borrador de las condiciones comerciales de P&N Impresión 3D, pendiente de revisión operativa y de facturación antes de habilitar pagos.'>
      <section>
        <h2>1. Identificación del vendedor</h2>
        <p>Luis Miguel Rodriguez Gutierrez, autónomo, NIF 77803934V, domicilio legal: Avda. Antonio Machado, 155, 41230 Castilblanco de los Arroyos (Sevilla), España. Correo: <a className='text-[#B5FF67] underline' href='mailto:info@pn3d.es'>info@pn3d.es</a>. Teléfono: 684 710 115.</p>
      </section>
      <section>
        <h2>2. Productos y encargos a medida</h2>
        <p>Los productos de catálogo se describen en sus fichas, con variantes y precios disponibles. Los encargos personalizados requieren acordar previamente sus características y presupuesto. Las imágenes y acabados deben describirse fielmente; las particularidades propias de la fabricación se especificarán donde proceda.</p>
      </section>
      <section>
        <h2>3. Precio y fiscalidad</h2>
        <p>El titular declara el régimen general de IVA. Los precios publicados y el envío son importes finales con IVA incluido; el tipo general previsto para el catálogo es del 21 %, sujeto a revisión por producto. Envío con Correos: 8,00 € finales por pedido. Recogida presencial: gratuita. El total se mostrará antes de confirmar el pedido.</p>
        <p><strong>[PENDIENTE: verificar con la gestoría los tipos impositivos de cada producto y los requisitos del software de facturación]</strong>.</p>
      </section>
      <section>
        <h2>4. Entregas y recogida</h2>
        <p>Se ofrece envío a España peninsular e Islas Baleares por Correos, o recogida presencial en el domicilio indicado tras confirmación de disponibilidad. No están disponibles inicialmente Canarias, Ceuta, Melilla ni el extranjero. <strong>[PENDIENTE: plazos de fabricación, entrega y procedimiento de recogida]</strong>. Consulta <Link href='/envios-devoluciones' className='text-[#B5FF67] underline'>Envíos y devoluciones</Link>.</p>
      </section>
      <section>
        <h2>5. Pedido y pago</h2>
        <p>La plataforma está actualmente en pruebas. El registro de un pedido no implica que se haya efectuado un pago. <strong>[PENDIENTE: integrar Stripe, confirmación segura por webhook, confirmación contractual y comunicación en soporte duradero]</strong>. La facturación se realizará desde la propia web cuando se implemente y valide el módulo de facturación conforme a la normativa aplicable. Mientras tanto, la tienda no expedirá facturas desde su código.</p>
      </section>
      <section>
        <h2>6. Desistimiento</h2>
        <p>Los productos estándar contratados a distancia disponen, con carácter general, de 14 días naturales desde la recepción para desistir. Los productos confeccionados conforme a especificaciones del consumidor o claramente personalizados pueden estar exceptuados, conforme al artículo 103.c) del Real Decreto Legislativo 1/2007. La mera impresión bajo demanda no implica esta excepción.</p>
      </section>
      <section>
        <h2>7. Garantía legal e incidencias</h2>
        <p>Los derechos de garantía por falta de conformidad no se eliminan porque un producto sea personalizado. Las incidencias y reclamaciones se atenderán mediante info@pn3d.es y el teléfono comercial. <strong>[PENDIENTE: procedimiento interno y plazo orientativo de atención]</strong>.</p>
      </section>
      <section>
        <h2>8. Antes de abrir la tienda</h2>
        <p>Se revisarán los textos finales, el resumen de compra, la aceptación de las condiciones y las obligaciones de información precontractual, incluidos los plazos de entrega, el desistimiento y la confirmación del contrato. No se debe activar el cobro hasta completar dichas verificaciones.</p>
      </section>
    </LegalPage>
  );
}
