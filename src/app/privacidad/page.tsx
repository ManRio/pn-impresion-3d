import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <LegalPage
      title='Política de privacidad'
      intro='Información sobre el tratamiento y la protección de los datos personales de los usuarios y clientes de P&N Impresión 3D, conforme al Reglamento General de Protección de Datos (RGPD) y la legislación española aplicable.'
      showDraftNotice={false}
    >
      <section>
        <h2>1. Responsable del tratamiento</h2>
        <p>El responsable del tratamiento de los datos personales es:</p>
        <ul>
          <li>
            <strong>Nombre:</strong> Luis Miguel Rodriguez Gutierrez.
          </li>
          <li>
            <strong>Actividad:</strong> P&N Impresión 3D.
          </li>
          <li>
            <strong>Domicilio:</strong> Avenida Antonio Machado 155, C. P.
            41230, Castilblanco de los Arroyos (Sevilla), España.
          </li>
          <li>
            <strong>Correo electrónico:</strong>{' '}
            <a href='mailto:info@pn3d.es' className='text-[#B5FF67] underline'>
              info@pn3d.es
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Datos personales y finalidades</h2>
        <p>
          P&N Impresión 3D trata los datos personales necesarios para prestar
          sus servicios de comercio electrónico e impresión 3D.
        </p>

        <ul>
          <li>
            <strong>Cuentas de usuario:</strong> nombre, correo electrónico,
            credenciales protegidas y datos técnicos necesarios para el
            registro, inicio de sesión y gestión de la cuenta.
          </li>
          <li>
            <strong>Pedidos:</strong> datos identificativos, dirección de
            entrega, productos adquiridos, importes y estado de los pedidos.
          </li>
          <li>
            <strong>Pagos:</strong> información necesaria para gestionar
            operaciones mediante Stripe. Los datos completos de las tarjetas se
            introducen en el entorno del proveedor de pagos y no se almacenan en
            la base de datos de la tienda.
          </li>
          <li>
            <strong>Presupuestos personalizados:</strong>
            datos de contacto, descripciones, archivos facilitados por el
            cliente y comunicaciones relacionadas con el encargo.
          </li>
          <li>
            <strong>Contacto y atención al cliente:</strong>
            información facilitada al realizar consultas, solicitar asistencia o
            presentar reclamaciones.
          </li>
          <li>
            <strong>Seguridad:</strong> datos técnicos necesarios para proteger
            las cuentas, detectar incidencias y prevenir usos abusivos.
          </li>
        </ul>

        <p>
          Los datos se utilizan exclusivamente para las finalidades indicadas y
          las obligaciones relacionadas con ellas. No se realizan campañas de
          publicidad personalizada ni se envían boletines comerciales mediante
          los tratamientos descritos en esta política.
        </p>
      </section>

      <section>
        <h2>3. Bases jurídicas del tratamiento</h2>

        <p>
          El tratamiento de los datos se fundamenta, según su finalidad, en las
          siguientes bases del artículo 6 del RGPD:
        </p>

        <ul>
          <li>
            <strong>Ejecución contractual:</strong>
            gestión de cuentas vinculadas al servicio, pedidos, pagos, entregas
            y atención relacionada con las compras.
          </li>
          <li>
            <strong>Medidas precontractuales:</strong>
            elaboración de presupuestos y respuesta a solicitudes de
            contratación.
          </li>
          <li>
            <strong>Obligación legal:</strong>
            cumplimiento de obligaciones fiscales, contables y demás exigencias
            legales.
          </li>
          <li>
            <strong>Interés legítimo:</strong>
            protección de la plataforma, prevención de abusos y atención de
            consultas generales, previa valoración de los derechos e intereses
            de las personas afectadas.
          </li>
          <li>
            <strong>Consentimiento:</strong>
            cuando sea necesario para tratamientos opcionales que requieran
            autorización expresa del interesado.
          </li>
        </ul>

        <p>
          Los datos señalados como obligatorios en los formularios son
          necesarios para gestionar el servicio solicitado. No facilitarlos
          puede impedir tramitar un pedido, presupuesto o consulta.
        </p>
      </section>

      <section>
        <h2>4. Proveedores y destinatarios de datos</h2>

        <p>
          Para el funcionamiento de la tienda se utilizan los siguientes
          servicios tecnológicos:
        </p>

        <ul>
          <li>
            <strong>Railway:</strong> alojamiento de la aplicación web.
          </li>
          <li>
            <strong>Neon:</strong> infraestructura de base de datos PostgreSQL.
          </li>
          <li>
            <strong>Stripe:</strong> procesamiento de pagos y gestión de
            transacciones.
          </li>
          <li>
            <strong>Resend:</strong> envío de correos electrónicos
            transaccionales relacionados con pedidos y comunicaciones del
            servicio.
          </li>
          <li>
            <strong>Cloudinary:</strong> almacenamiento y distribución de
            imágenes y archivos cuando corresponda.
          </li>
          <li>
            <strong>OVHcloud:</strong> servicio de correo electrónico comercial.
          </li>
          <li>
            <strong>Cloudflare:</strong> gestión del dominio y servicios
            técnicos de red que se encuentren habilitados.
          </li>
        </ul>

        <p>
          Además, los datos necesarios para realizar entregas podrán comunicarse
          a los operadores de transporte correspondientes, como Correos. También
          podrán comunicarse a administraciones públicas cuando exista una
          obligación legal.
        </p>

        <p>
          Estos proveedores pueden intervenir como encargados del tratamiento o
          responsables independientes, según las funciones desempeñadas y las
          condiciones aplicables a cada servicio.
        </p>
      </section>

      <section>
        <h2>5. Transferencias internacionales</h2>

        <p>
          Algunos de los proveedores tecnológicos utilizados pueden realizar
          operaciones de tratamiento o permitir accesos a datos personales desde
          países situados fuera del Espacio Económico Europeo.
        </p>

        <p>
          Cuando existan transferencias internacionales, deberán ajustarse a los
          mecanismos previstos en el RGPD, como las decisiones de adecuación de
          la Comisión Europea o las garantías apropiadas, incluidas las
          cláusulas contractuales tipo cuando correspondan.
        </p>

        <p>
          Las personas interesadas pueden solicitar información sobre los
          destinatarios, países y garantías aplicables a sus datos personales
          escribiendo a info@pn3d.es.
        </p>
      </section>

      <section>
        <h2>6. Conservación de los datos</h2>

        <p>
          Los datos personales se conservarán durante el tiempo necesario para
          cumplir las finalidades para las que fueron recogidos y las
          obligaciones legales correspondientes.
        </p>

        <ul>
          <li>
            <strong>Cuentas:</strong> mientras permanezcan activas y,
            posteriormente, durante los plazos exigibles para atender
            obligaciones legales o responsabilidades.
          </li>
          <li>
            <strong>Presupuestos y consultas:</strong>
            durante su tramitación y el periodo necesario para atender posibles
            responsabilidades derivadas.
          </li>
          <li>
            <strong>Pedidos y facturación:</strong>
            durante la relación contractual y los plazos de conservación
            establecidos por las normas fiscales, contables y mercantiles
            aplicables.
          </li>
          <li>
            <strong>Registros de seguridad:</strong>
            durante el tiempo necesario para detectar incidencias, prevenir
            abusos y cumplir las obligaciones aplicables.
          </li>
        </ul>

        <p>
          Una vez finalizados los plazos aplicables, los datos serán eliminados
          o, cuando corresponda legalmente, bloqueados durante el periodo
          exigible.
        </p>
      </section>

      <section>
        <h2>7. Derechos de los usuarios</h2>

        <p>
          Las personas interesadas pueden ejercer, cuando proceda, los
          siguientes derechos:
        </p>

        <ul>
          <li>Acceso a sus datos personales.</li>
          <li>Rectificación de datos inexactos.</li>
          <li>Supresión de sus datos.</li>
          <li>Oposición al tratamiento.</li>
          <li>Limitación del tratamiento.</li>
          <li>Portabilidad de los datos.</li>
          <li>
            Retirada del consentimiento cuando el tratamiento se base en él.
          </li>
        </ul>

        <p>
          Para ejercer estos derechos pueden escribir a{' '}
          <a href='mailto:info@pn3d.es' className='text-[#B5FF67] underline'>
            info@pn3d.es
          </a>
          . El responsable podrá solicitar información adicional cuando resulte
          necesaria para verificar la identidad del solicitante.
        </p>

        <p>
          También tienen derecho a presentar una reclamación ante la{' '}
          <a
            href='https://www.aepd.es/'
            target='_blank'
            rel='noopener noreferrer'
            className='text-[#B5FF67] underline'
          >
            Agencia Española de Protección de Datos
          </a>
          .
        </p>
      </section>

      <section>
        <h2>8. Seguridad de la información</h2>

        <p>
          P&N Impresión 3D utiliza mecanismos de autenticación y medidas
          técnicas de protección para reducir los riesgos de acceso no
          autorizado, pérdida, alteración o divulgación de datos.
        </p>

        <p>
          El acceso a la información administrativa se limita a los usuarios
          autorizados. La transmisión de información mediante el sitio web se
          realiza utilizando HTTPS.
        </p>
      </section>

      <section>
        <h2>9. Cookies y almacenamiento local</h2>

        <p>
          La tienda utiliza tecnologías técnicas necesarias para determinadas
          funciones.
        </p>

        <ul>
          <li>
            <strong>Autenticación:</strong> Better Auth utiliza cookies de
            sesión para mantener el acceso de los usuarios registrados.
          </li>
          <li>
            <strong>Carrito:</strong> se utiliza almacenamiento local del
            navegador para conservar los artículos seleccionados.
          </li>
        </ul>

        <p>
          Puede consultarse información adicional en nuestra{' '}
          <Link href='/cookies' className='text-[#B5FF67] underline'>
            política de cookies
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>10. Menores de edad</h2>

        <p>
          Los servicios de contratación de la tienda están dirigidos a personas
          con capacidad legal para contratar. Los menores que deseen realizar
          una compra deberán contar con la intervención o autorización de sus
          representantes legales cuando proceda.
        </p>
      </section>

      <section>
        <h2>11. Actualizaciones</h2>

        <p>
          Esta política podrá actualizarse cuando cambien los tratamientos de
          datos, los servicios utilizados o la normativa aplicable.
        </p>

        <p>
          <strong>Última actualización: 14 de noviembre de 2026.</strong>
        </p>
      </section>
    </LegalPage>
  );
}
