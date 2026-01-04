# Synapse Diagnostics

Plataforma de auditoría estratégica en vivo para el Sistema Synapse™ de Smart Growth Online.

## 🚀 Deploy en Vercel

### Paso 1: Crear cuenta en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Click en "Sign Up"
3. Selecciona "Continue with GitHub"
4. Autoriza Vercel en tu cuenta de GitHub

### Paso 2: Subir a GitHub
```bash
# En tu terminal, dentro de la carpeta del proyecto
git init
git add .
git commit -m "Initial commit - Synapse Diagnostics"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/synapse-diagnostics.git
git push -u origin main
```

### Paso 3: Deploy en Vercel
1. En Vercel, click "Add New Project"
2. Selecciona el repositorio "synapse-diagnostics"
3. Framework Preset: Vite
4. Click "Deploy"

### Paso 4: Configurar dominio personalizado
1. En tu proyecto de Vercel, ve a "Settings" > "Domains"
2. Agrega: `diagnostics.smartgrowth.online`
3. En tu DNS (donde tengas el dominio), agrega:
   - Tipo: CNAME
   - Nombre: diagnostics
   - Valor: cname.vercel-dns.com

### Paso 5: Configurar Webhook (opcional)
1. En Vercel, ve a "Settings" > "Environment Variables"
2. Agrega:
   - Nombre: `VITE_WEBHOOK_URL`
   - Valor: `https://tu-n8n.com/webhook/synapse-diagnostics`
3. Redeploy el proyecto

## 📊 Datos del Webhook

Cuando se completa un diagnóstico, se envía al webhook:

```json
{
  "timestamp": "2025-01-03T...",
  "prospecto": {
    "nombre": "Juan Pérez",
    "email": "juan@empresa.com",
    "tipoNegocio": "coach",
    "facturacion": "10-20k"
  },
  "captura": { /* todos los datos capturados */ },
  "resultado": {
    "nivel": "growth",
    "cuelloBotella": { "dimension": "filter", "label": "..." },
    "scores": { "glas": 2.5, "nexus": 3, ... },
    "riesgos": [...],
    "diagnosticoCentral": "...",
    "advertencia": "..."
  },
  "metricas": {
    "inversionMensual": "2000",
    "cpl": "5.20",
    "cpa": "150",
    "roas": "16.67",
    "tasaCierre": "28.5"
  }
}
```

## 🛠 Desarrollo local

```bash
npm install
npm run dev
```

## 📝 Licencia

Propiedad de Smart Growth Online LLC.
