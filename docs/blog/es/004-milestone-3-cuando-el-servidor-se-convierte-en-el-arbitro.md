# Hito 3: Cuando el servidor se convierte en el árbitro

Durante un tiempo, Chess AI podía llevar a dos personas a la misma mesa. Eso es multijugador, técnicamente. Pero todavía no es ajedrez.

La pregunta decisiva del Hito 3 era fácil de formular y exigente de implementar: **cuando un jugador pulsa una casilla, ¿quién decide si ocurrió una jugada de ajedrez?**

La respuesta no podía ser el navegador. Un navegador puede estar desactualizado, modificado, desconectado por un momento o simplemente equivocado. Si él decide que un caballo se movió, cada jugador termina con su propia versión de la partida. El servidor tenía que convertirse en el árbitro.

## Poner la biblioteca de ajedrez detrás de una puerta

Elegimos `chess.js` para las reglas del ajedrez estándar, pero evitamos deliberadamente que sus tipos o su API se propagaran por todo el proyecto. En su lugar, el servidor posee un `ChessRulesPort`: contratos escritos en el lenguaje del proyecto para posiciones FEN, intenciones de movimiento, destinos legales, notación SAN, hechos de terminación y salida PGN. Solo un adaptador importa la biblioteca.

Esa separación puede parecer formal para una primera versión. Dio resultados de inmediato. Los casos de referencia cubrieron jugadas normales, jugadas ilegales, jaques, jaque mate, ahogado, enroque, captura al paso, promoción, reconstrucción FEN, SAN, repetición y reglas de conteo de movimientos. Una prueba de arquitectura evita que una importación cómoda en el futuro salte esa frontera.

La IA cometió además un error útil. Una suposición inicial sobre la API de enroque de la biblioteca era incorrecta: expone predicados separados para enroque corto y largo, no uno genérico. El adaptador se corrigió antes de convertirse en un contrato público. Una frontera pequeña y aislada convirtió un error de implementación en una lección contenida, no en una dependencia repartida por todo el proyecto.

## Una jugada es una transacción, no una animación

Cuando un jugador envía `e2` hacia `e4`, el servidor hace mucho más que mover un dibujo:

1. Autentica la sesión temporal y confirma que esa identidad pertenece a la partida.
2. Bloquea el registro de la partida activa y revisa la versión esperada, el turno y si el comando ya fue usado.
3. Pregunta al adaptador de reglas si la jugada es legal.
4. En una transacción de PostgreSQL guarda la SAN aceptada, ambos límites FEN, el siguiente turno, el estado y un nuevo número de versión.
5. Solo después de confirmar emite `game.updated`, una señal para que los clientes consulten el estado confirmado.

Los comandos ilegales, obsoletos, duplicados, no autorizados o fuera de turno se rechazan con códigos públicos estables y no cambian la partida. Por eso el producto puede afirmar que el tablero cambia solo después de que el servidor lo confirme.

El navegador no anima deliberadamente las piezas de forma optimista. Dibuja el FEN confirmado, ofrece selección por clic o toque y pistas de destinos legales, y espera al servidor. Así el modelo de autoridad se vuelve visible, no solo una intención arquitectónica.

## Una partida necesita que el tiempo importe

Los relojes introducen otra trampa: un temporizador mostrado por un navegador no es un reloj confiable. El servidor guarda ambos tiempos restantes y la marca de inicio del turno, calcula el tiempo transcurrido dentro de la transacción autoritativa, aplica el incremento de Blitz solo tras una jugada aceptada y termina la partida cuando el jugador activo se queda sin tiempo.

El navegador puede estimar la visualización entre instantáneas, pero no puede salvar a un jugador cuyo tiempo ya expiró. La diferencia se hizo visible en las pruebas: llegar a `0:00` ahora termina la partida automáticamente, sin esperar a que alguien intente otra jugada.

El Hito 3 añadió también rutas de cierre controladas por el servidor: jaque mate, ahogado, material insuficiente, abandono, ofertas y aceptación de tablas, reclamaciones de tablas elegibles y tiempo agotado. Cada acción del ciclo de vida queda registrada junto al resultado final.

## La revisión humana cambió la pantalla de juego

Las reglas eran solo la mitad del hito. La otra mitad fue abrir el producto repetidamente en navegadores y teléfonos reales.

Esa revisión transformó la experiencia: selección deliberada de promoción, mensajes localizados, orientación para el jugador de negras, coordenadas, resaltado de la última jugada, historial con desplazamiento, relojes junto a cada jugador y una lista que permite entender de un vistazo quién eres, qué color tienes y a quién le toca. Las partidas terminadas ganaron un ganador por nombre y una ruta clara para volver al lobby.

No son detalles decorativos. En una partida entre dos personas, no saber quién juega o si una jugada fue aceptada es un defecto del producto.

## Lo que sigue siendo difícil

M3 no afirmó resolver todos los problemas de sistemas distribuidos. La repetición durable de respuestas, la reconstrucción después de reiniciar, la entrega mediante outbox transaccional y un endurecimiento mayor de concurrencia se dejaron intencionalmente para el Hito 4. El hito protegió la transición de jugadas con una versión y rechazó duplicados de forma segura; no fingió que esa fuera toda la historia de confiabilidad.

Ese es el valor de trabajar por hitos. Al terminar M3, dos personas podían completar una partida estándar desde la interfaz, con el servidor imponiendo reglas y relojes. La siguiente pregunta ya no era si Chess AI podía jugar ajedrez. Era si podía cumplir sus promesas cuando fallaran la red, el proceso o la entrega de eventos.

## Fuentes del registro de construcción

- [Plan del Hito 3](../../plan/milestone-3-authoritative-chess-play-plan.md)
- [Sesión 020: planificación](../../ai/sessions/020-milestone-3-planning.md)
- [Sesión 021: frontera de reglas](../../ai/sessions/021-milestone-3-rules-boundary.md)
- [Sesión 022: transacción autoritativa de jugadas](../../ai/sessions/022-milestone-3-authoritative-move-transaction.md)
- [Sesión 025: relojes, cierre y acciones](../../ai/sessions/025-milestone-3-closure-implementation.md)
