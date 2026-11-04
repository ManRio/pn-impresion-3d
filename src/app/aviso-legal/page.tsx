import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
export const metadata: Metadata = {
  title: 'Aviso legal',
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <LegalPage
      title='Aviso legal'
      intro='Información sobre el titular de P&N Impresión 3D y las condiciones generales de uso de este sitio web.'
    >
      <section>
        <h2>1. Titular del sitio web</h2>
        <p>
          Titular (persona física / autónomo):{' '}
          <strong>Luis Miguel Rodriguez Gutierrez</strong>.
        </p>
        <p>
          NIF/CIF: <strong>77803934V</strong>.
        </p>
        <p>
          Domicilio:{' '}
          <strong>
            Avenida Antonio Machado 155, C. P.: 41230, Castilblanco de los
            Arroyos (Sevilla), España
          </strong>
          .
        </p>
        <p>
          Correo electrónico: <strong>info@pn3d.es</strong>.
        </p>
        <p>
          Teléfono de contacto: <strong>684 710 115</strong>.
        </p>
      </section>
      <section>
        <h2>2. Finalidad del sitio</h2>
        <p>
          Presentar productos impresos en 3D, atender solicitudes de presupuesto
          y, cuando el servicio de venta esté habilitado, facilitar pedidos de
          los productos ofrecidos por el titular.
        </p>
      </section>
      <section>
        <h2>3. Uso del sitio web</h2>
        <p>
          Quien utilice este sitio debe hacerlo de forma lícita y respetar los
          derechos de terceros. La información del catálogo puede actualizarse
          antes de formalizar una compra; las condiciones aplicables a cada
          pedido deberán mostrarse antes de confirmarlo.
        </p>
      </section>
      <section>
        <h2>4. Derechos sobre contenidos y diseños</h2>
        <p>
          Las fotografías, textos y otros elementos se encuentran sujetos a los
          derechos de sus respectivos titulares. La presencia de un diseño de
          terceros en una biblioteca o catálogo no constituye, por sí sola,
          autorización para su explotación comercial.
        </p>
      </section>
      <section>
        <h2>5. Consultas y reclamaciones</h2>
        <p>
          Puede contactar con el titular mediante el correo comercial indicado
          en este aviso o a través de los canales publicados en la página de
          contacto.{' '}
          <strong>
            [PENDIENTE: PROCEDIMIENTO Y DIRECCIÓN EFECTIVA DE RECLAMACIONES]
          </strong>
          .
        </p>
      </section>
    </LegalPage>
  );
}
