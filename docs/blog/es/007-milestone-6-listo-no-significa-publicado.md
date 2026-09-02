# Hito 6: Listo no significa publicado

Hay una frase peligrosa en software: «funciona en mi máquina». La versión más peligrosa es «está listo para lanzar», cuando nadie ha decidido dónde correrá, quién lo operará o cuáles serán las promesas legales.

El Hito 6 hizo una afirmación distinta para Chess AI: el proyecto podía evaluarse para un despliegue futuro. **No** creó una cuenta de hosting, compró un dominio, expuso la aplicación públicamente ni fingió que esas decisiones ya estaban tomadas.

## Hacer repetible la calidad antes de hacerla pública

El primer artefacto fue un flujo de GitHub Actions. En pushes, pull requests y ejecuciones manuales instala el runtime fijado y verifica formato, lint, TypeScript, fronteras de arquitectura, pruebas unitarias, integración con PostgreSQL, accesibilidad de navegador y una compilación Docker reproducible para release.

La primera ejecución remota falló. `pnpm/action-setup` intentó instalarse con supuestos que no se cumplían en el runner y la compilación de release reveló un problema de compilación del servidor. Esos fallos fueron evidencia valiosa, no vergüenza. Eliminamos la dependencia oculta del instalador, alineamos CI con la versión explícita de pnpm usada por Docker, corregimos el build y registramos la corrección. La cuarta ejecución pasó todos los trabajos.

Esa secuencia es precisamente la razón de CI: no mostrar una insignia verde, sino descubrir qué cosas el entorno local estaba perdonando en silencio.

## Una forma de producción sin proveedor de producción

Documentamos una topología de referencia portable: contenedores web y API, PostgreSQL administrado externamente y una instancia de API detrás de Caddy. Caddy terminará HTTPS cuando un operador futuro aporte dominio, correo de la autoridad certificadora y URL de base de datos administrada. Ninguno de esos datos está en el repositorio.

Un experimento aislado similar a release construyó las imágenes reales, aplicó migraciones contra PostgreSQL desechable y sirvió la interfaz y `/api/ready` mediante Caddy en HTTP local. También comprobó los encabezados de seguridad del borde. Eso prueba coherencia de configuración; no afirma validar HTTPS público, porque aún no existe un dominio real.

El hito registró además las necesidades operativas neutrales a proveedor: logs estructurados, métricas y trazas, correlación, backup y restauración, rollback, respuesta a incidentes, límites de tasa, análisis de dependencias y secretos, y una revisión orientada a OWASP ASVS. Escoger proveedor corresponde a quien asumirá el costo y el riesgo operativo.

## Capacidad es un escenario, no un eslogan

El experimento local acordado apuntó a 100 partidas simultáneas y 500 conexiones Socket.IO autenticadas durante cinco minutos. El primer perfil de carga creó accidentalmente una ráfaga sincronizada de 100 comandos. En vez de presentarla como la carga prevista, se corrigió el runner para distribuir las jugadas a lo largo de cada ronda de 27 segundos y se reconstruyó explícitamente el cliente de carga separado.

La ejecución corregida mantuvo las 500 conexiones, aceptó 1,100 jugadas legales, registró cero errores de comandos válidos y cero desconexiones, con 15 ms p50 y 21 ms p95 observados por el cliente. Bajo condiciones locales documentadas cumplió el contrato aceptado. Es evidencia de una base, no una predicción del tráfico global de internet.

## La evidencia tiene audiencia

La preparación incluyó verificar cómo encuentran la aplicación las personas: recorridos críticos en inglés, español y francés; Chrome y Safari; desktop y teléfono; además de controles automatizados de accesibilidad. La documentación también hace visibles las evidencias faltantes: las pruebas manuales en Firefox y Edge siguen siendo bloqueadores para un lanzamiento público.

Lo mismo ocurre con decisiones legales y operativas. Licencia, política de privacidad, términos, proveedor, dominio, HTTPS real, observabilidad de producción, entrega multiinstancia y escalado no están escondidos en un backlog. Se nombran como bloqueadores.

Al terminar M6, Chess AI estaba listo para evaluarse para despliegue, no desplegado. La diferencia es un acto de honestidad de ingeniería. Un release no es una imagen Docker que compila; es un compromiso con usuarios, operación, seguridad y consecuencias.

## Fuentes del registro de construcción

- [Plan del Hito 6](../../plan/milestone-6-release-readiness-plan.md)
- [Sesión 038: planificación de preparación](../../ai/sessions/038-milestone-6-release-readiness-planning.md)
- [Sesión 039: CI y build reproducible](../../ai/sessions/039-milestone-6-1-ci-and-release-build.md)
- [Sesión 040: corrección del primer CI](../../ai/sessions/040-milestone-6-1-first-ci-run-correction.md)
- [Sesión 041: base de operaciones](../../ai/sessions/041-milestone-6-2-production-operations-baseline.md)
- [Sesión 042: capacidad y resiliencia](../../ai/sessions/042-milestone-6-3-capacity-resilience-decisions.md)
- [Sesión 043: evidencia de release](../../ai/sessions/043-milestone-6-4-release-evidence.md)
