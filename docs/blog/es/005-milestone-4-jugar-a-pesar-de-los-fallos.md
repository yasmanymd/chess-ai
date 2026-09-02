# Hito 4: Jugar a pesar de los fallos

La primera partida real reveló una verdad que todo sistema multijugador acaba encontrando: no basta con que una jugada sea legal. ¿Qué pasa si se reintenta la petición, falla la notificación, se reinicia el servidor o llegan dos peticiones idénticas a la vez?

El Hito 4 fue la respuesta de Chess AI. Su objetivo no era hacer el juego más vistoso, sino lograr que las partidas confirmadas sobrevivan fallos normales sin perder, duplicar ni corromper el estado que posee el servidor.

## Reintentar no debe significar jugar dos veces

Las redes reintentan. Los navegadores reintentan. Las personas pulsan dos veces. Tratar cada petición como nueva puede convertir una sola jugada deseada en dos transiciones.

Añadimos un registro durable de comandos, identificado por partida e ID de comando del cliente. Si un comando ya tuvo éxito, el servidor devuelve el resultado confirmado que guardó en vez de volver a ejecutar la transición. La regla se aplica tanto a jugadas como a acciones de la partida.

Es un contrato pequeño con un efecto grande: los clientes pueden reintentar con seguridad. Y, más importante aún, las solicitudes duplicadas concurrentes quedan protegidas en la base de datos. La fila de la partida se bloquea antes de consultar el registro; la primera transacción guarda una jugada y un reintento competidor ve ese mismo resultado.

## Guardar la intención de notificar junto a la jugada

Antes de M4, una jugada confirmada y una notificación en tiempo real eran acciones vecinas. Parece suficiente hasta que el proceso falla entre ambas. La partida puede ser correcta mientras los jugadores nunca se enteran de que cambió.

La solución fue un outbox transaccional. En la misma transacción PostgreSQL que guarda una jugada confirmada, abandono, acción de tablas o tiempo agotado, el servidor guarda también una intención de entrega `game.updated`. El cambio de estado y la promesa de avisar se almacenan juntos o no se almacena ninguno.

Un despachador separado toma los registros pendientes con un arrendamiento temporal, los publica y los marca entregados solo después del éxito. Si la publicación falla, libera el arrendamiento y programa otro intento con espera exponencial limitada. Al reiniciar el servidor, el ciclo de entrega continúa.

Esto no convierte Socket.IO en autoridad. Hace lo contrario: las notificaciones son avisos reintentables de forma explícita, mientras HTTP sigue siendo la fuente del estado confirmado.

## Recuperarse es un comportamiento del producto

La respuesta del navegador ante una reconexión no es «esperar que llegue el evento perdido». Las pantallas de partida y lobby vuelven a consultar sus datos autoritativos al reconectar Socket.IO y al volver visible una pestaña oculta; la revalidación periódica queda como respaldo.

Esa decisión evita fusionar frágiles cargas de notificación con estado local. El navegador pregunta a la fuente de verdad cómo está la partida ahora. La marca persistida de inicio de turno significa también que un reloj activo continúa después de reiniciar el servidor: el tiempo no se pausa porque un proceso se haya reiniciado.

## La confiabilidad también incluye reglas de ajedrez

M4 cerró una brecha importante en reglas. El historial confirmado se reproduce mediante el puerto de reglas propio para que la repetición dependa de toda la partida real, no solo de la última posición. La quíntuple repetición se convierte en tablas automáticas y se aplica también la condición automática de setenta y cinco jugadas. Una prueba de duplicados concurrentes y una posición de repetición de 16 medias jugadas verifican ambas cosas.

## Límites honestos

Las pruebas pasaron TypeScript, lint, arquitectura, integración aislada con PostgreSQL, fallo inyectado de publicación, accesibilidad de navegador y formato. Pero el hito no declaró victoria sobre todas las preocupaciones de producción.

La entrega de Socket.IO sigue siendo al menos una vez y está limitada al proceso local. El outbox de PostgreSQL es durable, pero no es un bus de mensajería externo ni una solución multirregión. La recuperación basada en cuentas y los paneles de observabilidad quedaron deliberadamente para después.

Esa honestidad también es arquitectura. Al terminar M4, Chess AI podía mantener una partida coherente frente a los fallos que ya encuentra un producto multijugador local. El proyecto no solo aprendió a aceptar una jugada; aprendió a seguir creyendo en esa misma jugada cuando algo sale mal.

## Fuentes del registro de construcción

- [Plan del Hito 4](../../plan/milestone-4-durability-recovery-concurrency-plan.md)
- [Sesión 026: planificación](../../ai/sessions/026-milestone-4-planning.md)
- [Sesión 027: registro durable de comandos](../../ai/sessions/027-milestone-4-1-durable-command-ledger.md)
- [Sesión 028: outbox reintentable](../../ai/sessions/028-milestone-4-2-outbox-dispatch.md)
- [Sesión 029: recuperación tras reinicio y reconexión](../../ai/sessions/029-milestone-4-3-recovery.md)
- [Sesión 031: validación de salida](../../ai/sessions/031-milestone-4-exit-validation.md)
