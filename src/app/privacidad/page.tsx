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
      intro='Borrador sobre el tratamiento de datos personales cuando se utiliza P&N Impresión 3D.'
    >
      <section>
        <h2>1. Responsable del tratamiento</h2>
        <p>
          <strong>Luis Miguel Rodriguez Gutierrez</strong> (autónomo), con
          domicilio en{' '}
          <strong>
            Avenida Antonio Machado 155, C. P.: 41230, Castilblanco de los
            Arroyos (Sevilla), España
          </strong>{' '}
          y correo para ejercer derechos <strong>info@pn3d.es</strong>.
        </p>
      </section>
      <section>
        <h2>2. Datos y finalidades</h2>
        <ul>
          <li>
            Cuenta y autenticación: nombre, correo, credenciales protegidas y
            datos técnicos de sesión para permitir el acceso.
          </li>
          <li>
            Presupuestos: datos de contacto, características del encargo y
            comunicaciones para gestionar la solicitud.
          </li>
          <li>
            Pedidos: datos de identificación, entrega, líneas del pedido y
            seguimiento para gestionar compras y obligaciones asociadas.
          </li>
          <li>
            Seguridad: registros técnicos imprescindibles para prevenir abusos y
            atender incidencias.
          </li>
        </ul>
        <p>
          No se prevé utilizar los datos para publicidad personalizada ni
          boletines comerciales sin revisar e incorporar antes las garantías y
          opciones correspondientes.
        </p>
      </section>
      <section>
        <h2>3. Bases jurídicas</h2>
        <p>
          La gestión de solicitudes y pedidos puede basarse en medidas
          precontractuales y ejecución de contratos; determinadas obligaciones
          contables y fiscales se fundamentan en obligaciones legales. El uso de
          medidas técnicas de seguridad puede fundamentarse en el interés
          legítimo ponderado del responsable.{' '}
          <strong>[PENDIENTE: VALIDAR CADA TRATAMIENTO Y SU BASE]</strong>.
        </p>
      </section>
      <section>
        <h2>4. Proveedores y transferencias</h2>
        <p>
          La aplicación utiliza servicios técnicos para alojamiento, base de
          datos, autenticación, imágenes y protección de formularios. Se deberán
          confirmar las entidades contratadas, su ubicación, el acceso a datos,
          acuerdos de encargo y posibles transferencias internacionales. Antes
          de activar pagos, se incorporará la información correspondiente al
          proveedor de pago.{' '}
          <strong>
            [PENDIENTE: INVENTARIO DEFINITIVO DE PROVEEDORES Y GARANTÍAS]
          </strong>
          .
        </p>
      </section>
      <section>
        <h2>5. Conservación</h2>
        <p>
          Los datos se conservarán durante el tiempo necesario para prestar el
          servicio y atender responsabilidades legales. Los plazos concretos de
          cuentas, presupuestos, registros técnicos y documentación fiscal están{' '}
          <strong>[PENDIENTES DE DEFINIR Y DOCUMENTAR]</strong>.
        </p>
      </section>
      <section>
        <h2>6. Derechos</h2>
        <p>
          Las personas interesadas pueden solicitar, cuando proceda, acceso,
          rectificación, supresión, oposición, limitación o portabilidad y
          retirar los consentimientos otorgados, sin afectar a la licitud del
          tratamiento anterior. El canal previsto será{' '}
          <strong>info@pn3d.es</strong>. También pueden presentar una
          reclamación ante la{' '}
          <a href='https://www.aepd.es/' className='text-[#B5FF67] underline'>
            Agencia Española de Protección de Datos
          </a>
          .
        </p>
      </section>
      <section>
        <h2>7. Cookies y almacenamiento local</h2>
        <p>
          Consulta la{' '}
          <Link href='/cookies' className='text-[#B5FF67] underline'>
            política de cookies
          </Link>
          . La cesta puede utilizar almacenamiento local del navegador; las
          sesiones de autenticación requieren tecnologías técnicas de
          identificación.
        </p>
      </section>
      <section>
        <h2>8. Revisión y fecha</h2>
        <p>
          Versión de trabajo: 4 de noviembre de 2026.{' '}
          <strong>
            [PENDIENTE: FECHA EFECTIVA DE PUBLICACIÓN Y VALIDACIÓN LEGAL]
          </strong>
          .
        </p>
      </section>
    </LegalPage>
  );
}
