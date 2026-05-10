# 📚 Documentación Técnica — SchoolSwap

**Proyecto:** SchoolSwap - Marketplace Escolar  
**Institución:** CTP CEDES Don Bosco  
**Estudiante:** Darien Mena Araya  
**Especialidad:** Desarrollo Web — Duodécimo Año  
**Año:** 2026

---

## 1. ¿Qué es SchoolSwap?

SchoolSwap es una aplicación web tipo marketplace diseñada específicamente para el entorno escolar del Colegio Técnico Profesional Cedes Don Bosco. Permite a estudiantes y padres de familia comprar, vender e intercambiar artículos escolares (libros, uniformes, útiles, tecnología, entre otros) de forma segura y organizada.

El sistema está inspirado en el modelo de Facebook Marketplace, pero con funcionalidades exclusivas para un colegio, como el sistema de trueques sin dinero y roles diferenciados por tipo de usuario.

---

## 2. Tecnologías Utilizadas

### 2.1 Next.js (Framework Principal)
**¿Qué es?** Next.js es un framework de desarrollo web basado en React que permite crear aplicaciones completas con manejo de rutas, páginas y optimización de rendimiento.

**¿Por qué lo usé?**
- Permite crear páginas web de forma organizada con el sistema de carpetas App Router.
- Cada carpeta dentro de `src/app/` se convierte automáticamente en una ruta de la aplicación.
- Maneja tanto el frontend (lo que ve el usuario) como configuraciones del servidor.
- Es el framework más utilizado profesionalmente con React.

**¿Cómo lo usé en el proyecto?**
- Cada página del proyecto es un archivo `page.js` dentro de su carpeta correspondiente.
- Por ejemplo: `src/app/carrito/page.js` es accesible en `http://localhost:3000/carrito`.
- La carpeta `[id]` en productos usa rutas dinámicas para mostrar cualquier producto por su ID.

---

### 2.2 React (Librería de Componentes)
**¿Qué es?** React es la librería JavaScript más popular para construir interfaces de usuario. Next.js está construido sobre React.

**¿Por qué lo usé?**
- Permite dividir la interfaz en componentes reutilizables.
- Maneja el estado de la aplicación en tiempo real (por ejemplo, actualizar el carrito sin recargar la página).

**¿Cómo lo usé en el proyecto?**
- Cada página usa hooks de React como `useState` y `useEffect`.
- `useState`: guarda información que puede cambiar (ejemplo: lista de productos, usuario actual).
- `useEffect`: ejecuta código al cargar la página (ejemplo: consultar los productos de Supabase).

---

### 2.3 Supabase (Backend como Servicio)
**¿Qué es?** Supabase es una plataforma que provee base de datos PostgreSQL, autenticación de usuarios y almacenamiento de archivos, todo accesible desde el frontend sin necesidad de crear un servidor propio.

**¿Por qué lo usé?**
- Permite tener una base de datos real sin configurar servidores.
- Incluye sistema de autenticación listo para usar.
- Permite subir imágenes y archivos de forma segura.
- Tiene Row Level Security (RLS) para controlar quién accede a qué datos.

**¿Cómo lo usé en el proyecto?**

| Servicio Supabase | Uso en SchoolSwap |
|---|---|
| **Database (PostgreSQL)** | Almacena usuarios, productos, pedidos, mensajes, trueques |
| **Auth** | Registro, login, confirmación de correo y manejo de sesiones |
| **Storage** | Almacenamiento de imágenes de los productos |
| **Row Level Security** | Los usuarios solo ven sus propios pedidos, mensajes, etc. |

---

### 2.4 Tailwind CSS (Estilos)
**¿Qué es?** Tailwind CSS es un framework de estilos que permite diseñar directamente en el HTML usando clases predefinidas.

**¿Por qué lo usé?**
- No necesitás escribir CSS separado, todo se hace con clases en el componente.
- Agiliza enormemente el desarrollo del diseño.
- Hace el diseño responsive (adaptable a móvil y escritorio) de forma muy sencilla.

**¿Cómo lo usé en el proyecto?**
- Para todos los estilos de layout: `flex`, `grid`, `max-w-7xl`, `px-6`, etc.
- Para espaciados, bordes redondeados y sombras en las tarjetas de productos.
- Para el diseño responsive con prefijos como `sm:`, `md:`, `lg:`.

---

### 2.5 Lucide React (Íconos)
**¿Qué es?** Librería de íconos SVG modernos y consistentes para React.

**¿Cómo lo usé?**
- Reemplazé todos los emojis por íconos profesionales.
- Ejemplos: `ShoppingCart`, `MessageCircle`, `Package`, `RefreshCw`, `User`, `LogOut`.

---

### 2.6 Poppins — Google Fonts (Tipografía)
**¿Qué es?** Poppins es una tipografía moderna y geométrica de Google Fonts.

**¿Por qué la elegí?**
- Es muy similar a la tipografía del logo SchoolSwap.
- Se ve profesional y es altamente legible en pantallas digitales.

---

### 2.7 Git + GitHub (Control de Versiones)
**¿Qué es?** Git es un sistema de control de versiones. GitHub es la plataforma en línea para almacenar y colaborar en proyectos con Git.

**¿Cómo lo usé?**
- Guardé el proyecto completo en un repositorio de GitHub.
- Usé commits para registrar cada avance significativo del proyecto.
- Permite acceder al proyecto desde cualquier computadora con `git clone`.

---

## 3. Arquitectura del Sistema
┌─────────────────────────────────────────────────────────┐
│                    USUARIO (Navegador)                   │
│              http://localhost:3000                       │
└─────────────────────┬───────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│                   NEXT.JS (Frontend)                    │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Home    │ │Productos │ │ Carrito  │ │Mensajes  │  │
│  │ page.js  │ │ page.js  │ │ page.js  │ │ page.js  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Pedidos  │ │ Perfil   │ │Trueques  │ │  Admin   │  │
│  │ page.js  │ │ page.js  │ │ page.js  │ │ page.js  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  src/lib/supabase.js  ←  Conexión con Supabase          │
│  src/lib/security.js  ←  Funciones de seguridad         │
└─────────────────────┬───────────────────────────────────┘
│ Supabase SDK
▼
┌─────────────────────────────────────────────────────────┐
│                  SUPABASE (Backend)                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │  │
│  │  Base datos  │  │  Usuarios    │  │   Imágenes   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘

---

## 4. Explicación de Cada Módulo

### 4.1 Página Principal (Home)
**Ruta:** `/`  
**Archivo:** `src/app/page.js`

**¿Qué hace?**
- Muestra todos los productos publicados en una grilla de 4 columnas.
- Permite buscar productos en tiempo real escribiendo en el buscador.
- Permite filtrar por categoría usando el selector desplegable.
- La barra de estadísticas muestra cuántos productos hay disponibles.
- Si el usuario está logueado, muestra el menú completo con todas las opciones.
- Si no está logueado, muestra los botones de "Iniciar sesión" y "Registrarse".

**Flujo:**
1. Al cargar, consulta Supabase para obtener todos los productos publicados.
2. También consulta las categorías para el filtro.
3. Verifica si hay un usuario con sesión activa.
4. Renderiza los productos en tarjetas con imagen, nombre, categoría y precio.

---

### 4.2 Registro (`/auth/registro`)
**Archivo:** `src/app/auth/registro/page.js`

**¿Qué hace?**
- Permite crear una cuenta nueva con nombre, apellido, correo, contraseña y rol.
- Valida todos los campos antes de enviar (formato de email, longitud de contraseña, etc.).
- Tiene rate limiting: máximo 3 intentos por hora por correo.
- Sanitiza los inputs para prevenir ataques XSS.
- Crea el usuario en Supabase Auth (para la autenticación).
- Crea el registro en la tabla `usuario` de la base de datos (para el perfil).
- Envía un correo de confirmación al usuario.

---

### 4.3 Inicio de Sesión (`/auth/login`)
**Archivo:** `src/app/auth/login/page.js`

**¿Qué hace?**
- Permite iniciar sesión con correo y contraseña.
- Rate limiting: máximo 5 intentos por cada 15 minutos.
- Muestra/oculta contraseña con el botón del ojo.
- Mensajes de error genéricos para no filtrar información sensible.
- Al ingresar correctamente, redirige a la página principal.

---

### 4.4 Publicar Producto (`/productos/nuevo`)
**Archivo:** `src/app/productos/nuevo/page.js`

**¿Qué hace?**
- Permite publicar un producto con nombre, descripción, precio, stock, categoría e imagen.
- Valida todos los campos (mínimo 3 caracteres en nombre, 10 en descripción, precio válido).
- Solo permite imágenes JPG, PNG o WEBP de máximo 5MB.
- Sube la imagen a Supabase Storage y guarda la URL pública en la base de datos.
- Solo accesible si el usuario está logueado (redirige al login si no lo está).

---

### 4.5 Detalle de Producto (`/productos/[id]`)
**Archivo:** `src/app/productos/[id]/page.js`

**¿Qué hace?**
- Muestra toda la información de un producto específico.
- Indica si el producto está en stock o agotado.
- Si el producto es del usuario actual, muestra "Este es tu producto".
- Si es de otro usuario, muestra tres botones:
  1. **Agregar al carrito** — agrega el producto al carrito del usuario.
  2. **Contactar vendedor** — abre el chat con el vendedor.
  3. **Proponer Trueque** — inicia el flujo de trueque.

---

### 4.6 Carrito de Compras (`/carrito`)
**Archivo:** `src/app/carrito/page.js`

**¿Qué hace?**
- Muestra todos los productos que el usuario agregó al carrito.
- Permite aumentar o disminuir la cantidad de cada producto.
- Permite eliminar productos del carrito.
- Calcula el total en tiempo real.
- Al confirmar el pedido, crea un registro en la tabla `pedido` y `detalle_pedido`, y vacía el carrito.

---

### 4.7 Mis Pedidos (`/pedidos`)
**Archivo:** `src/app/pedidos/page.js`

**¿Qué hace?**
- Muestra el historial completo de pedidos del usuario.
- Cada pedido muestra su número, fecha, estado y total.
- Los estados posibles son: Pendiente, Procesando, Completado, Cancelado.
- Muestra el detalle de cada pedido con los productos, cantidades y precios.

---

### 4.8 Mensajería (`/mensajes`)
**Archivo:** `src/app/mensajes/page.js`

**¿Qué hace?**
- Sistema de chat en tiempo real entre usuarios.
- Panel izquierdo: lista de todas las conversaciones del usuario.
- Panel derecho: chat de la conversación seleccionada.
- Al entrar desde el botón "Contactar vendedor", abre automáticamente el chat con ese vendedor.
- Los mensajes propios aparecen a la derecha (azul), los recibidos a la izquierda (blanco).
- Sanitiza el contenido del mensaje antes de guardarlo.

---

### 4.9 Trueques (`/trueque`)
**Archivo:** `src/app/trueque/page.js`

**¿Qué hace?**
- Muestra las propuestas de trueque recibidas y enviadas por el usuario.
- Para propuestas recibidas: permite Aceptar o Rechazar.
- Para propuestas enviadas: muestra el estado actual (Pendiente/Aceptado/Rechazado).
- Muestra visualmente qué producto se ofrece y cuál se solicita.

**`/trueque/proponer`**
- Se accede desde el botón "Proponer Trueque" en el detalle de un producto.
- Muestra el producto que querés obtener y te permite seleccionar cuál de tus productos ofrecés a cambio.
- Al enviar, crea un registro en la tabla `trueque` con estado "pendiente".

---

### 4.10 Mi Perfil (`/perfil`)
**Archivo:** `src/app/perfil/page.js`

**¿Qué hace?**
- Muestra y permite editar el nombre y apellido del usuario.
- El correo y el rol no son editables por seguridad.
- Muestra todos los productos publicados por el usuario con opción de eliminarlos.
- Valida los campos antes de guardar.

---

### 4.11 Panel de Administrador (`/admin`)
**Archivo:** `src/app/admin/page.js`

**¿Qué hace?**
- Solo accesible para usuarios con rol `administrador`.
- Si un usuario sin ese rol intenta acceder, es redirigido al inicio.
- Tiene 4 secciones:
  1. **Estadísticas**: total de usuarios, productos, pedidos y monto en ventas.
  2. **Usuarios**: lista completa con opción de activar/desactivar cuentas.
  3. **Productos**: lista completa con opción de eliminar cualquier producto.
  4. **Pedidos**: lista completa con opción de cambiar el estado de cada pedido.

---

## 5. Base de Datos — Detalle de Tablas

### Tabla `usuario`
| Campo | Tipo | Descripción |
|---|---|---|
| id_usuario | UUID (PK) | Identificador único (mismo que Supabase Auth) |
| nombre | VARCHAR(100) | Nombre del usuario |
| apellido | VARCHAR(100) | Apellido del usuario |
| correo | VARCHAR(100) | Correo electrónico único |
| rol | VARCHAR(20) | estudiante / padre / administrador |
| activo | BOOLEAN | Si la cuenta está activa o desactivada |
| created_at | TIMESTAMP | Fecha de registro |

### Tabla `producto`
| Campo | Tipo | Descripción |
|---|---|---|
| id_producto | UUID (PK) | Identificador único |
| nombre | VARCHAR(100) | Nombre del producto |
| descripcion | TEXT | Descripción del producto |
| precio | DECIMAL(10,2) | Precio en colones |
| stock | INT | Unidades disponibles |
| estado | VARCHAR(20) | publicado / agotado / inactivo |
| imagen | VARCHAR(255) | URL de la imagen en Supabase Storage |
| id_usuario | UUID (FK) | Usuario que publicó el producto |
| id_categoria | UUID (FK) | Categoría del producto |

### Tabla `pedido`
| Campo | Tipo | Descripción |
|---|---|---|
| id_pedido | UUID (PK) | Identificador único |
| precio_total | DECIMAL(10,2) | Total del pedido |
| estado | VARCHAR(20) | pendiente / procesando / completado / cancelado |
| id_usuario | UUID (FK) | Usuario que realizó el pedido |
| created_at | TIMESTAMP | Fecha del pedido |

### Tabla `mensaje`
| Campo | Tipo | Descripción |
|---|---|---|
| id_mensaje | UUID (PK) | Identificador único |
| contenido | VARCHAR(1000) | Texto del mensaje |
| leido | BOOLEAN | Si el receptor lo leyó |
| id_remitente | UUID (FK) | Usuario que envió |
| id_receptor | UUID (FK) | Usuario que recibe |
| id_producto | UUID (FK) | Producto relacionado (opcional) |

### Tabla `trueque`
| Campo | Tipo | Descripción |
|---|---|---|
| id_trueque | UUID (PK) | Identificador único |
| estado | VARCHAR(20) | pendiente / aceptado / rechazado |
| id_producto_ofrecido | UUID (FK) | Producto que ofrece quien propone |
| id_producto_solicitado | UUID (FK) | Producto que desea obtener |
| id_usuario_oferta | UUID (FK) | Usuario que propone el trueque |
| id_usuario_receptor | UUID (FK) | Usuario dueño del producto solicitado |

---

## 6. Seguridad Implementada

### 6.1 Validación de Formularios
Todos los formularios del sistema validan los datos antes de enviarlos a Supabase:
- **Email**: formato válido con expresión regular.
- **Contraseña**: mínimo 8 caracteres, al menos 1 mayúscula y 1 número.
- **Nombre/Apellido**: solo letras y espacios, entre 2 y 50 caracteres.
- **Precio**: número entre 0 y 10,000,000.
- **Stock**: número entero entre 0 y 99,999.

### 6.2 Sanitización contra XSS
Todos los textos ingresados por el usuario pasan por la función `sanitizeText()` que reemplaza caracteres especiales peligrosos (`<`, `>`, `"`, `'`, `&`) con sus equivalentes HTML seguros antes de guardarse en la base de datos.

### 6.3 Rate Limiting
- **Login**: máximo 5 intentos fallidos por cada 15 minutos por correo.
- **Registro**: máximo 3 intentos por hora por correo.
Implementado en memoria del navegador con la función `checkRateLimit()`.

### 6.4 Mensajes de Error Seguros
Los errores de Supabase Auth se traducen a mensajes genéricos que no revelan información del sistema (por ejemplo, nunca se dice "ese correo no existe", sino "correo o contraseña incorrectos").

### 6.5 Headers de Seguridad HTTP
Configurados en `next.config.mjs`:
- `X-Frame-Options: DENY` — previene que la página se cargue en un iframe (clickjacking).
- `X-Content-Type-Options: nosniff` — previene que el navegador adivine el tipo de archivo.
- `Referrer-Policy` — controla qué información se envía en la cabecera Referrer.

### 6.6 Row Level Security (RLS)
Cada tabla en Supabase tiene políticas de seguridad que garantizan:
- Un usuario solo puede ver sus propios pedidos, carrito y mensajes.
- Solo el dueño de un producto puede editarlo o eliminarlo.
- El administrador puede ver todos los registros.

### 6.7 Validación de Archivos
Al subir imágenes, el sistema verifica:
- Que el tipo de archivo sea JPG, PNG, WEBP o GIF.
- Que el tamaño no supere los 5MB.

---

## 7. Flujo Principal del Sistema
Usuario entra a SchoolSwap
│
├── No tiene cuenta → Registro → Confirmar correo → Login
│
└── Tiene cuenta → Login
│
├── VER PRODUCTOS → Buscar/Filtrar → Ver detalle
│   │
│   ├── Agregar al carrito → Confirmar pedido → Ver en Mis Pedidos
│   ├── Contactar vendedor → Chat en Mensajes
│   └── Proponer Trueque → Seleccionar mi producto → Enviar propuesta
│
├── PUBLICAR PRODUCTO → Llenar formulario → Subir imagen → Publicar
│
├── MENSAJES → Ver conversaciones → Chatear
│
├── TRUEQUES → Ver propuestas recibidas → Aceptar o Rechazar
│
├── MI PERFIL → Editar datos → Ver mis productos
│
└── ADMIN (solo administradores)
├── Ver estadísticas
├── Gestionar usuarios
├── Gestionar productos
└── Gestionar pedidos

---

## 8. Uso de Inteligencia Artificial en el Desarrollo

### Herramienta utilizada
**Claude (Anthropic)** — accedido a través de Claude.ai

### ¿En qué partes del proyecto usé IA?
| Área | Uso específico |
|---|---|
| **Configuración inicial** | Guía para crear el proyecto Next.js y conectar Supabase |
| **Estructura de código** | Orientación sobre cómo organizar los archivos y carpetas |
| **Consultas Supabase** | Ayuda para escribir queries con joins y filtros complejos |
| **Sistema de seguridad** | Orientación sobre validaciones, sanitización XSS y rate limiting |
| **Diseño UI** | Guía sobre colores, espaciados y estructura visual |
| **Corrección de errores** | Diagnóstico y solución de errores específicos durante el desarrollo |
| **Base de datos** | Revisión de las políticas RLS de Supabase |
| **Documentación** | Ayuda para estructurar el README y esta documentación |

### ¿Qué tipo de ayuda recibí?
La IA actuó principalmente como **tutor técnico**, explicándome cada concepto antes de escribir el código. Por ejemplo:
- Antes de escribir el código del carrito, me explicó qué es `useState` y cómo funciona el ciclo de vida con `useEffect`.
- Cuando hubo errores de RLS en Supabase, me explicó qué era el error y por qué ocurría antes de darme la solución.
- Para el sistema de mensajes, me explicó el concepto de rutas dinámicas y `useSearchParams` antes de implementarlo.

### ¿Qué tanto comprendo el código generado?
Comprendo el funcionamiento general de cada módulo del proyecto:
- **Sé qué hace cada archivo** y por qué está en su ubicación.
- **Entiendo el flujo de datos**: cómo se consulta Supabase, cómo se guarda en el estado con `useState` y cómo se renderiza en pantalla.
- **Comprendo las decisiones de arquitectura**: por qué se usa App Router, por qué cada página es un componente cliente (`'use client'`), y por qué las variables de entorno van en `.env.local`.
- **Reconozco mis limitaciones**: hay partes del código de seguridad avanzada y de las políticas RLS que entiendo conceptualmente pero que no podría escribir desde cero sin referencias.

---

## 9. Funcionalidades Pendientes y Cronograma

### Estado Actual del Proyecto
El sistema se encuentra en un **80% de avance**, con el flujo principal completamente funcional.

### Funcionalidades Completadas ✅
- Autenticación completa (registro, login, confirmación de correo)
- CRUD de productos con imágenes
- Carrito de compras y pedidos
- Sistema de mensajería
- Sistema de trueques
- Panel de administrador
- Búsqueda y filtros
- Seguridad básica implementada
- Diseño responsive

### Funcionalidades Pendientes

| Funcionalidad | Prioridad | Estimado |
|---|---|---|
| Notificaciones en tiempo real (nuevos mensajes/trueques) | Alta | 1 semana |
| Búsqueda avanzada con múltiples filtros (precio, estado) | Media | 3 días |
| Sistema de calificaciones de vendedores | Media | 1 semana |
| Despliegue en producción (Vercel) | Alta | 2 días |
| Pruebas de usuario con compañeros del colegio | Alta | 1 semana |
| Optimización de rendimiento (imágenes, lazy loading) | Baja | 3 días |

### Cronograma de Finalización

| Semana | Actividad |
|---|---|
| Semana 1 | Despliegue en Vercel + configuración de dominio |
| Semana 2 | Notificaciones en tiempo real con Supabase Realtime |
| Semana 3 | Sistema de calificaciones y reseñas de vendedores |
| Semana 4 | Pruebas con usuarios reales + corrección de bugs |
| Semana 5 | Optimización final y entrega del proyecto completo |

---

## 10. Cómo Ejecutar el Proyecto para la Presentación

```bash
# 1. Ir a la carpeta del proyecto
cd Desktop/marketplace-esolar

# 2. Instalar dependencias (si es computadora nueva)
npm install

# 3. Crear el archivo .env.local con las credenciales de Supabase
# NEXT_PUBLIC_SUPABASE_URL=https://tkovyfyudqbfkqjybcyp.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_aqui

# 4. Iniciar el servidor
npm run dev

# 5. Abrir en el navegador
# http://localhost:3000
```

### Checklist antes de la presentación
- [ ] Node.js instalado (`node -v`)
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env.local` creado con las claves
- [ ] Servidor corriendo (`npm run dev`)
- [ ] Proyecto abre en `http://localhost:3000`
- [ ] Login funciona con usuario de prueba
- [ ] Al menos 2-3 productos publicados en la base de datos
- [ ] Repositorio de GitHub actualizado con los últimos cambios

---

*Documentación generada para la presentación del avance del Proyecto Final*  
*CTP CEDES Don Bosco — Especialidad Desarrollo Web — 2026*