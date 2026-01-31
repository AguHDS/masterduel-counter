# 🔧 Configuración de Sentry - Guía de Producción

## 📋 Checklist Pre-Producción

### 1. Variables de Entorno

Asegúrate de tener configurado en tu `.env`:

```env
# Sentry
VITE_SENTRY_DSN=https://your-actual-dsn@o123456.ingest.sentry.io/123456

# Environment
NODE_ENV=production
```

⚠️ **IMPORTANTE**: No commitear el DSN real al repositorio. Usar variables de entorno del hosting.

### 2. Source Maps (Recomendado)

Para stack traces legibles en producción, configura source maps:

#### Opción A: Vite Plugin (Recomendado)
```bash
npm install @sentry/vite-plugin --save-dev
```

Agregar a `vite.config.ts`:
```typescript
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  build: {
    sourcemap: true, // Habilitar source maps
  },
  plugins: [
    react(),
    sentryVitePlugin({
      org: "your-org",
      project: "your-project",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
```

#### Opción B: Sentry CLI Manual
```bash
# Instalar Sentry CLI
npm install @sentry/cli --save-dev

# Subir source maps después del build
npx sentry-cli releases files <release-version> upload-sourcemaps ./dist
```

### 3. Releases y Versioning

Configura releases en `sentry.ts`:

```typescript
Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: env.isProduction ? 'production' : 'development',
  release: 'masterduel-counter@1.0.0', // Usar tu versión actual
  // ... resto de la config
});
```

### 4. User Context

Si quieres identificar usuarios en Sentry, agrega después del login:

```typescript
// En tu feature de auth, después del login exitoso
import * as Sentry from '@sentry/react';

Sentry.setUser({
  id: user.id,
  username: user.username,
  email: user.email, // Opcional, considera privacidad
});

// Al hacer logout
Sentry.setUser(null);
```

## 🎯 Configuraciones Recomendadas por Ambiente

### Development
```typescript
Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: 'development',
  enabled: false, // No enviar a Sentry en desarrollo
  tracesSampleRate: 1.0, // 100% de traces
  replaysSessionSampleRate: 0, // No replay en dev
  replaysOnErrorSampleRate: 0,
  debug: true, // Logs de Sentry en consola
});
```

### Staging
```typescript
Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: 'staging',
  enabled: true,
  tracesSampleRate: 0.5, // 50% de traces
  replaysSessionSampleRate: 0.1, // 10% de sesiones
  replaysOnErrorSampleRate: 1.0, // 100% de errores
  debug: false,
});
```

### Production
```typescript
Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: 'production',
  enabled: true,
  tracesSampleRate: 0.1, // 10% de traces (para ahorrar cuota)
  replaysSessionSampleRate: 0.1, // 10% de sesiones
  replaysOnErrorSampleRate: 1.0, // 100% de errores
  debug: false,
});
```

## 🔒 Privacidad y Seguridad

### Enmascarar Datos Sensibles

```typescript
Sentry.init({
  // ... otras configs
  beforeSend(event, hint) {
    // Eliminar información sensible
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    
    // Redactar tokens de URLs
    if (event.request?.url) {
      event.request.url = event.request.url.replace(/token=[^&]+/, 'token=REDACTED');
    }
    
    return event;
  },
  
  // Configuración de replay
  replayIntegration({
    maskAllText: false, // Cambiar a true para privacidad extrema
    blockAllMedia: false,
    // Selectores CSS para enmascarar
    mask: ['.sensitive-data', '[data-sensitive]'],
    block: ['.credit-card', '[data-block]'],
  }),
});
```

### Ignorar Errores Conocidos

```typescript
Sentry.init({
  // ... otras configs
  ignoreErrors: [
    // Browser extensions
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    // Network errors que no podemos controlar
    'Network request failed',
    'Failed to fetch',
  ],
  
  denyUrls: [
    // Ignorar errores de extensiones de navegador
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
  ],
});
```

## 📊 Monitoreo y Alertas

### Configurar Alerts en Sentry Dashboard

1. **Error Rate Alert**
   - When: Error rate > 10 errors/min
   - Action: Email/Slack notification

2. **New Issue Alert**
   - When: First occurrence of an issue
   - Action: Immediate notification

3. **Regression Alert**
   - When: Previously resolved issue returns
   - Action: High priority notification

### Performance Monitoring

```typescript
// En componentes críticos
import * as Sentry from '@sentry/react';

function CriticalComponent() {
  useEffect(() => {
    const transaction = Sentry.startTransaction({
      name: 'CriticalComponent Mount',
      op: 'component.mount',
    });

    // Tu lógica...

    transaction.finish();
  }, []);
}
```

## 🚀 Deployment

### Netlify
```toml
# netlify.toml
[build.environment]
  VITE_SENTRY_DSN = "https://your-dsn@sentry.io/project"
```

### Vercel
```bash
# Agregar en Vercel Dashboard > Settings > Environment Variables
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project
```

### Docker
```dockerfile
# Dockerfile
ARG VITE_SENTRY_DSN
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN

RUN npm run build
```

## 📈 Cuotas y Límites

### Plan Free de Sentry (Límites)
- **Errors**: 5,000 events/month
- **Performance**: 10,000 transactions/month
- **Replays**: 50 replays/month

### Optimizar Uso de Cuota

```typescript
// Sampling estratégico
Sentry.init({
  tracesSampleRate: 0.1, // Solo 10% de transacciones
  
  // Sample basado en condiciones
  beforeSend(event) {
    // Solo enviar errores críticos en producción con poco tráfico
    if (shouldSampleThisError(event)) {
      return event;
    }
    return null; // Descartar evento
  },
});

function shouldSampleThisError(event) {
  // Lógica personalizada
  const isCritical = event.level === 'fatal' || event.level === 'error';
  const isFrequentError = checkIfFrequent(event.exception);
  
  if (isCritical && !isFrequentError) {
    return true;
  }
  
  // Sample 10% de errores no críticos
  return Math.random() < 0.1;
}
```

## 🧪 Testing en Local

Para probar Sentry en desarrollo SIN enviar eventos reales:

```typescript
// sentry.ts - Configuración de test
if (env.isDevelopment) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    enabled: false, // ← Importante: deshabilitado
    debug: true, // Ver logs en consola
    beforeSend(event) {
      console.log('SENTRY EVENT (not sent):', event);
      return null; // No enviar
    },
  });
}
```

## ✅ Checklist Final

Antes de ir a producción:

- [ ] DSN configurado en variables de entorno
- [ ] `enabled: true` en producción
- [ ] Source maps configurados (opcional pero recomendado)
- [ ] Releases configurados con versioning
- [ ] Alerts configurados en dashboard
- [ ] Probado en staging
- [ ] Privacidad: datos sensibles enmascarados
- [ ] Cuotas: sampling configurado apropiadamente
- [ ] User context configurado (opcional)
- [ ] Documentación compartida con el equipo

## 📞 Soporte

- Sentry Docs: https://docs.sentry.io/platforms/javascript/guides/react/
- Sentry Discord: https://discord.gg/sentry
- Issues: https://github.com/getsentry/sentry-javascript/issues
