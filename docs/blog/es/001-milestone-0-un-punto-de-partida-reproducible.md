# Milestone 0: Un punto de partida reproducible

El primer tablero visible llegó después. La primera funcionalidad real fue menos fotogénica: un comando que tenía que funcionar en una máquina limpia.

La jugada inicial fue una promesa al siguiente desarrollador: clona el repositorio, ejecuta Docker Compose y obtén base de datos, servidor, aplicación web, migraciones y hot reload sin pasar la tarde reconstruyendo la computadora de otra persona.

```text
clonar repositorio → docker compose up --build → desarrollar
```

Esa promesa se convirtió en el Milestone 0.

## Por qué empezar aquí

El ajedrez multijugador no es solo un tablero. Necesita frontend, servidor, base transaccional, migraciones, conexiones en tiempo real y pruebas que hagan más que simular objetos. Si cada colaborador configura esas piezas de forma distinta, los errores invisibles aparecen antes de tener una pantalla pública.

Yasmany eligió un camino orientado a contenedores: Git y un Docker compatible serían los únicos requisitos del host. El repositorio usaría TypeScript, React, Node.js, PostgreSQL, pnpm y Turborepo, pero sin una lista privada de pasos locales.

## El entorno construido

El monorepo comenzó con `apps/web` y `apps/server`. Docker Compose coordina PostgreSQL, migraciones, servidor y aplicación web. Las versiones están fijadas: Node.js 24 LTS, pnpm 11, PostgreSQL 18 y referencias explícitas de contenedores.

El detalle que cambió la experiencia fue montar solo el código fuente. El primer diseño montaba el repositorio completo dentro de los contenedores. Funcionaba, pero hacía aparecer `node_modules` y el almacén de pnpm en el checkout anfitrión: lo contrario de la experiencia limpia buscada. Se cambió a una imagen de desarrollo que instala dependencias internamente y monta solo el código para hot reload.

## La realidad revisó el primer borrador

La primera construcción de contenedor hizo lo que debe hacer un entorno útil: cuestionó los supuestos optimistas.

Una versión de `@types/react-dom` propuesta por IA no existía en npm. La instalación real la detectó. pnpm 11 también rechazó por defecto el script de `esbuild`. En vez de permitir scripts ampliamente, el workspace autorizó solo la herramienta necesaria.

La primera migración reveló otra lección: una importación del migrador Kysely y un timestamp de PostgreSQL necesitaban corrección durante una migración real. El tipado era valioso, pero no podía demostrar que la migración funcionara contra PostgreSQL.

## Qué significó terminado

Los archivos de configuración no bastaban. La evidencia exigía PostgreSQL saludable, migraciones completas, servidor y web disponibles, hot reload, controles de calidad en contenedores y pruebas unitarias, integración con PostgreSQL real y navegador Playwright/axe. También se verificó que el host no conservara `node_modules` ni el almacén de pnpm.

Hubo una excepción registrada: Testcontainers necesitaba un ejecutor efímero con acceso al socket Docker; los servicios de aplicación siguieron siendo no-root. Reproducibilidad no significa ocultar excepciones, sino documentarlas para repetir el resultado.

## La lección

Un entorno reproducible no es trabajo administrativo antes del «desarrollo real». Es la primera decisión de producto sobre qué tan rápido, seguro y honestamente puede evolucionar el proyecto.

El siguiente milestone pudo concentrarse en algo visible: una interfaz pública, accesible y multilingüe. Pero lo hizo sobre un entorno que ya había tenido que demostrar que funcionaba.

## Registro fuente

- [Plan del Milestone 0](../../plan/milestone-0-bootstrap-plan.md)
- [Sesión de implementación](../../ai/sessions/010-milestone-0-bootstrap.md)
