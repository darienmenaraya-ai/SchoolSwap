

# 🎒 SchoolSwap
### Marketplace Escolar — CEDES Don Bosco

![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?style=for-the-badge&logo=supabase)
![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=for-the-badge&logo=tailwindcss)

**SchoolSwap** es un marketplace escolar desarrollado para el Colegio Técnico Profesional CEDES Don Bosco,
donde estudiantes y padres de familia pueden comprar, vender e intercambiar artículos escolares de forma
segura, rápida y sencilla.

[Ver Demo](#) · [Reportar Bug](#) · [Documentación](#documentación-técnica)

</div>

---

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#sobre-el-proyecto)
- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Variables de Entorno](#variables-de-entorno)
- [Base de Datos](#base-de-datos)
- [Seguridad](#seguridad)
- [Uso del Sistema](#uso-del-sistema)
- [Scripts](#scripts)
- [Despliegue](#despliegue)
- [Autor](#autor)

---

## 🧠 Sobre el Proyecto

SchoolSwap nació como solución a un problema real dentro del colegio: la falta de una plataforma centralizada donde los estudiantes puedan intercambiar, vender o comprar artículos académicos de forma segura entre sí.

Inspirado en el modelo de Facebook Marketplace pero adaptado al entorno escolar, SchoolSwap incluye funcionalidades únicas como el **sistema de trueques** — que permite intercambiar productos sin necesidad de dinero.

### Problema que resuelve
- Los estudiantes no tienen dónde vender libros, uniformes o útiles usados fácilmente.
- No existe comunicación directa entre vendedor y comprador dentro del colegio.
- No hay control de stock ni historial de pedidos para los vendedores.

### Solución
Una plataforma web completa con autenticación segura, mensajería directa, carrito de compras, sistema de pedidos y un sistema exclusivo de trueques entre usuarios.

---

## ✨ Características

| Módulo | Descripción |
|---|---|
| 🔐 **Autenticación** | Registro, login y confirmación por correo con Supabase Auth |
| 👥 **Roles** | Estudiante, Padre de familia y Administrador |
| 📦 **Productos** | Publicar, editar y eliminar productos con imágenes reales |
| 🛒 **Carrito** | Agregar productos, modificar cantidades y realizar pedidos |
| 📋 **Pedidos** | Historial de pedidos con estados en tiempo real |
| 💬 **Mensajería** | Chat directo entre usuarios al estilo WhatsApp |
| 🔄 **Trueques** | Proponer, aceptar o rechazar intercambios sin dinero |
| ⚙️ **Admin** | Panel de administración con estadísticas completas |
| 🔍 **Búsqueda** | Búsqueda en tiempo real y filtros por categoría |
| 📱 **Responsive** | Diseño adaptado para móvil y escritorio |
| 🔒 **Seguridad** | Validación, sanitización XSS, rate limiting y más |

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|---|---|---|
| **Next.js** | 16.x | Framework principal con App Router |
| **React** | 19.x | Librería de componentes UI |
| **Tailwind CSS** | 4.x | Estilos y diseño responsive |
| **Lucide React** | Latest | Íconos modernos y consistentes |
| **Poppins** | Google Fonts | Tipografía principal |

### Backend & Base de Datos
| Tecnología | Versión | Propósito |
|---|---|---|
| **Supabase** | Latest | Base de datos PostgreSQL + Auth + Storage |
| **Supabase Auth** | Latest | Autenticación segura con JWT |
| **Supabase Storage** | Latest | Almacenamiento de imágenes de productos |
| **Row Level Security** | - | Políticas de acceso por usuario y rol |

### Herramientas de Desarrollo
| Herramienta | Propósito |
|---|---|
| **VS Code** | Editor de código |
| **Git + GitHub** | Control de versiones |
| **Node.js v24** | Entorno de ejecución |
| **npm** | Gestor de paquetes |

---

## 📁 Estructura del Proyecto
marketplace-esolar/
│
├── 📁 public/
│   └── logo.png                        # Logo oficial de SchoolSwap
│
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 admin/
│   │   │   └── page.js                 # Panel de administrador
│   │   ├── 📁 auth/
│   │   │   ├── 📁 login/
│   │   │   │   └── page.js             # Inicio de sesión
│   │   │   └── 📁 registro/
│   │   │       └── page.js             # Registro de usuario
│   │   ├── 📁 carrito/
│   │   │   └── page.js                 # Carrito de compras
│   │   ├── 📁 mensajes/
│   │   │   └── page.js                 # Sistema de mensajería
│   │   ├── 📁 pedidos/
│   │   │   └── page.js                 # Historial de pedidos
│   │   ├── 📁 perfil/
│   │   │   └── page.js                 # Perfil de usuario
│   │   ├── 📁 productos/
│   │   │   ├── 📁 [id]/
│   │   │   │   └── page.js             # Detalle de producto
│   │   │   └── 📁 nuevo/
│   │   │       └── page.js             # Publicar producto
│   │   ├── 📁 trueque/
│   │   │   ├── 📁 proponer/
│   │   │   │   └── page.js             # Proponer trueque
│   │   │   └── page.js                 # Mis trueques
│   │   ├── globals.css                 # Estilos globales + tipografía
│   │   ├── layout.js                   # Layout raíz de la aplicación
│   │   ├── loading.js                  # Pantalla de carga global
│   │   ├── not-found.js                # Página 404 personalizada
│   │   └── page.js                     # Página principal (Home)
│   │
│   ├── 📁 lib/
│   │   ├── security.js                 # Utilidades de seguridad
│   │   ├── supabase.js                 # Cliente Supabase (browser)
│   │   └── supabase-server.js          # Cliente Supabase (server)
│   │
│   └── 📁 components/
│       └── 📁 ui/                      # Componentes shadcn/ui
│
├── .env.local                          # Variables de entorno (privado)
├── .gitignore                          # Archivos ignorados por Git
├── next.config.mjs                     # Config Next.js + headers seguridad
├── package.json                        # Dependencias del proyecto
└── README.md                           # Este archivo

---

## 🚀 Instalación

### Requisitos previos
- Node.js v18 o superior
- Git instalado
- Cuenta en [Supabase](https://supabase.com)

### Pasos

**1. Clonar el repositorio**
```bash
git clone https://github.com/darienmenaraya-ai/marketplace-esolar.git
cd marketplace-esolar
```

**2. Instalar dependencias**
```bash
npm install
```

**3. Configurar variables de entorno**

Creá el archivo `.env.local` en la raíz:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

**4. Iniciar servidor de desarrollo**
```bash
npm run dev
```

**5. Abrir en el navegador**
http://localhost:3000

---

## 🔑 Variables de Entorno

| Variable | Descripción | Dónde encontrarla |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anon | Settings → API → anon public |

> ⚠️ **Nunca subas `.env.local` a GitHub.** Ya está incluido en `.gitignore`.

---

## 🗄️ Base de Datos

El sistema utiliza **PostgreSQL** a través de Supabase con las siguientes tablas:
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    usuario      │────▶│    producto      │────▶│   categoria     │
│─────────────────│     │──────────────────│     │─────────────────│
│ id_usuario (PK) │     │ id_producto (PK) │     │ id_categoria PK │
│ nombre          │     │ nombre           │     │ nombre          │
│ apellido        │     │ descripcion      │     │ descripcion     │
│ correo          │     │ precio           │     └─────────────────┘
│ rol             │     │ stock            │
│ activo          │     │ estado           │
└─────────────────┘     │ imagen           │
│              │ id_usuario (FK)  │
│              │ id_categoria (FK)│
│              └──────────────────┘
│
├──▶ pedido ──▶ detalle_pedido
├──▶ carrito ──▶ carrito_item
├──▶ mensaje
└──▶ trueque

### Tablas principales

| Tabla | Registros | Descripción |
|---|---|---|
| `usuario` | Usuarios del sistema | Almacena perfil, rol y estado |
| `producto` | Artículos publicados | Con precio, stock e imagen |
| `categoria` | Categorías de productos | Útiles, Libros, Uniformes, etc. |
| `pedido` | Órdenes de compra | Con estado y precio total |
| `detalle_pedido` | Items de cada pedido | Cantidad y precio unitario |
| `carrito` | Carrito por usuario | Uno por usuario |
| `carrito_item` | Productos en carrito | Con cantidad |
| `mensaje` | Mensajes entre usuarios | Leído/no leído |
| `trueque` | Propuestas de intercambio | Con estado pendiente/aceptado/rechazado |

### Row Level Security (RLS)
Todas las tablas tienen RLS activado. Los usuarios solo pueden ver y modificar sus propios datos. Los administradores tienen acceso total.

---

## 🔒 Seguridad

| Medida | Implementación |
|---|---|
| **Sanitización XSS** | Función `sanitizeText()` en todos los inputs de texto |
| **Validación fuerte** | Email, contraseña, nombre y precio validados en frontend |
| **Rate Limiting** | Login: 5 intentos/15 min · Registro: 3 intentos/hora |
| **Errores seguros** | Mensajes genéricos que no filtran info del servidor |
| **Headers HTTP** | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` |
| **Contraseñas fuertes** | Mínimo 8 caracteres, 1 mayúscula, 1 número |
| **Archivos seguros** | Solo JPG/PNG/WEBP, máximo 5MB |
| **Variables de entorno** | Credenciales en `.env.local` nunca en código |
| **RLS Supabase** | Políticas por rol en todas las tablas |
| **Auth JWT** | Tokens manejados por Supabase Auth |

---

## 📖 Uso del Sistema

### Para Estudiantes / Padres

Registrarse en /auth/registro
Confirmar el correo electrónico recibido
Iniciar sesión en /auth/login
Explorar productos en la página principal
Publicar productos con + Publicar
Agregar al carrito → Confirmar Pedido
Chatear con vendedores en Mensajes
Proponer trueques desde el detalle de un producto


### Para Administradores

Asignar rol 'administrador' desde Supabase
Acceder al panel en /admin
Ver estadísticas generales
Gestionar usuarios (activar/desactivar)
Gestionar productos (eliminar inapropiados)
Gestionar pedidos (cambiar estados)


---

## ⚡ Scripts

```bash
npm run dev      # Servidor de desarrollo en localhost:3000
npm run build    # Build optimizado para producción
npm run start    # Iniciar servidor de producción
npm run lint     # Verificar errores de código con ESLint
```

---

## 🌐 Despliegue

El proyecto está listo para desplegarse en **Vercel** (recomendado para Next.js):

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Desplegar
vercel

# 3. Configurar variables de entorno en vercel.com
# NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
```

O manualmente desde [vercel.com](https://vercel.com):
1. Importar repositorio de GitHub
2. Configurar variables de entorno
3. Deploy automático

---

## 👤 Autor

<div align="center">

**Darien Mena Araya**

Estudiante de Duodécimo año
Especialidad: Desarrollo Web
Colegio Técnico Profesional Cedes Don Bosco

[![GitHub](https://img.shields.io/badge/GitHub-darienmenaraya--ai-181717?style=for-the-badge&logo=github)](https://github.com/darienmenaraya-ai)

</div>

---

<div align="center">

© 2026 SchoolSwap · Cedes Don Bosco · Todos los derechos reservados

*Desarrollado con ❤️ para la comunidad estudiantil del CTP CEDES Don Bosco*

</div>