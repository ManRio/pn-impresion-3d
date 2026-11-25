import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Política de cookies',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <LegalPage
      title='Política de cookies'
      intro='Información sobre las cookies y tecnologías de almacenamiento local utilizadas en P&N Impresión 3D para el funcionamiento de la tienda online.'
      showDraftNotice={false}
    >
      <section>
        <h2>1. ¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos o identificadores que los sitios web
          pueden almacenar en el navegador del usuario para permitir
          determinadas funciones.
        </p>
        <p>
          Existen también tecnologías similares, como el almacenamiento local
          (localStorage), que permiten conservar información en el dispositivo.
        </p>
      </section>

      <section>
        <h2>2. Cookies y almacenamiento utilizados</h2>
        <p>
          P&N Impresión 3D utiliza tecnologías técnicas necesarias para
          determinadas funcionalidades de la tienda.
        </p>

        <h3 className='mt-5 font-bold text-white'>Cookie de autenticación</h3>

        <ul>
          <li>
            <strong>Nombre:</strong> __Secure-better-auth.session_token
          </li>
          <li>
            <strong>Dominio:</strong> pn3d.es
          </li>
          <li>
            <strong>Finalidad:</strong> mantener la sesión de los usuarios
            autenticados.
          </li>
          <li>
            <strong>Sistema:</strong> Better Auth.
          </li>
          <li>
            <strong>Duración:</strong> determinada por la configuración de
            autenticación. En la comprobación realizada se observó una caducidad
            aproximada de siete días.
          </li>
          <li>
            <strong>Características:</strong> HttpOnly, Secure y SameSite=Lax.
          </li>
        </ul>

        <h3 className='mt-5 font-bold text-white'>
          Almacenamiento del carrito
        </h3>

        <ul>
          <li>
            <strong>Identificador:</strong> pn-cart-user-v2:…
          </li>
          <li>
            <strong>Tecnología:</strong> localStorage.
          </li>
          <li>
            <strong>Finalidad:</strong> conservar los artículos seleccionados en
            el carrito.
          </li>
          <li>
            <strong>Almacenamiento:</strong> navegador del usuario.
          </li>
          <li>
            <strong>Duración:</strong> hasta su eliminación mediante las
            funciones de la aplicación, el borrado de los datos del navegador u
            otros mecanismos aplicables.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Cookies técnicas y consentimiento</h2>
        <p>
          Las tecnologías descritas se utilizan para proporcionar funciones
          solicitadas por los usuarios, como mantener una sesión autenticada o
          conservar los productos del carrito.
        </p>
        <p>
          Las cookies y tecnologías estrictamente necesarias para prestar un
          servicio solicitado por el usuario pueden estar exceptuadas de la
          obligación de obtener consentimiento, conforme a la normativa
          aplicable.
        </p>
        <p>
          La tienda utiliza Cloudflare Web Analytics para estadísticas de visitas y rendimiento.
          También ofrece, previo consentimiento, Google Tag Manager (contenedor GTM-KZZJ26DZ)
          para medir compras, analítica y atribución de productos en Google.
          Las categorías opcionales de analítica y publicidad pueden aceptarse o rechazarse
          independientemente. Sin autorización, la etiqueta de Google no se carga.
        </p>
        <p>
          Cloudflare Web Analytics declara no utilizar cookies ni almacenamiento
          persistente para medir visitas. Si el usuario autoriza el seguimiento de Google,
          sus etiquetas pueden utilizar cookies e identificadores para medición y atribución
          de conversiones, según las categorías aceptadas y la configuración de Google.
          El consentimiento se conserva localmente mediante la clave
          pn3d-google-consent-v1 y puede modificarse desde «Configurar cookies» en el pie.
        </p>
      </section>

      <section>
        <h2>4. Servicios de terceros</h2>
        <p>
          P&N Impresión 3D utiliza proveedores externos para prestar
          determinados servicios, entre ellos Stripe para el procesamiento de
          pagos.
        </p>
        <p>
          Cuando el usuario accede a servicios o páginas gestionados
          directamente por terceros, estos pueden utilizar sus propias
          tecnologías de almacenamiento conforme a sus respectivas políticas de
          privacidad y cookies.
        </p>
        <p>
          Para obtener información sobre Stripe puede consultar su{' '}
          <a
            href='https://stripe.com/es/privacy'
            target='_blank'
            rel='noopener noreferrer'
            className='text-[#B5FF67] underline'
          >
            política de privacidad
          </a>
          .
        </p>
      </section>

      <section>
        <h2>5. Gestión y eliminación de cookies</h2>
        <p>
          Los usuarios pueden consultar, bloquear o eliminar cookies y
          almacenamiento local mediante la configuración de su navegador.
        </p>
        <p>
          La eliminación de determinadas cookies técnicas puede provocar el
          cierre de sesión. El borrado del almacenamiento local también puede
          eliminar el contenido guardado del carrito.
        </p>
      </section>

      <section>
        <h2>6. Modificaciones de esta política</h2>
        <p>
          Esta política será actualizada cuando se incorporen nuevas tecnologías
          de almacenamiento o cambien las finalidades de las existentes.
        </p>
        <p>
          La gestión del consentimiento se realiza con el panel de preferencias.
          Los usuarios pueden retirar su consentimiento en cualquier momento
          mediante «Configurar cookies» en el pie de la web.
        </p>
      </section>

      <section>
        <h2>7. Responsable y contacto</h2>
        <p>
          <strong>Responsable:</strong> Luis Miguel Rodriguez Gutierrez, titular
          de P&N Impresión 3D.
        </p>
        <p>
          <strong>Contacto:</strong>{' '}
          <a href='mailto:info@pn3d.es' className='text-[#B5FF67] underline'>
            info@pn3d.es
          </a>
        </p>
        <p>
          <strong>Última actualización: 25 de noviembre de 2026.</strong>
        </p>
      </section>
    </LegalPage>
  );
}
