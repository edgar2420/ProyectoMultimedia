# MediaVault — Sistema de Gestión Multimedia

Stack: **Django + React + PostgreSQL** | Arquitectura: **Hexagonal (Ports & Adapters)**

---

## Estado del Proyecto vs Requerimientos

### A. Procesamiento por tipo de archivo

| Requerimiento | Estado | Detalle |
|---|---|---|
| Detectar tipo de archivo subido | ✅ Completo | `get_file_type()` detecta por MIME type |
| **Imágenes** — thumbnails en diferentes resoluciones | ✅ Completo | `thumbnail_service.py` genera miniatura con Pillow |
| **Imágenes** — extracción de datos EXIF | ✅ Completo | `metadata_extractor.py` extrae width, height, cámara, ISO, GPS, fecha, etc. |
| **Video** — frame aleatorio como portada | ✅ Completo | `ffmpeg_thumbnail.py` extrae frame con FFmpeg |
| **Video** — duración, resolución, códecs | ✅ Completo | `ffprobe_extractor.py` extrae fps, codec, bitrate, resolución |
| **Audio** — metadatos (artista, álbum, duración) | ✅ Completo | `ffprobe_audio_extractor.py` extrae ID3 tags |
| **Audio** — visualización de onda al reproducir | ✅ Completo | `AudioWaveform.tsx` animación de barras en tiempo real |
| **PDF** — primera página como previsualización | ✅ Completo | `pymupdf_extractor.py` genera thumbnail de portada |
| **PDF** — conteo de páginas | ✅ Completo | `pdf_metadata.page_count` |
| Interfaz de carpetas y subcarpetas | ✅ Completo | Árbol de carpetas, breadcrumb, crear/renombrar/eliminar/mover |

---

### B. Etiquetas

| Requerimiento | Estado | Detalle |
|---|---|---|
| Etiquetar cada archivo multimedia | ✅ Completo | Modal de tags en cada archivo (FileCard + FileListView) |
| Crear etiquetas con color | ✅ Completo | `TagsPage` — paleta de 10 colores |
| Editar nombre y color de etiqueta | ✅ Completo | `TagEditModal` |
| Eliminar etiqueta | ✅ Completo | Con confirmación, se quita de todos los archivos |
| Ver etiquetas en cards de archivo | ✅ Completo | Badges con color en `FileCard` y `FileListView` |
| Filtrar archivos por etiqueta | ✅ Completo | `TagFilter` en `FilesPage`, multi-etiqueta AND |
| Etiquetas en sidebar para navegación rápida | ✅ Completo | Sección "Etiquetas" en sidebar con contador |
| Etiquetar múltiples archivos a la vez | ✅ Completo | `bulk_set_tags` endpoint + `BulkSetTagsUseCase` |

---

### C. Motor de Búsqueda y Filtrado Avanzado

| Requerimiento | Estado | Detalle |
|---|---|---|
| Búsqueda por nombre | ✅ Completo | `FilesPage` (carpeta actual) + `SearchPage` (cross-folder) |
| Búsqueda por fecha | ✅ Completo | `date_from` / `date_to` en `SearchPage` |
| Búsqueda por tipo | ✅ Completo | Filtros por tipo en `FilesPage` + multi-tipo en `SearchPage` |
| **Imágenes** — buscar por dimensiones (ancho/alto mín-máx) | ✅ Completo | `min_width`, `max_width`, `min_height`, `max_height` |
| **Imágenes** — buscar fotos con cámara específica | ✅ Completo | `camera_make` (ej: "Canon", "Samsung") |
| **Imágenes** — buscar solo fotos con EXIF | ✅ Completo | `has_exif=true` |
| **Videos** — buscar por duración (ej: más de 5 min) | ✅ Completo | `min_duration` / `max_duration` en segundos |
| **Videos** — buscar por codec, FPS, resolución | ✅ Completo | `video_codec`, `min_fps`, `min_video_width` |
| **Videos** — buscar solo videos con audio | ✅ Completo | `has_audio=true` |
| **Audio** — buscar por artista, álbum, género | ✅ Completo | `artist`, `album`, `genre` |
| **Audio** — buscar por duración | ✅ Completo | `min_audio_duration` / `max_audio_duration` |
| **PDF** — buscar por páginas mín/máx | ✅ Completo | `min_pages` / `max_pages` |
| **PDF** — buscar por autor o título | ✅ Completo | `pdf_author`, `pdf_title` |
| Filtros por tamaño de archivo | ✅ Completo | Presets: <1MB, 1-10MB, 10-50MB, >50MB |
| Búsqueda cross-folder (todas las carpetas) | ✅ Completo | `GET /media/files/search/` sin restricción de carpeta |
| Chips de filtros activos removibles | ✅ Completo | Visibles en `SearchPage` con botón × para quitar |
| Paginación en resultados | ✅ Completo | 24 por página, navegación anterior/siguiente |
| Tiempo de respuesta visible | ✅ Completo | `took_ms` en resultados de búsqueda |

---

### D. Seguridad y Acceso

| Requerimiento | Estado | Detalle |
|---|---|---|
| Login | ✅ Completo | JWT con `djangorestframework-simplejwt` |
| Register | ✅ Completo | Validación de nombre de usuario y contraseña |
| Espacio privado por usuario | ✅ Completo | Todos los queries filtran por `owner_id` |
| Rutas protegidas | ✅ Completo | `ProtectedRoute` en React, `IsAuthenticated` en Django |

---

### Persistencia y Arquitectura

| Requerimiento | Estado | Detalle |
|---|---|---|
| Metadatos en base de datos relacional | ✅ Completo | PostgreSQL con JSONField para metadata por tipo |
| Almacenamiento físico abstracto | ✅ Completo | `StoragePort` interface → `LocalStorageAdapter` (intercambiable con S3) |
| Arquitectura Hexagonal | ✅ Completo | `domain/` `application/ports/` `application/use_cases/` `infrastructure/` `interfaces/` |

---

### UX / Interfaz

| Elemento | Estado |
|---|---|
| Dashboard con estadísticas reales | ✅ Archivos totales, almacenamiento, distribución por tipo |
| Vista grilla y lista de archivos | ✅ Toggle grid/list view |
| Preview de archivos (imagen, video, audio, PDF) | ✅ Modal con reproductor integrado |
| Drag & drop para subir archivos | ✅ DropZone con cola de subida y progreso |
| Selección múltiple y eliminación bulk | ✅ SelectionBar con contador |
| Mover archivos entre carpetas | ✅ MoveFileModal con árbol de carpetas |
| Ordenar por nombre, fecha, tamaño, tipo | ✅ SortBar ascendente/descendente |
| Barra de búsqueda global en Navbar | ✅ QuickSearch con resultados en tiempo real |
| UI oscura, moderna, responsive | ✅ Tailwind + paleta #003400 → #98ff96 |

---

## Cómo correr el proyecto

Doble clic en **`MediaVault.lnk`** en el Escritorio.

O manualmente:

```bash
# Terminal 1 — Backend
cd backend
venv\Scripts\activate
python manage.py migrate
python manage.py runserver

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Backend: http://localhost:8000
- Frontend: http://localhost:5173

---

## Estructura del Proyecto

```
Multimedia/
├── backend/
│   ├── apps/
│   │   ├── auth_module/          # Login, register, JWT
│   │   ├── media_module/         # Archivos, carpetas, búsqueda, stats
│   │   ├── tags_module/          # Etiquetas
│   │   └── core/                 # Health check, system info
│   └── config/                   # Settings Django
└── frontend/
    └── src/
        ├── pages/                # Dashboard, Files, Tags, Search
        ├── components/           # UI, files, folders, tags, upload, audio
        ├── hooks/                # useFiles, useFolders, useTags, useSearch
        └── services/             # API clients
```

---

## Librerías clave

| Librería | Para qué |
|---|---|
| `Pillow` | Thumbnails de imágenes |
| `PyMuPDF` | Preview + metadata de PDFs |
| `FFmpeg / ffprobe` | Thumbnails y metadata de video/audio |
| `djangorestframework-simplejwt` | Autenticación JWT |
| `react-router-dom` | Navegación SPA |
| `lucide-react` | Iconos |
| `axios` | HTTP client |
| `tailwindcss` | Estilos |
