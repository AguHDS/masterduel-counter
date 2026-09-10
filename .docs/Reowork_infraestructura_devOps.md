# Implementar trabajo DevOps a mi proyecto

## Objetivo
Transformar la infraestructura actual (configuración manual en VPS) a un entorno DevOps completo.

## Estado actual
- Web completa y funcional
- VPS con configuración manual (Nginx, Node, PM2)
- Storage local en el VPS (sin servicios cloud externos)
- CI/CD básico con GitHub Actions (deploy simple por SSH, usa .github\workflows\ci.yml y .github\workflows\deploy.yml)
- Sin uso de docker

## Tareas pendientes (Plan hecho con mi conocimiento limitado, se puede/debe mejorar)

### Fase 1: Infraestructure as a code
- [ ] Crear configuración Terraform para el droplet de DigitalOcean
- [ ] Definir firewall con Terraform (puertos 22, 80, 443)
- [ ] Provisionar el servidor automáticamente: Node.js, Nginx, PM2
- [ ] Parametrizar configuraciones (variables para IP, región, tamaño)
- [ ] Documentar proceso de recreación completa desde cero

### Fase 2: Contenedores
- [ ] Crear Dockerfile para backend (Node.js)
- [ ] Crear Dockerfile para frontend (build + Nginx para servir estáticos)
- [ ] Docker Compose para orquestar ambos servicios localmente
- [ ] Versionar imágenes en Docker Hub o GitHub Container Registry
- [ ] Eliminar instalación manual de dependencias en el VPS

### Fase 3: CI/CD Real
- [ ] Build de imágenes Docker en el pipeline
- [ ] Push de imágenes al registry
- [ ] Deploy automático con Docker Compose en el VPS
- [ ] Rollback automático si el health check falla
- [ ] Notificaciones de deploy exitoso/fallido (Discord/Email, o algo mas sencillo) -> este paso es necesario realmenmte?

### Fase 4: Alta Disponibilidad Básica
- [ ] Health check endpoint en la aplicación (posiblemente en el la feature admin pannel - server management)
- [ ] Configurar PM2 en modo cluster (múltiples instancias)
- [ ] Auto-restart si el proceso muere

### Fase 5: Observabilidad
- [ ] Instalar Prometheus con exporters en el VPS
- [ ] Dashboard en Grafana con métricas básicas (CPU, memoria, uptime)
- [ ] Alertas por email cuando:
  - Servidor caído
  - CPU > 80%
  - Memoria > 80%
  - Disco > 90%
- [ ] Centralizar logs (PM2 logs → Loki o similar)

### Fase 6: Documentación
- [ ] Diagrama de arquitectura actual
- [ ] README con:
  - Cómo desplegar desde cero
  - Cómo hacer rollback
  - Cómo monitorear
  - Decisiones técnicas y trade-offs
  - Cosas necesarias importantes a saber
- [ ] Documentar escenarios de fallo y recuperación

## Notas importantes
- Mantener todo en Git (infraestructura versionada)
- Usar variables de entorno para secretos (nunca hardcodear)
- Probar cada fase en local antes de aplicarla al VPS
- Documentar cada error y solución encontrada

Nota (desde la ignorancia): Tener en cuenta que, al hacer esto probablemente tengamos que cambiar/modificar la feature Server Management que maneja los scripts de server y hace restart con pm2 en el admin pannel, porque al usar pm2 para el restart, esto no funcionaria con docker. Es asi??