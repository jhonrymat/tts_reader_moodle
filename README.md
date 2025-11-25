# 🔊 TTS Reader - Lector de Voz para Moodle

Plugin de bloque para Moodle 4.5+ que proporciona un widget flotante de texto a voz (TTS) usando la Web Speech API del navegador.

## ✨ Características

- 🎯 **Widget flotante** que aparece en todas las páginas de Moodle
- 🗣️ **Voces en español** con prioridad a voces latinoamericanas
- ⚙️ **Controles completos**: velocidad, volumen, pausa/reanudar
- 💾 **Persistencia de preferencias** usando localStorage del navegador
- 📱 **Diseño responsive** adaptado a móviles y tablets
- ♿ **Accesible** con soporte de teclado y lectores de pantalla
- 🎨 **Posicionable** en 6 ubicaciones diferentes de la pantalla
- 🚀 **Sin dependencias externas** - usa API nativa del navegador
- 🔒 **Compatible con GDPR** - no almacena datos personales en servidor

## 📋 Requisitos

- Moodle 4.5.7 o superior
- PHP 7.4 o superior
- Navegadores compatibles con Web Speech API:
  - Chrome/Edge 33+
  - Safari 16+
  - Firefox 49+ (soporte limitado)

## 🚀 Instalación

### Método 1: Instalación mediante ZIP (Recomendado)

1. **Descargar el plugin**
   - Descarga el archivo `tts_reader.zip`

2. **Instalar en Moodle**
   - Ve a `Administración del sitio > Plugins > Instalar plugins`
   - Arrastra el archivo ZIP o usa el selector de archivos
   - Click en "Instalar plugin desde archivo ZIP"

3. **Completar instalación**
   - Click en "Actualizar base de datos de Moodle"
   - El plugin se instalará automáticamente

### Método 2: Instalación Manual

1. **Extraer archivos**
   ```bash
   cd /ruta/a/moodle/blocks/
   unzip tts_reader.zip
   ```

2. **Verificar estructura**
   ```
   moodle/blocks/tts_reader/
   ├── version.php
   ├── block_tts_reader.php
   ├── settings.php
   ├── README.md
   ├── lang/
   │   └── es/
   │       └── block_tts_reader.php
   ├── db/
   │   └── access.php
   ├── classes/
   │   └── privacy/
   │       └── provider.php
   ├── styles.css
   └── tts_widget.js
   ```

3. **Activar plugin**
   - Ve a `Administración del sitio > Notificaciones`
   - Moodle detectará el nuevo plugin
   - Click en "Actualizar base de datos"

## ⚙️ Configuración

### Configuración Global (Administrador)

1. Ve a `Administración del sitio > Plugins > Bloques > Lector de Voz TTS`

2. Configura las opciones:
   - **Posición del widget**: Donde aparecerá el widget (derecha/izquierda, arriba/centro/abajo)
   - **Minimizar automáticamente**: Si el widget inicia minimizado
   - **Mostrar indicador**: Muestra indicador cuando está activo
   - **Velocidad predeterminada**: Velocidad inicial (0.5 - 2.0)
   - **Volumen predeterminado**: Volumen inicial (0 - 100)

### Añadir el Bloque a un Curso

1. **Entrar al curso** como profesor o administrador

2. **Activar edición**
   - Click en "Activar edición" en la esquina superior derecha

3. **Añadir bloque**
   - Click en "Añadir un bloque" en el panel lateral
   - Seleccionar "Lector de Voz TTS"

4. **El widget aparecerá automáticamente** en todas las páginas del curso

### Configuración para Todo el Sitio

Para que aparezca en **todas las páginas** de Moodle:

1. Ve a `Administración del sitio > Apariencia > Página principal`
2. En modo edición, añade el bloque "Lector de Voz TTS"
3. El widget aparecerá globalmente

## 🎮 Uso para Estudiantes

### Controles Básicos

1. **Abrir el widget**: Click en el icono flotante 🔊
2. **Seleccionar voz**: Elige una voz en español (⭐ = latinoamericana)
3. **Ajustar velocidad**: Desliza para cambiar velocidad (0.5x - 2.0x)
4. **Ajustar volumen**: Controla el volumen (0% - 100%)
5. **Reproducir**: Click en ▶️ para iniciar lectura
6. **Pausar**: Click en ⏸️ para pausar/reanudar
7. **Detener**: Click en ⏹️ para detener
8. **Minimizar**: Click en − para ocultar controles

### Preferencias Guardadas

El widget recuerda automáticamente:
- Voz seleccionada
- Velocidad de lectura
- Nivel de volumen
- Estado minimizado/expandido

## 🛠️ Solución de Problemas

### No aparecen voces en español

**Causa**: El navegador no tiene voces en español instaladas.

**Solución**:
- **Windows**: Instalar paquetes de idioma en Configuración > Hora e idioma > Idioma
- **macOS**: Las voces ya están incluidas
- **Android**: Descargar voces desde Google TTS en Play Store
- **iOS**: Las voces ya están incluidas en iOS 16+

### El widget no aparece

1. **Verificar que el bloque está añadido**
   - Ve al curso o página
   - Activa edición
   - Verifica que "Lector de Voz TTS" esté en la lista de bloques

2. **Limpiar caché**
   - `Administración del sitio > Desarrollo > Purgar todas las cachés`

3. **Verificar permisos**
   - El usuario debe tener capacidad `block/tts_reader:use`

### El audio se corta o no funciona

1. **Navegador no compatible**: Usa Chrome, Edge o Safari
2. **Contenido muy largo**: El navegador puede limitar la longitud
3. **Permisos del navegador**: Verifica que el sitio tiene permiso para audio

## 🔧 Desarrollo y Personalización

### Estructura de Archivos

```
blocks/tts_reader/
├── version.php              # Metadatos del plugin
├── block_tts_reader.php     # Clase principal del bloque
├── settings.php             # Configuración del administrador
├── styles.css               # Estilos del widget
├── tts_widget.js            # Lógica JavaScript
├── README.md                # Esta documentación
├── lang/es/
│   └── block_tts_reader.php # Traducciones español
├── db/
│   └── access.php           # Definición de permisos
└── classes/privacy/
    └── provider.php         # Cumplimiento GDPR
```

### Personalizar Estilos

Edita `styles.css` para cambiar:
- Colores del widget (busca `#f98012`)
- Tamaño del widget (busca `.widget-container`)
- Animaciones y transiciones

### Añadir Nuevos Idiomas

1. Crea carpeta `lang/en/` o el idioma que necesites
2. Copia `lang/es/block_tts_reader.php`
3. Traduce las cadenas de texto

### Modificar Selección de Contenido

En `tts_widget.js`, función `extractPageContent()`:
```javascript
var selectors = [
    '#region-main',      // Contenido principal
    '.course-content',   // Añade tus selectores aquí
    '[role="main"]'
];
```

## 📊 Características Técnicas

- **API utilizada**: Web Speech API (SpeechSynthesis)
- **Almacenamiento**: localStorage del navegador
- **Compatibilidad**: Moodle 4.5+, PHP 7.4+
- **Licencia**: GNU GPL v3
- **Tamaño**: ~50KB total
- **Rendimiento**: Sin impacto en servidor, procesa en cliente

## 🔒 Privacidad y Seguridad

- ✅ No almacena datos personales en el servidor
- ✅ Las preferencias se guardan localmente en el navegador
- ✅ Compatible con GDPR
- ✅ No realiza llamadas a servicios externos
- ✅ No requiere API keys ni costos adicionales
- ✅ Funciona completamente offline (después de cargar la página)

## 🆘 Soporte

### Reportar Problemas

Si encuentras un bug o tienes una sugerencia:

1. Verifica que estás usando la última versión
2. Revisa la sección de solución de problemas
3. Documenta el problema con capturas de pantalla
4. Incluye información de tu entorno (Moodle version, navegador, etc.)

### Logs de Depuración

Para activar logs de depuración:

1. En Moodle: `Administración del sitio > Desarrollo > Depuración`
2. En el navegador: Abre la consola (F12) y busca mensajes con "TTS"

## 🎯 Roadmap

Características planeadas para futuras versiones:

- [ ] Resaltado de texto mientras lee
- [ ] Control de salto entre párrafos
- [ ] Lista de reproducción para múltiples páginas
- [ ] Exportar audio a MP3
- [ ] Soporte para más idiomas
- [ ] Estadísticas de uso para profesores
- [ ] Integración con actividades específicas
- [ ] Voces premium (Azure, Google Cloud)

## 📝 Changelog

### v1.0.0 (2025-11-25)
- ✨ Lanzamiento inicial
- 🔊 Widget flotante con controles completos
- 🗣️ Soporte para voces en español
- 💾 Persistencia de preferencias
- 📱 Diseño responsive
- ♿ Accesibilidad mejorada
- 🔒 Cumplimiento GDPR

## 👥 Créditos

Desarrollado para Moodle 4.5.7 con ❤️

## 📄 Licencia

Este plugin es software libre bajo la licencia GNU GPL v3.
Ver LICENSE para más detalles.

---

**¿Necesitas ayuda?** Consulta la documentación de Moodle o contacta con tu administrador.