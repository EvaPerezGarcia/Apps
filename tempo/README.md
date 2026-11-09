 <div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=rect&color=0B1220&height=8" />

<br/>

# TEMPO

**Planificación personal · Gestión de tareas · Productividad**

Organiza tus tareas, gestiona tu tiempo y mejora tu productividad desde un único espacio.

<br/>

<a href="https://tempo-xi-ten.vercel.app/">
<img src="https://img.shields.io/badge/ACCEDER_A_TEMPO-123B63?style=for-the-badge&logo=vercel&logoColor=white" />
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

## 01. DESCRIPCIÓN DEL PROYECTO

Tempo es una aplicación web de productividad personal que centraliza la planificación de tareas, la organización del tiempo y el seguimiento de la actividad diaria.

Permite gestionar actividades mediante un calendario interactivo, organizar tareas por prioridades y categorías, registrar sesiones de concentración y consultar estadísticas de productividad.

La aplicación integra autenticación de usuarios y almacenamiento en la nube mediante Supabase. Además, incorpora un sistema de cifrado en el navegador para proteger la información personal antes de enviarla al servidor.

## 02. FUNCIONALIDADES

### Gestión de tareas
- Creación, edición, duplicación y eliminación de tareas.
- Configuración de fechas, horarios, prioridades y estados.
- Etiquetas personalizables con diferentes colores.
- Creación de subtareas y seguimiento del progreso.
- Repetición semanal y mensual de actividades.
- Historial de cambios y sesiones de concentración.
- Búsqueda, filtros y ordenación de tareas.

### Calendario interactivo
- Vistas mensual, semanal y diaria.
- Representación visual de las tareas mediante bloques de colores.
- Visualización de horarios y duración de las actividades.
- Reorganización de tareas mediante arrastrar y soltar.

### Organización y planificación
- Panel de inicio con resumen de las tareas del día.
- Identificación de tareas atrasadas y próximas.
- Vista de lista y tablero Kanban.
- Filtros por estado y categoría.
- Notas generales independientes de las tareas.
- Acciones rápidas para actualizar y reorganizar actividades.

### Modo enfoque
- Temporizadores de 15, 25, 45 y 60 minutos.
- Configuración de duraciones personalizadas.
- Registro de sesiones vinculadas a tareas.
- Integración de las sesiones en las estadísticas de productividad.

### Estadísticas de productividad
- Número de tareas completadas durante la semana y en total.
- Seguimiento de rachas de días activos.
- Registro del tiempo dedicado a la concentración.
- Gráfico de tareas completadas durante las últimas ocho semanas.
- Resumen de actividad por etiquetas.

### Gestión de cuenta
- Registro e inicio de sesión mediante correo electrónico y contraseña.
- Recuperación de contraseña mediante correo electrónico.
- Almacenamiento de información asociado a cada usuario.
- Protección de los registros mediante políticas de seguridad en Supabase.

## 03. TECNOLOGÍAS UTILIZADAS

| Tecnología | Aplicación |
|---|---|
| HTML5 | Estructura de la aplicación |
| CSS3 | Diseño y estilos de la interfaz |
| JavaScript | Lógica e interactividad |
| Supabase | Autenticación y almacenamiento |
| PostgreSQL | Base de datos |
| Web Crypto API | Cifrado de información |
| GitHub | Control de versiones |
| Vercel | Despliegue y alojamiento |

La aplicación está desarrollada con HTML, CSS y JavaScript, sin utilizar frameworks externos. La comunicación con Supabase se realiza mediante un cliente REST propio, sin depender de `supabase-js`.

## 04. SEGURIDAD Y CIFRADO DE DATOS

Tempo incorpora un sistema de cifrado del lado del cliente (*client-side encryption*). Los datos personales se cifran directamente en el navegador antes de enviarse a Supabase.

**Mecanismos de cifrado**

| Parámetro | Configuración |
|---|---|
| Derivación de clave | PBKDF2 con SHA-256 |
| Iteraciones | 600.000 |
| Algoritmo de cifrado | AES-GCM de 256 bits |
| Vector de inicialización (IV) | Aleatorio por operación |
| Salt | Aleatorio por cuenta |

**Funcionamiento**
- La clave de cifrado se deriva a partir de la contraseña del usuario.
- Los registros se cifran en el navegador antes de transmitirse.
- Supabase almacena el contenido cifrado, junto con los parámetros necesarios para su posterior descifrado.
- La clave derivada permanece únicamente en la memoria de la pestaña mientras la sesión está desbloqueada.
- Al cerrar sesión, la clave se elimina de la memoria.

**Consideración importante:** actualmente no existe una clave de recuperación. Si se pierde o cambia la contraseña original, los datos cifrados con ella pueden quedar inaccesibles. La recuperación de acceso mediante correo electrónico no permite, por sí sola, recuperar el contenido cifrado.

## 05. ARQUITECTURA Y ALMACENAMIENTO

La aplicación utiliza Supabase como backend para gestionar la autenticación y almacenar los registros de cada usuario.

Los datos de la aplicación se almacenan cifrados en las siguientes tablas:

| Tabla | Función |
|---|---|
| `encrypted_records` | Almacenamiento de los registros cifrados |
| `crypto_meta` | Parámetros criptográficos, salt y versión del esquema |

El acceso a los registros está restringido mediante políticas de seguridad **Row Level Security (RLS)**, asociadas a la identidad de cada usuario.

## 06. INSTALACIÓN Y EJECUCIÓN LOCAL

Tempo funciona como una aplicación web estática y no necesita instalar dependencias ni ejecutar un proceso de compilación.

**Para ejecutarla en local:**

1. Clonar o descargar este repositorio.
2. Abrir la carpeta del proyecto en Visual Studio Code.
3. Iniciar un servidor local mediante Live Server.
4. Abrir la dirección local proporcionada por el servidor.

Para que funcionen el registro, el inicio de sesión y los procesos de autenticación, la dirección local debe estar autorizada en la configuración de URL de Supabase.

La apertura directa del archivo HTML mediante `file://` no equivale a ejecutarlo desde un servidor local.

## 07. DESPLIEGUE

La aplicación está publicada en **Vercel** como sitio web estático.

<sub>APLICACIÓN EN PRODUCCIÓN</sub>

[https://tempo-xi-ten.vercel.app/](https://tempo-xi-ten.vercel.app/)

El archivo principal es `index.html`. El repositorio está conectado con Vercel, por lo que las actualizaciones publicadas en GitHub pueden generar nuevos despliegues automáticamente.

**Estructura del proyecto**

```text
tempo/
│
├── index.html
└── README.md
```

## 08. LIMITACIONES Y MEJORAS FUTURAS

Las siguientes funcionalidades están identificadas como posibles mejoras:

- Implementación de una clave de recuperación para evitar la pérdida permanente de datos.
- Desarrollo de una pantalla para establecer una nueva contraseña.
- Incorporación de copias de seguridad descargables.
- Implementación de un modo oscuro.
- Mejoras de accesibilidad y navegación mediante teclado.
- Separación de la lógica, los estilos y el acceso a datos en módulos independientes.

---

<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=rect&color=123B63&height=5" />

<sub>TEMPO · Aplicación de productividad personal · 2026</sub>

</div>
