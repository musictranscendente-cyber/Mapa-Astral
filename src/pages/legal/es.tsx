import { Section } from './common'
import { CONTACT_EMAIL } from './contact'

const email = <b>{CONTACT_EMAIL}</b>

export function TermsEs() {
  return (
    <>
      <p>Bienvenido a <b>Cosmic Sky</b>. Al usar la app, aceptas estos Términos. Si no estás de acuerdo, no utilices el servicio.</p>
      <Section title="1. Qué es Cosmic Sky">
        <p>
          Cosmic Sky calcula cartas astrales, el cielo del día, previsiones, sinastrías y revoluciones solares a partir de efemérides
          astronómicas, y presenta interpretaciones astrológicas para el autoconocimiento y el entretenimiento.
        </p>
        <p>
          <b>La astrología no es una ciencia exacta.</b> Las interpretaciones tienen carácter simbólico y reflexivo y <b>no sustituyen</b> la
          orientación médica, psicológica, jurídica, financiera ni de ningún otro profesional. Las decisiones tomadas con base en la app
          son de tu exclusiva responsabilidad.
        </p>
      </Section>
      <Section title="2. Análisis completos">
        <p>
          Los análisis completos son textos personalizados generados automáticamente por un sistema de redacción de terceros, a partir
          de las posiciones calculadas de tu carta. Pueden contener imprecisiones y deben leerse como reflexión, no como verdad absoluta.
        </p>
      </Section>
      <Section title="3. Cuenta">
        <ul>
          <li>Puedes usar parte de la app sin cuenta. Para guardar cartas en la nube y comprar servicios, debes entrar con Google o con tu e-mail.</li>
          <li>Eres responsable de los datos de nacimiento que ingresas y de tener autorización para registrar datos de otras personas.</li>
          <li>La app está destinada a mayores de 18 años, o a menores con autorización de sus responsables.</li>
          <li>Puedes eliminar tu cuenta en cualquier momento en <b>Mi cuenta → Eliminar cuenta</b>.</li>
        </ul>
      </Section>
      <Section title="4. Planes y compras individuales">
        <ul>
          <li>Los pagos fuera de Brasil se procesan con <b>Stripe</b> (tarjeta, en dólares estadounidenses); en Brasil, con <b>Mercado Pago</b> (en reales). Cosmic Sky nunca recibe ni almacena datos de tarjetas.</li>
          <li>Los planes <b>no se renuevan automáticamente</b>: valen por el período comprado (1 mes o 1 año). Comprar de nuevo el mismo plan suma el tiempo restante; cambiar de plan inicia un nuevo período.</li>
          <li>Los servicios individuales se desbloquean para la carta elegida. Las Previsiones valen por el período comprado (30 días, 3 meses o 12 meses); el Paquete Cumpleaños y el Retorno Lunar valen 1 año. Cada compra individual incluye una generación del análisis completo de ese servicio; las nuevas versiones requieren una nueva compra o un plan.</li>
          <li>Los análisis de los planes forman una cuota mensual única, válida para todos los servicios, que se renueva el día 1 de cada mes y no se acumula.</li>
          <li>
            <b>Reembolsos:</b> puedes pedir el reembolso dentro de los 7 días posteriores a la compra escribiendo a {email}. Las compras ya
            utilizadas (análisis generados) pueden tener un reembolso proporcional.
          </li>
          <li>Los precios y condiciones pueden cambiar; las compras ya realizadas mantienen las condiciones de la fecha de compra.</li>
        </ul>
      </Section>
      <Section title="5. Uso adecuado">
        <p>
          No está permitido usar la app con fines ilícitos, intentar eludir límites de acceso o pagos, copiar el contenido a gran escala
          ni perjudicar el servicio. Las cuentas que violen estos Términos pueden ser suspendidas.
        </p>
      </Section>
      <Section title="6. Propiedad intelectual">
        <p>
          Los textos, interpretaciones, diseño, marca y código de Cosmic Sky pertenecen a sus titulares. Puedes compartir imágenes y
          textos de tu propia carta para uso personal.
        </p>
      </Section>
      <Section title="7. Disponibilidad y responsabilidad">
        <p>
          Trabajamos para mantener la app disponible y precisa, pero se ofrece "tal cual" y puede tener interrupciones, cambios o errores.
          En la medida permitida por la ley, no nos responsabilizamos por daños indirectos derivados del uso de las interpretaciones.
        </p>
      </Section>
      <Section title="8. Contacto">
        <p>Dudas, soporte y pedidos de reembolso: {email}.</p>
      </Section>
      <Section title="9. Cambios y ley aplicable">
        <p>
          Estos Términos pueden actualizarse; la fecha de arriba indica la versión vigente. Se rigen por la legislación de Brasil, sin
          perjuicio de los derechos del consumidor obligatorios de tu país de residencia.
        </p>
      </Section>
    </>
  )
}

export function PrivacyEs() {
  return (
    <>
      <p>Esta Política explica qué datos usa <b>Cosmic Sky</b>, para qué y cuáles son tus derechos.</p>
      <Section title="1. Datos que usamos">
        <ul>
          <li><b>Datos de nacimiento</b> (nombre, fecha, hora y lugar) que ingresas para calcular las cartas — tuyas y de otras personas que registres.</li>
          <li><b>Datos de la cuenta</b>: e-mail y, si entras con Google, nombre y foto del perfil.</li>
          <li><b>Compras</b>: producto, monto, fecha y estado del pago. Los datos de pago quedan en Stripe o Mercado Pago.</li>
          <li><b>Uso de los análisis</b>: cuántos análisis completos se generaron, para controlar tu cuota.</li>
          <li><b>Conteo anónimo de visitas</b>: un código aleatorio del dispositivo, sin nombre, e-mail ni dirección IP, para saber cuántas personas usan la app y de dónde vienen (por ej.: un enlace compartido).</li>
          <li><b>Ubicación</b>: solo cuando tocas "Dónde estoy". No guardamos tu historial de ubicación.</li>
        </ul>
      </Section>
      <Section title="2. Para qué los usamos">
        <ul>
          <li>Calcular y mostrar tus cartas, previsiones e informes.</li>
          <li>Sincronizar tus cartas entre dispositivos cuando entras en tu cuenta.</li>
          <li>Procesar compras y desbloquear el acceso pago.</li>
          <li>Generar los análisis completos, enviando solo las posiciones calculadas de la carta y el nombre ingresado.</li>
          <li>Mejorar la app con estadísticas anónimas de uso.</li>
        </ul>
        <p>No vendemos tus datos ni los usamos para publicidad.</p>
      </Section>
      <Section title="3. Dónde se guardan y con quién los compartimos">
        <ul>
          <li><b>En tu dispositivo</b>: cartas, preferencias y análisis ya generados quedan guardados en el navegador.</li>
          <li><b>Supabase</b>: alojamiento del acceso, las cartas sincronizadas, las compras y las estadísticas.</li>
          <li><b>Stripe</b> y <b>Mercado Pago</b>: procesamiento de pagos.</li>
          <li><b>Anthropic</b>: servicio de redacción automatizada que genera los análisis completos.</li>
          <li><b>Google</b>: acceso con cuenta de Google, si eliges esa opción.</li>
        </ul>
        <p>Algunos de estos proveedores pueden tratar datos fuera de tu país, con las salvaguardas adecuadas.</p>
      </Section>
      <Section title="4. Por cuánto tiempo">
        <p>
          Conservamos tus datos mientras tu cuenta exista. Al eliminar la cuenta, se borran las cartas de la nube y el acceso; los
          registros de compras pueden guardarse durante el plazo exigido por la legislación fiscal. Los datos del dispositivo pueden
          borrarse en <b>Mi cuenta → Salir y borrar cartas de este dispositivo</b>.
        </p>
      </Section>
      <Section title="5. Tus derechos">
        <p>
          Puedes acceder, corregir, exportar o eliminar tus datos en cualquier momento (la eliminación, directamente en <b>Mi cuenta →
          Eliminar cuenta</b>) y revocar consentimientos. Para cualquier pedido, escríbenos a {email}. También puedes reclamar ante la
          autoridad de protección de datos de tu país.
        </p>
      </Section>
      <Section title="6. Seguridad">
        <p>Usamos conexiones cifradas, control de acceso por cuenta (cada persona solo lee sus propios datos) y no guardamos contraseñas — el acceso es con Google o con un código enviado al e-mail.</p>
      </Section>
      <Section title="7. Cambios">
        <p>Esta Política puede actualizarse; la fecha de arriba indica la versión vigente.</p>
      </Section>
    </>
  )
}
