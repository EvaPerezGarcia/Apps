<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=rect&color=0B1220&height=8" />

<br/>

# TEMPO

**PERSONAL PRODUCTIVITY APPLICATION**

Aplicación web para la planificación de tareas, la gestión del tiempo y el seguimiento de la productividad personal.

<br/>

<a href="https://tempo-xi-ten.vercel.app/">
<img src="https://img.shields.io/badge/ABRIR_APLICACIÓN-123B63?style=for-the-badge&logo=vercel&logoColor=white" />
</a>

<br/><br/>

<img src="https://img.shields.io/badge/HTML5-263B53?style=flat&logo=html5&logoColor=white" />
<img src="https://img.shields.io/badge/CSS3-263B53?style=flat&logo=css3&logoColor=white" />
<img src="https://img.shields.io/badge/JavaScript-263B53?style=flat&logo=javascript&logoColor=white" />
<img src="https://img.shields.io/badge/Supabase-263B53?style=flat&logo=supabase&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-263B53?style=flat&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Vercel-263B53?style=flat&logo=vercel&logoColor=white" />

</div>

---

## 01. DESCRIPCIÓN

Tempo es una aplicación web de productividad personal concebida para centralizar la planificación diaria y facilitar la organización del tiempo.

La aplicación integra herramientas de gestión de tareas, calendario, notas, concentración y análisis de productividad en un mismo entorno. Su objetivo es ofrecer una experiencia de organización completa, permitiendo al usuario planificar actividades, controlar su progreso y analizar sus hábitos de trabajo.

El proyecto combina desarrollo frontend, almacenamiento en la nube mediante Supabase y mecanismos de cifrado del lado del cliente para proteger la información personal.

## 02. FUNCIONALIDADES

| Módulo | Descripción |
|---|---|
| **Inicio** | Resumen de la actividad diaria, tareas atrasadas y próximas actividades. |
| **Tareas** | Creación, edición, prioridades, estados, etiquetas, subtareas y recurrencia. |
| **Calendario** | Planificación visual mediante vistas mensual, semanal y diaria. |
| **Notas** | Registro de información y elementos pendientes independientes de las tareas. |
| **Modo enfoque** | Temporizador de concentración con registro de sesiones. |
| **Productividad** | Estadísticas de actividad, tareas completadas, rachas y tiempo de concentración. |

### Organización de tareas

- Vistas de lista y tablero Kanban.
- Clasificación mediante etiquetas personalizables.
- Filtros, búsqueda y ordenación.
- Historial de actividad y seguimiento de subtareas.
- Repetición semanal y mensual.

### Gestión del tiempo

- Calendario interactivo con reorganización de actividades.
- Configuración de horarios y duración de las tareas.
- Temporizadores de 15, 25, 45 y 60 minutos.
- Registro de sesiones de concentración vinculadas a tareas.

## 03. TECNOLOGÍAS

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura de la interfaz. |
| CSS3 | Diseño y presentación visual. |
| JavaScript | Lógica de aplicación e interactividad. |
| Supabase | Autenticación y almacenamiento de información. |
| PostgreSQL | Persistencia de datos. |
| Web Crypto API | Cifrado y descifrado en el navegador. |
| GitHub | Control de versiones y gestión del código. |
| Vercel | Despliegue de la aplicación. |

La comunicación con Supabase se realiza mediante un cliente REST propio, sin utilizar el SDK `supabase-js`.

## 04. ARQUITECTURA DEL PROYECTO

El código se organiza en directorios independientes para separar los recursos visuales, los estilos, la lógica de aplicación y la documentación.

    tempo/
    │
    ├── assets/          # Recursos gráficos y archivos multimedia
    │
    ├── css/             # Hojas de estilo de la aplicación
    │
    ├── docs/            # Documentación del proyecto
    │
    ├── js/              # Lógica y funcionalidades JavaScript
    │
    ├── README.md        # Documentación principal
    │
    └── index.html       # Punto de entrada de la aplicación

Esta organización facilita el mantenimiento, la identificación de componentes y la evolución del proyecto.

## 05. SEGURIDAD Y PROTECCIÓN DE DATOS

Tempo incorpora un sistema de cifrado en el cliente (*client-side encryption*), de manera que los registros se cifran en el navegador antes de transmitirse a Supabase.

### Mecanismos implementados

| Parámetro | Configuración |
|---|---|
| Derivación de clave | PBKDF2-SHA256 |
| Iteraciones | 600.000 |
| Algoritmo de cifrado | AES-GCM |
| Longitud de clave | 256 bits |
| Vector de inicialización | Aleatorio por operación |
| Salt | Aleatorio por cuenta |

La clave derivada permanece en la memoria de la sesión del navegador y se elimina al cerrar sesión. Supabase almacena los registros cifrados y los metadatos criptográficos necesarios para su posterior descifrado.

### Almacenamiento cifrado

El almacenamiento utiliza las siguientes tablas:

- `encrypted_records`: registros cifrados de la aplicación.
- `crypto_meta`: parámetros criptográficos asociados a cada cuenta.

El acceso a los registros está restringido mediante políticas de seguridad **Row Level Security (RLS)**.

> **Consideración:** actualmente no existe un mecanismo de recuperación de la clave de cifrado. Recuperar el acceso a la cuenta mediante correo electrónico no permite recuperar automáticamente los datos cifrados si se pierde la contraseña original.

## 06. INSTALACIÓN Y EJECUCIÓN

Tempo funciona como una aplicación web estática y no requiere un proceso de compilación.

### Ejecución local

1. Clonar el repositorio.
2. Abrir el proyecto en Visual Studio Code.
3. Iniciar un servidor local, por ejemplo, mediante Live Server.
4. Acceder a la dirección local proporcionada por el servidor.

Para utilizar los servicios de autenticación desde local, el origen correspondiente debe estar autorizado en la configuración de URL de Supabase.

## 07. DESPLIEGUE

La aplicación está desplegada en Vercel y conectada al repositorio de GitHub para facilitar la publicación de nuevas versiones.

**ENTORNO DE PRODUCCIÓN**

[https://tempo-xi-ten.vercel.app/](https://tempo-xi-ten.vercel.app/)

El archivo `index.html` actúa como punto de entrada de la aplicación. Las actualizaciones del código en el repositorio pueden generar nuevos despliegues automáticamente.

## 08. EVOLUCIÓN DEL PROYECTO

Entre las mejoras identificadas para futuras versiones se encuentran:

- Implementación de una clave de recuperación.
- Finalización del flujo de cambio de contraseña.
- Copias de seguridad descargables.
- Incorporación de un modo oscuro.
- Mejoras de accesibilidad y navegación mediante teclado.
- Modularización progresiva de los componentes de la aplicación.

---

<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=rect&color=123B63&height=5" />

<br/>

**TEMPO**

<sub>Aplicación web de productividad personal · 2026</sub>

</div>
