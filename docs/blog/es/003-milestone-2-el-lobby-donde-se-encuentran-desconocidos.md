# Hito 2: El lobby donde se encuentran desconocidos

Una partida multijugador no empieza con la primera jugada. Empieza con una pregunta mucho menos vistosa: **¿quién es este navegador?**

Hasta el Hito 2, Chess AI tenía una puerta pública y multilingüe. Parecía un producto, pero todavía no podía cumplir una promesa esencial del software multijugador: cuando llegan dos personas, el sistema puede distinguirlas, permitir que una espere a la otra y garantizar que las dos no ocupen el mismo asiento.

Queríamos esa experiencia sin construir prematuramente cuentas, contraseñas, verificación por correo ni todo un producto de gestión de usuarios. El resultado fue intencionalmente pequeño: una identidad temporal y un lobby público.

## Un nombre no es autenticación

El primer diseño tentador también era el incorrecto: pedir un nombre visible y tratarlo como la identidad del jugador. Es amigable, pero no es seguro. Cualquiera podría escribir `Yasmany` y convertirse en esa persona.

Por eso el nombre visible pasó a ser solamente la parte humana de la identidad. El servidor crea una credencial de sesión opaca, la envía únicamente en una cookie `HttpOnly`, `SameSite=Lax` y guarda solo un resumen criptográfico de esa credencial. Un navegador puede recuperar su identidad temporal al recargar; nadie puede suplantar a otro jugador simplemente por conocer el nombre que aparece en pantalla.

Los nombres siguen siendo únicos globalmente, pero esa unicidad exigía algo más cuidadoso que una restricción `UNIQUE` sobre texto crudo. El servidor recorta el valor, aplica normalización Unicode NFKC y compara una versión en minúsculas independiente del idioma, conservando la escritura original para mostrarla. Así se evita que variantes visualmente parecidas se conviertan silenciosamente en identidades distintas.

La lección no es que una aplicación de ajedrez hecha como hobby necesite ceremonias excesivas. Es que incluso una función ligera mejora cuando separa con claridad **lo que las personas ven** de **lo que el sistema confía**.

## Un lobby es un problema de concurrencia con una interfaz amable

El lobby permite abrir una mesa en espera, ver las mesas públicas, unirse a una o cancelar la propia. Es fácil imaginarlo como una lista con botones. La parte interesante aparece cuando dos navegadores pulsan “Unirse” casi al mismo tiempo.

Solo uno de ellos puede convertirse en el oponente.

Por eso el servidor trata la operación de unirse como una transacción de PostgreSQL. Bloquea la fila de la mesa en espera, confirma que sigue disponible, asigna el oponente y los colores, elimina la entrada de espera y crea la partida activa en una sola operación atómica. Una petición gana; la otra recibe una respuesta segura indicando que la mesa ya no está disponible. No queda una partida a medio emparejar ni se confía en el navegador que haya pintado primero.

Fue otro recordatorio útil del desarrollo asistido por IA: una propuesta de interfaz muy pulida puede ocultar la pregunta más importante. Aquí no era “¿cómo debe verse el botón Unirse?”, sino “¿qué debe seguir siendo cierto cuando las peticiones chocan?”.

## Tiempo real como aviso, no como fuente de verdad

Usamos HTTP para las lecturas y mutaciones autoritativas. Socket.IO tiene un trabajo más acotado: avisar a los navegadores interesados de que el lobby cambió o de que la partida comenzó. Cuando llega un aviso, el cliente consulta el estado actual al servidor.

Esa decisión vuelve aburridas las reconexiones y los eventos perdidos. El lobby también tiene un pequeño respaldo por sondeo para el estado de la partida actual, de forma que una notificación perdida no deja a un jugador atrapado en una pantalla obsoleta. El servidor conserva la autoridad; el navegador es una vista que puede recuperarse.

## La corrección móvil que mejoró la arquitectura

Una mejora inicial intentó interceptar los envíos de formularios con React. En páginas móviles cargadas parcialmente, ese manejador podía impedir el envío normal del navegador sin completar la petición mejorada. La experiencia resultaba peor que cualquiera de los dos enfoques por separado.

Eliminamos esa intercepción. Los formularios HTML nativos y las rutas del servidor se convirtieron en el camino principal; JavaScript puede mejorarlos, pero ya no es imprescindible para abrir o unirse a una mesa. La corrección nació de probar el flujo real en navegadores y dispositivos reales.

## Lo que el Hito 2 decidió no hacer

Cuando ambos jugadores llegaban a la pantalla de partida activa, el tablero todavía no era jugable. No había relojes, validación de jugadas legales ni motor de reglas. Esa contención era importante. El hito demostró identidad, visibilidad del lobby, emparejamiento atómico y llegada de ambos jugadores antes de sumar la complejidad del ajedrez.

El resultado visible fue modesto: dos personas podían elegir un nombre, encontrarse en un lobby público y llegar a la misma partida. Por debajo, el proyecto había cruzado una frontera importante. Dejaba de ser solo una interfaz con forma de ajedrez. Empezaba a ser un sistema multijugador.

## Fuentes del registro de construcción

- [Plan del Hito 2](../../plan/milestone-2-temporary-identity-and-lobby-plan.md)
- [Sesión 017: credencial de sesión temporal](../../ai/sessions/017-temporary-session-credential.md)
- [Sesión 018: base de la identidad temporal](../../ai/sessions/018-temporary-identity-foundation.md)
- [Sesión 019: lobby y entrega de la partida activa](../../ai/sessions/019-lobby-and-active-game-delivery.md)
