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
      intro='Borrador de las condiciones que deberán regular la venta de productos de P&N Impresión 3D cuando se activen los cobros.'
    >
      <section>
        <h2>1. Vendedor y alcance</h2>
        <p>
          El vendedor previsto es{' '}
          <strong>Luis Miguel Rodriguez Gutierrez</strong>, autónomo. NIF:{' '}
          <strong>77803934V</strong>. Domicilio legal:{' '}
          <strong>
            Avenida Antonio Machado 155, C. P.: 41230, Castilblanco de los
            Arroyos (Sevilla), España
          </strong>
          . Ámbito de entrega previsto: <strong>España peninsular</strong>.
          Quedan excluidas, por ahora, Baleares, Canarias, Ceuta y Melilla; las
          tarifas y condiciones exactas están pendientes de definir.
        </p>
      </section>
      <section> 
        <h2>2. Productos, materiales y personalización</h2>
        <p>
          Las fichas describirán características esenciales, variantes y, cuando
          proceda, las opciones de fabricación. Los encargos personalizados
          requieren concretar sus especificaciones y presupuesto antes de
          aceptarse.
        </p>
      </section>
      <section>
        <h2>3. Precio final, impuestos y entrega</h2>
        <p>
          Antes de confirmar una compra se mostrará el importe total, impuestos
          aplicables y gastos de entrega, además de la información
          precontractual exigible.{' '}
          <strong>[PENDIENTE: IVA, ZONAS, TARIFAS, UMBRALES Y PLAZOS]</strong>.
        </p>
      </section>
      <section>
        <h2>4. Pedido y pago</h2>
        <p>
          La plataforma está en fase de pruebas. El registro técnico de un
          pedido no acredita por sí solo un pago efectuado.{' '}
          <strong>
            [PENDIENTE: DEFINIR MÉTODOS DE PAGO Y MOMENTO DE FORMALIZACIÓN DE LA
            COMPRA]
          </strong>
          . Cuando se habilite el pago, la confirmación de una operación deberá
          depender de la verificación del proveedor de pagos, no únicamente de
          volver a una pantalla de éxito.
        </p>
      </section>
      <section>
        <h2>5. Derecho de desistimiento</h2>
        <p>
          Como regla general, en compras a distancia de productos no
          exceptuados, el consumidor dispone de 14 días naturales para desistir
          desde la recepción, con las condiciones y costes legalmente
          aplicables. La excepción del artículo 103.c) para bienes
          confeccionados conforme a las especificaciones del consumidor o
          claramente personalizados se valorará por producto y se comunicará
          antes de contratar.{' '}
          <strong>
            La mera impresión bajo demanda no implica automáticamente la pérdida
            del derecho de desistimiento.
          </strong>
        </p>
      </section>
      <section>
        <h2>6. Falta de conformidad y garantías</h2>
        <p>
          Los derechos legales de las personas consumidoras por productos
          defectuosos o no conformes no se eliminan por personalización ni por
          impresión 3D.{' '}
          <strong>
            [PENDIENTE: PROCEDIMIENTO DE INCIDENCIAS, REPARACIÓN, SUSTITUCIÓN Y
            REEMBOLSO]
          </strong>
          .
        </p>
      </section>
      <section>
        <h2>7. Atención y reclamaciones</h2>
        <p>
          Correo comercial: <strong>info@pn3d.es</strong>; teléfono de contacto:{' '}
          <strong>684 710 115</strong>; domicilio legal:{' '}
          <strong>
            Avenida Antonio Machado 155, C. P.: 41230, Castilblanco de los
            Arroyos (Sevilla), España
          </strong>
          . <strong>[PENDIENTE: PROCESO OPERATIVO DE RECLAMACIONES]</strong>.
          Consulta asimismo{' '}
          <Link
            href='/envios-devoluciones'
            className='text-[#B5FF67] underline'
          >
            envíos y devoluciones
          </Link>
          .
        </p>
      </section>
      <section>
        <h2>8. Información antes del pedido</h2>
        <p>
          Antes de abrir ventas se revisará el resumen de compra, el botón final
          con obligación de pago, la información de desistimiento y el envío de
          confirmaciones en soporte duradero. No se debe considerar el checkout
          comercialmente listo hasta implementar estas obligaciones.
        </p>
      </section>
    </LegalPage>
  );
}
