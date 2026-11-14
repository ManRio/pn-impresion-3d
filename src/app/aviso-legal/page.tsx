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
      showDraftNotice={false}
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
          P&N Impresión 3D es una tienda online dedicada a la presentación,
          fabricación y comercialización de artículos impresos en 3D, así como a
          la realización de proyectos personalizados bajo presupuesto.
        </p>
        <p>
          A través de este sitio web, los usuarios pueden consultar el catálogo,
          realizar pedidos de los productos disponibles, solicitar presupuestos
          personalizados y contactar con el titular.
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
        <h2>5. Consultas, atención al cliente y reclamaciones</h2>

        <p>
          Para solicitar información, comunicar incidencias o presentar quejas y
          reclamaciones relacionadas con los productos o pedidos, los usuarios
          pueden contactar con P&N Impresión 3D mediante:
        </p>

        <ul>
          <li>
            Correo electrónico:{' '}
            <a href='mailto:info@pn3d.es' className='text-[#B5FF67] underline'>
              info@pn3d.es
            </a>
          </li>
          <li>
            Teléfono:{' '}
            <a href='tel:+34684710115' className='text-[#B5FF67] underline'>
              684 710 115
            </a>
          </li>
          <li>
            Correo postal: al domicilio del titular indicado en el apartado 1.
          </li>
        </ul>

        <p>
          Las reclamaciones serán atendidas conforme a los plazos y
          procedimientos establecidos en la normativa de protección de las
          personas consumidoras y usuarias.
        </p>

        <p>
          Los consumidores también podrán utilizar las hojas oficiales de quejas
          y reclamaciones y los mecanismos de resolución de conflictos previstos
          en la normativa aplicable.
        </p>
      </section>
    </LegalPage>
  );
}
