# Agente de Reportes Automáticos - Landing Diagnóstico

## Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `landing_agent.ts` | Script principal del agente |
| `run_daily_report.bat` | Ejecuta reporte diario |
| `run_weekly_report.bat` | Ejecuta reporte semanal |
| `task_daily_report.xml` | Configuración tarea diaria |
| `task_weekly_report.xml` | Configuración tarea semanal |
| `setup_tasks.bat` | Configura ambas tareas automáticamente |

---

## 🚀 Configuración Automática (Recomendado)

### Paso 1: Ejecutar setup
Haz doble clic en **`setup_tasks.bat`** y sigue las instrucciones.

Esto creará automáticamente las 2 tareas en el Programador de Tareas de Windows.

### Paso 2: Verificar
1. Abre "Programador de tareas" (busca `taskschd.msc`)
2. Verifica que existen las tareas:
   - `Landing Daily Report` (Lun-Jue 5:05 PM)
   - `Landing Weekly Report` (Vie 5:05 PM)

---

## 📧 Configuración del Email

El reporte se envía a: **juanmartinez@gfs.es**

Para cambiar el destinatario, edita `landing_agent.ts` línea 265:
```typescript
const email = 'tu-email@ejemplo.com';
```

---

## ⏰ Horarios programados

| Tarea | Días | Hora |
|-------|------|------|
| Landing Daily Report | Lunes, Martes, Miércoles, Jueves | 5:05 PM |
| Landing Weekly Report | Viernes | 5:05 PM |

---

## 📊 Métricas del reporte

- Visitantes únicos
- Iniciaron diagnóstico
- Completaron diagnóstico
- Abandonaron
- Agendaron llamada
- Descargaron informe
- Tasas de conversión
- Lista de nuevos leads
- Lista de abandonos (semanal)

---

## 🔧 Solución de problemas

### Si los reportes no se envían:
1. Verifica que Node.js esté instalado: `node --version`
2. Ejecuta manualmente el .bat para ver errores
3. Asegúrate de tener conexión a internet

### Para ejecutar manualmente:
```bash
# Diario
run_daily_report.bat

# Semanal
run_weekly_report.bat
```
