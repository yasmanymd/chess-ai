# Hito 5: Una partida que vale la pena recordar

Cuando una partida termina, un tablero en vivo tiene dos caminos: desaparecer o convertirse en un registro del que alguien pueda aprender.

El Hito 5 le dio a Chess AI esa segunda vida. Las partidas completadas pasaron a ser entradas públicas de archivo que se pueden reproducir jugada a jugada, exportar como PGN y usar como frontera para una experiencia privada de importación PGN.

## Publicar una partida terminada sin acoplarlo todo

El atajo evidente habría sido dejar que la pantalla de archivo consultara directamente las tablas activas de Game. No lo tomamos. El módulo Game posee el juego; Archive posee una proyección de lectura diseñada para descubrir y reproducir.

Cuando una partida llega a un estado final, el outbox transaccional ya existente escribe un hecho durable `game.completed` junto a `game.updated`. Un proyector idempotente de Archive consume ese hecho y crea un registro `archived_games` con sus movimientos archivados. La proyección contiene nombres públicos, resultado, motivo de terminación, hora de finalización, FEN inicial y final, y movimientos confirmados.

La palabra _idempotente_ importa. Una entrega puede repetirse sin crear entradas duplicadas. Al iniciar, también se ejecuta una recarga repetible para partidas que terminaron antes de que existiera la proyección. No añadíamos solo una página: dábamos a las partidas terminadas una ruta durable de publicación.

## Una repetición debe ser determinista, no teatral

El archivo público se puede leer deliberadamente sin una cookie de sesión. Las personas pueden descubrir partidas terminadas, abrir una y recorrer la línea registrada con controles de inicio, anterior, reproducir/pausar, siguiente y final.

La repetición no pide al servicio de juego en vivo reconstruir un momento pasado. Parte del FEN inicial archivado y usa los estados `fen_after` de los movimientos registrados. Así, tablero, jugada resaltada, orientación y coordenadas son una lectura determinista del registro archivado.

Las pruebas en desktop y teléfono cambiaron detalles que parecen pequeños pero son esenciales para estudiar: el tablero debía seguir siendo legible, la jugada seleccionada debía ser obvia y los controles debían funcionar al tocar. Una repetición es una conversación con una partida anterior; perder el lugar rompe esa conversación.

## PGN es una promesa a otras herramientas de ajedrez

El ajedrez tiene una ventaja útil: ya cuenta con un lenguaje para las partidas. PGN permite llevar una partida a otra aplicación, compartirla o guardarla fuera del producto.

El exportador toma el contrato público de repetición de Archive, no accede directamente a la persistencia de Game. Escapa valores de etiquetas, emite la línea principal SAN confirmada y añade el resultado oficial. Se puede copiar el PGN o descargar un archivo `.pgn` desde una ruta del mismo origen.

La frontera transmite el mismo mensaje que el resto del proyecto: reutiliza datos por medio de un contrato explícito, no mediante acceso privado cómodo.

## Importar es privado por diseño

También queríamos que alguien pudiera pegar un PGN o elegir un archivo `.pgn` para estudiarlo en Chess AI. Pero importar la partida de otra persona no debe publicarla en silencio.

El contrato de importación acepta un PGN de ajedrez estándar, limitado a una partida, valida la línea principal y la coherencia del resultado, acepta comentarios y variaciones pero expone solo la línea principal verificada, y devuelve una representación de repetición en memoria. La página `/import` la conserva únicamente en el estado de la pestaña actual. Al refrescar, cerrar o importar otra partida, desaparece. No se escribe nada en Game, Archive ni la base de datos.

Esa pequeña decisión de privacidad hizo más clara la función: el archivo público es para partidas jugadas dentro del producto; la importación privada es para exploración personal.

## El límite del MVP sigue visible

Todas las partidas completadas son públicas en este MVP de identidad temporal. Visibilidad por cuenta, moderación, selección de varias partidas, navegación de variantes, anotaciones, edición y variantes de ajedrez quedan para el futuro. La limitación se dice con claridad, no se esconde tras un “próximamente” ambiguo.

Al terminar M5, Chess AI podía hacer más que alojar una partida. Podía recordarla, explicarla mediante una repetición y hablar un idioma estándar más allá de su propia interfaz. Ese fue el puente hacia las funciones educativas posteriores.

## Fuentes del registro de construcción

- [Plan del Hito 5](../../plan/milestone-5-archive-and-chess-interchange-plan.md)
- [Sesión 032: planificación](../../ai/sessions/032-milestone-5-planning.md)
- [Sesión 033: proyección de archivo](../../ai/sessions/033-milestone-5-1-archive-projection.md)
- [Sesión 034: archivo y repetición pública](../../ai/sessions/034-milestone-5-2-public-archive-and-replay.md)
- [Sesión 035: exportación PGN](../../ai/sessions/035-milestone-5-3-pgn-export.md)
- [Sesión 036: importación PGN privada](../../ai/sessions/036-milestone-5-4-private-pgn-import.md)
- [Sesión 037: validación de salida](../../ai/sessions/037-milestone-5-exit-validation.md)
