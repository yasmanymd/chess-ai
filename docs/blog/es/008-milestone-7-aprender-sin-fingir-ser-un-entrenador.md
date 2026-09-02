# Hito 7: Aprender sin fingir ser un entrenador

Chess AI siempre tuvo la intención de ser más que un lugar donde dos personas se encuentran para jugar. El acta del proyecto dejaba espacio para una futura plataforma educativa: ejercicios, cursos, entrenadores y estudiantes. Cuando ya existían el multijugador, las partidas duraderas y la repetición, era tentador saltar directamente a la frase que cualquier producto de ajedrez quiere usar: _entrenador con IA_.

No lo hicimos.

En su lugar, el Hito 7 planteó una pregunta más útil: ¿cuál es la experiencia de aprendizaje más pequeña que podemos hacer realmente confiable?

La respuesta fue deliberadamente modesta. Mostrar una posición. Pedir un movimiento. Dejar que el servidor decida si el intento es aceptado. Dar una respuesta útil. Permitir que la persona vuelva a intentarlo.

Parece demasiado pequeño para resultar interesante. En la práctica nos obligó a decidir qué tipo de producto educativo queríamos construir.

## Seis posiciones, no un currículo imaginario

El primer catálogo contiene seis ejercicios públicos: dos mates en una jugada, dos posiciones para ganar material y dos ejercicios de mejor jugada. Cada uno tiene un único movimiento aceptado, una consigna, una pista y una explicación en inglés, español y francés.

No hay panel de autoría. No hay editor de base de datos. No hay cuenta. No hay un botón de «generar un ejercicio».

Eso no fue un atajo disfrazado de funcionalidad. Fue una decisión de producto. En esta etapa, cada ejercicio es contenido editorial versionado. Un pull request puede mostrar exactamente qué posición, explicación y movimiento aceptado se están publicando. Podemos revisar la lección, no solamente un registro insertado en una base de datos.

Para un proyecto público desarrollado abiertamente, esa visibilidad importa. Un ejercicio de ajedrez no es solo información. Es una afirmación: _este movimiento vale la pena aprenderlo y esta explicación ayuda a entender por qué_.

## Un rompecabezas también necesita una autoridad

El navegador puede dibujar el tablero, aceptar toques y hacer que la lección se sienta inmediata. No puede ser el juez de si la persona resolvió el ejercicio.

Cuando alguien envía una jugada, el navegador manda al servidor el identificador del ejercicio y el movimiento normalizado. El servidor carga la definición del ejercicio, valida el movimiento mediante la misma frontera de reglas de ajedrez que usa el juego multijugador y solo entonces lo compara con la solución que controla el servidor.

Así reutilizamos un principio que ya había dado forma a las partidas: el cliente propone; el servidor decide.

La diferencia importa incluso en un ejercicio individual. Un navegador modificado no debería poder marcar un rompecabezas como completado declarando correcta su propia respuesta. Más importante aún: mantener la regla en un único lugar confiable permite que la interacción educativa herede las mismas comprobaciones de legalidad que una partida real.

La respuesta es deliberadamente sobria. Una jugada legal pero incorrecta recibe una pista breve y localizada, y devuelve a la persona a la posición original. Una respuesta correcta recibe una explicación editorial concisa y una invitación a continuar. No revelamos inmediatamente la solución después de un error. El objetivo es conservar el pequeño, pero importante, acto de volver a pensar.

## La orientación también enseña

Un detalle inicial parecía de presentación, pero en realidad era diseño instruccional. Cada ejercicio se orienta desde el lado de quien resuelve: si deben mover las negras, las piezas negras aparecen abajo y las coordenadas siguen esa orientación.

De ese modo, el tablero no obliga a girar mentalmente la lección antes de resolverla. También mantiene honestas las etiquetas de las coordenadas. Es fácil posponer decisiones pequeñas como esta hasta que se convierten en inconsistencias de todo el producto.

El progreso sigue la misma filosofía limitada de forma intencional. Las completaciones se guardan solo en el almacenamiento local del navegador actual. El catálogo puede mostrar lo resuelto y una acción de reinicio pide confirmación antes de borrar ese registro local. No se crea una cuenta en silencio; no se envía el historial de aprendizaje a ningún sitio.

Es útil ahora, privado por defecto y explícito sobre sus límites.

## La corrección no estuvo en el ajedrez, sino en nuestra suposición

El hito nos dejó un pequeño recordatorio sobre la evidencia de las pruebas. Una prueba inicial del servidor asumía que la jugada de dama `Qf8` era ilegal. El adaptador de reglas de ajedrez indicó correctamente que no lo era. El código de producción no estaba equivocado; lo estaba la premisa de nuestra prueba.

Corregimos la prueba para usar una jugada que realmente deja al rey bajo ataque. Este es exactamente el tipo de corrección del desarrollo asistido por IA que vale la pena conservar en el registro público: la prueba parecía segura de sí misma, pero la seguridad no es evidencia.

Hubo una segunda corrección en la frontera del navegador. Un idioma seleccionado en la URL podía diferir del idioma ya persistido por el cliente. Durante la hidratación, esa diferencia podía volver inestable una ruta interactiva de estudio. La solución garantizó que el idioma de la URL se aplique antes de que el cliente se conecte. La internacionalización no era solo un problema de etiquetas; formaba parte de que la interacción funcionara.

## Lo que decidimos no afirmar

No hay integración con Stockfish. No hay motor remoto. No hay explicaciones generadas en tiempo real. No afirmamos que un modelo esté ofreciendo entrenamiento autoritativo.

Tampoco hay variantes, líneas de varias jugadas, currículos adaptativos, contenido de pago ni perfiles de aprendizaje sincronizados. Son futuros plausibles, no funcionalidades que nos hayamos ganado el derecho de presentar como terminadas.

El objetivo de este hito no era simular una escuela de ajedrez completa. Era establecer un camino claro y revisable desde una posición de ajedrez hasta una respuesta educativa autoritativa.

Al finalizar, el proyecto tenía seis ejercicios traducidos, un catálogo público, tableros orientados a quien resuelve, progreso solo local, validación del servidor y pruebas de navegador para la pista al reintentar, la solución aceptada, la persistencia y el reinicio. Eso no es un entrenador con IA. A esta altura es algo más útil: un sistema pequeño de aprendizaje que solo hace las promesas que puede cumplir.

## Fuentes

- [Plan de fundamentos educativos del Hito 7](../../plan/milestone-7-educational-foundations-plan.md)
- [Sesión 044: planificación de fundamentos educativos](../../ai/sessions/044-milestone-7-educational-foundations-planning.md)
