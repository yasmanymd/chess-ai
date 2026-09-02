# Milestone 1: Antes de la partida, una puerta que valga la pena abrir

Después del Milestone 0, Chess AI podía arrancar de forma fiable. Todavía no se sentía como un producto. No había puerta pública, identidad visual, selección de idioma ni una respuesta tranquilizadora ante un fallo.

El Milestone 1 cambió eso. Antes de pedir a dos personas que confiaran una partida a la plataforma, hicimos una pregunta más simple: **¿funciona la primera página para una persona real, en un dispositivo real y en un idioma que entiende?**

## El diseño es una decisión de producto

Yasmany no se presentó como diseñador gráfico. En vez de fingir que el diseño visual era secundario, pidió a la IA ayuda para convertir la intención del producto en una dirección de diseño.

Se compararon estilos educativo, competitivo-moderno y clásico. La decisión útil no fue elegir una estética permanente, sino hacer el producto tematizable desde el principio: los temas de aplicación quedarían separados de los del tablero, habría un tema accesible por defecto y los usuarios podrían elegir alternativas sin reescribir la interfaz.

## Tres idiomas, no una casilla futura

Inglés, español y francés no se añadieron después. La shell nació para servir los tres. El selector recuerda una elección explícita y todo el texto público cambia de forma consistente.

El detalle que lo hizo creíble fue la mejora progresiva. Con JavaScript, el cambio parece inmediato. Sin JavaScript, aparece un botón Apply y se navega a una página renderizada por el servidor en el idioma elegido. El proyecto se negó a convertir «JavaScript cargó» en un requisito de accesibilidad.

## Un teléfono encontró la brecha

Las pruebas se hicieron también desde dispositivos de la red local. Safari móvil reveló un defecto incómodo: el renderizado solo del cliente podía dejar la pantalla inicial incompleta y sin estilo mientras cargaban módulos de desarrollo. El renderizado de servidor corrigió el problema visible, pero el primer arreglo todavía dependía de eventos del cliente para cambiar idioma y usar los botones.

La prueba en un teléfono físico encontró esa segunda brecha. La versión final añadió navegación de respaldo en servidor y una prueba de navegador con JavaScript deshabilitado. El primer éxito en escritorio no era suficiente.

## Fallar de forma segura

El hito también definió cómo falla la aplicación: rutas desconocidas muestran un límite de error localizado con referencia segura y regreso al inicio, no un stack trace. Si la API no está disponible, el teléfono muestra un aviso seguro y se recupera cuando vuelve el servicio.

Por detrás, el servidor registra solicitudes estructuradas con identificadores de correlación. No es una captura espectacular, pero hace más humano el diagnóstico posterior.

## La lección

La shell es donde la arquitectura se encuentra con la primera impresión humana. Chess AI aprendió a tratar idioma, carga, fallo y dispositivos móviles como parte del producto, no como limpieza posterior.

El siguiente milestone permitiría por fin reclamar una identidad temporal y entrar al lobby público.

## Registro fuente

- [Fundamentos de diseño](../../ai/sessions/011-design-foundations.md)
- [Persistencia de idioma](../../ai/sessions/012-locale-persistence.md)
- [Validación de salida de M1](../../ai/sessions/016-milestone-1-exit-validation.md)
