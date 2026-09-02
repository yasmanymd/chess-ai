# ¿Por qué construir Chess AI en público y con asistencia de IA?

Muchos proyectos comienzan con una funcionalidad. Chess AI comenzó con una pregunta más incómoda: **¿qué sucede realmente cuando una persona desarrolla software serio con IA a su lado?**

Es fácil enseñar un prompt bonito, una pantalla generada y una demo final. Es más difícil—y más útil—mostrar las decisiones, los supuestos erróneos, las pruebas rotas, las revisiones y el juicio humano entre esos puntos. Ese es el experimento detrás de Chess AI.

## El producto es real. El registro también.

Chess AI es una plataforma web multijugador en construcción: las personas pueden jugar, revisar partidas y, con el tiempo, aprender mediante material guiado. La primera versión empieza deliberadamente pequeña: dos personas pueden encontrarse sin cuentas, jugar una partida validada por el servidor y usar los primeros ejercicios educativos.

La aplicación es solo la mitad del proyecto. La otra mitad es un diario público de desarrollo. Cada milestone conserva un plan, decisiones aprobadas, evidencia de implementación y el registro de lo que cambió cuando la realidad contradijo la primera propuesta.

No se trata de demostrar que la IA reemplaza a los ingenieros. Se trata de hacer inspeccionable la ingeniería asistida.

## ¿Quién decide?

Yasmany es el responsable de las decisiones. La IA ayuda a investigar, explicar compensaciones, preparar borradores, implementar trabajo aprobado y comprobar supuestos. No decide silenciosamente en qué se convierte el producto.

Las decisiones importantes—hacer que el servidor sea la autoridad de las jugadas, publicar el proceso o aplazar las cuentas—se discuten y aprueban de manera explícita. Las decisiones repetidas y de bajo riesgo pueden delegarse cuando su regla ya está clara.

El resultado no es «la IA construye todo sola» ni «la IA es solo autocompletado». Es un modelo de colaboración con responsabilidad visible.

## Por qué el ajedrez es una prueba honesta

El ajedrez parece simple desde lejos. En software se convierte rápidamente en un problema de sistemas: navegador, tiempo real, comandos concurrentes, estado autoritativo, persistencia, recuperación, accesibilidad, internacionalización y aprendizaje.

También plantea una pregunta que una interfaz bonita no puede resolver: ¿quién decide si una jugada es legal? Chess AI responde que el servidor es la autoridad. El navegador propone; el servidor valida, persiste y publica el estado resultante. Ese límite permite juego justo hoy y repeticiones, recuperación y ejercicios fiables mañana.

## También publicaremos la fricción

Una sugerencia de IA puede parecer plausible y aun así ser incorrecta. Durante la primera configuración, una versión de paquete propuesta por IA no existía. Una migración asumió cosas que TypeScript no detectó. Una configuración de contenedores creó carpetas no deseadas en la máquina anfitriona. Cada problema se convirtió en corrección, prueba y aprendizaje.

Este diario incluirá enfoques descartados, comportamientos inesperados en teléfonos y navegadores, fallos de CI y la evidencia usada para resolverlos. La promesa es modesta: no una historia de automatización sin fricción, sino un registro práctico de cómo una persona cuidadosa puede usar IA para construir software confiable.

## Siguiente

El primer milestone empezó antes de que apareciera una sola pieza en pantalla. Empezó con una pregunta menos glamorosa: ¿podría alguien clonar el proyecto y comenzar a trabajar sin reconstruir el entorno a mano?
