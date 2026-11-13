<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=rect&color=0B1220&height=8" />

<br/><br/>

# TEMPO

**PERSONAL PRODUCTIVITY APPLICATION**

Planificación, organización y productividad personal.

<br/>

<a href="https://tempo-xi-ten.vercel.app/">
<img src="https://img.shields.io/badge/↗_ABRIR_TEMPO-123B63?style=for-the-badge&labelColor=0B1220" />
</a>

<br/><br/>

<img src="https://img.shields.io/badge/HTML5-263B53?style=flat-square&logo=html5&logoColor=white" />
<img src="https://img.shields.io/badge/CSS3-263B53?style=flat-square&logo=css3&logoColor=white" />
<img src="https://img.shields.io/badge/JavaScript-263B53?style=flat-square&logo=javascript&logoColor=white" />
<img src="https://img.shields.io/badge/Supabase-263B53?style=flat-square&logo=supabase&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-263B53?style=flat-square&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Vercel-263B53?style=flat-square&logo=vercel&logoColor=white" />

<br/><br/>

<img width="100%" src="https://capsule-render.vercel.app/api?type=rect&color=E5E7EB&height=1" />

</div>

## 01. DESCRIPCIÓN

Tempo es una aplicación web de productividad personal diseñada para centralizar la planificación diaria y facilitar la organización del tiempo.

Integra herramientas de gestión de tareas, calendario, notas, concentración y análisis de productividad en un mismo entorno. Permite organizar actividades, controlar su progreso y analizar los hábitos de trabajo desde una única interfaz.

El proyecto combina desarrollo frontend, almacenamiento en la nube mediante Supabase y mecanismos de cifrado del lado del cliente para proteger la información personal.

## 02. FUNCIONALIDADES

### 01 - Gestión de tareas

- Creación, edición, duplicación y eliminación de tareas.
- Configuración de fechas, horarios, prioridades y estados.
- Etiquetas personalizables con diferentes colores.
- Subtareas y seguimiento del progreso.
- Repetición semanal y mensual.
- Historial de actividad y sesiones de concentración.
- Búsqueda, filtros y ordenación.

### 02 - Calendario y planificación

- Vistas mensual, semanal y diaria.
- Representación visual de las tareas mediante bloques de colores.
- Visualización de horarios y duración de actividades.
- Reorganización mediante arrastrar y soltar.
- Resumen de tareas del día, atrasadas y próximas.
- Vistas de lista y tablero Kanban.

### 03 - Modo enfoque

- Temporizadores de 15, 25, 45 y 60 minutos.
- Configuración de duraciones personalizadas.
- Registro de sesiones vinculadas a tareas.

### 04 - Análisis de productividad

- Seguimiento de tareas completadas.
- Rachas de días activos.
- Registro del tiempo de concentración.
- Evolución semanal de tareas completadas.
- Resumen de actividad por etiquetas.

### 05 - Notas y gestión de cuenta

- Notas generales independientes de las tareas.
- Registro e inicio de sesión mediante correo electrónico y contraseña.
- Recuperación de contraseña mediante correo electrónico.

## 03. TECNOLOGÍAS

| TECNOLOGÍA | APLICACIÓN |
|:---|:---|
| **HTML5** | Estructura de la interfaz |
| **CSS3** | Diseño y presentación visual |
| **JavaScript** | Lógica e interactividad |
| **Supabase** | Autenticación y almacenamiento |
| **PostgreSQL** | Persistencia de datos |
| **Web Crypto API** | Cifrado en el navegador |
| **GitHub** | Control de versiones |
| **Vercel** | Despliegue y alojamiento |

La comunicación con Supabase se realiza mediante un cliente REST propio, sin utilizar el SDK `supabase-js`.

## 04. ARQUITECTURA DEL PROYECTO

El proyecto utiliza una estructura organizada por directorios que separa los recursos gráficos, las hojas de estilo, la lógica de aplicación y la documentación.

**Estructura de directorios**

```text
tempo/
│
├── assets/          Recursos gráficos y multimedia
│
├── css/             Hojas de estilo
│
├── docs/            Documentación del proyecto
│
├── js/              Lógica y funcionalidades
│
├── README.md        
│
└── index.html       Punto de entrada
```

Esta organización facilita el mantenimiento del código y permite ampliar las funcionalidades de forma estructurada.

## 05. SEGURIDAD Y CIFRADO

Tempo incorpora un sistema de cifrado del lado del cliente (*client-side encryption*). Los registros se cifran directamente en el navegador antes de transmitirse a Supabase.

### Configuración criptográfica

| PARÁMETRO | CONFIGURACIÓN |
|:---|:---|
| Derivación de clave | PBKDF2-SHA256 |
| Iteraciones | 600.000 |
| Algoritmo de cifrado | AES-GCM |
| Longitud de clave | 256 bits |
| Vector de inicialización | Aleatorio por operación |
| Salt | Aleatorio por cuenta |

La clave derivada permanece en la memoria de la sesión del navegador y se elimina al cerrar sesión. Supabase almacena los registros cifrados y los metadatos criptográficos necesarios para su posterior descifrado.

### Almacenamiento

| TABLA | FUNCIÓN |
|:---|:---|
| `encrypted_records` | Almacenamiento de los registros cifrados |
| `crypto_meta` | Parámetros criptográficos asociados a cada cuenta |

El acceso a los registros está restringido mediante políticas de seguridad **Row Level Security (RLS)**.

**Consideración sobre la recuperación de datos**

Actualmente no existe un mecanismo de recuperación de la clave de cifrado. Recuperar el acceso a la cuenta mediante correo electrónico no permite recuperar automáticamente los datos cifrados si se pierde la contraseña original.

## 06. INSTALACIÓN Y EJECUCIÓN

Tempo funciona como una aplicación web estática y no requiere un proceso de compilación ni instalación de dependencias.

### Ejecución local

1. Clonar el repositorio.
2. Abrir el proyecto en Visual Studio Code.
3. Iniciar un servidor local mediante Live Server.
4. Acceder a la dirección local proporcionada por el servidor.

Para utilizar los servicios de autenticación desde local, el origen correspondiente debe estar autorizado en la configuración de URL de Supabase.

## 07. DESPLIEGUE

La aplicación está desplegada en **Vercel** y conectada al repositorio de GitHub para facilitar la publicación de nuevas versiones.

<div align="center">

**ENTORNO DE PRODUCCIÓN**

[tempo-xi-ten.vercel.app ↗](https://tempo-xi-ten.vercel.app/)

</div>

El archivo `index.html` actúa como punto de entrada de la aplicación. Las actualizaciones del código en GitHub pueden generar nuevos despliegues automáticamente.

## 08. EVOLUCIÓN DEL PROYECTO

Mejoras identificadas para futuras versiones:

- Implementación de una clave de recuperación.
- Finalización del flujo de cambio de contraseña.
- Copias de seguridad descargables.
- Incorporación de un modo oscuro.
- Mejoras de accesibilidad y navegación mediante teclado.
- Modularización progresiva de los componentes de la aplicación.

## 09. PROPIEDAD INTELECTUAL Y DERECHOS DE USO

<div align="center">

<img src="https://img.shields.io/badge/COPYRIGHT-ALL_RIGHTS_RESERVED-123B63?style=for-the-badge" />

</div>

**© 2026 Eva. Todos los derechos reservados.**

Tempo es un proyecto original desarrollado íntegramente de forma individual por su autora. El diseño, la estructura, la interfaz de usuario, la organización del código, la arquitectura, la lógica de funcionamiento y los elementos originales de la aplicación están protegidos por la normativa de propiedad intelectual aplicable.

**Queda expresamente prohibido, sin autorización previa y por escrito de la titular:**

- Copiar, reproducir o reutilizar total o parcialmente el código fuente.
- Modificar, adaptar o crear obras derivadas a partir del proyecto.
- Redistribuir, publicar o compartir copias del código o de sus componentes originales.
- Utilizar el proyecto, su diseño o sus funcionalidades como base para desarrollar o comercializar aplicaciones propias.
- Eliminar o modificar los avisos de autoría y propiedad intelectual.

El acceso público al repositorio no implica la concesión de una licencia de uso, modificación, distribución o explotación del proyecto.

Las librerías, herramientas y servicios de terceros utilizados en Tempo mantienen sus propias licencias y condiciones de uso.

**Este proyecto no se publica bajo una licencia de código abierto. Todos los derechos no concedidos expresamente quedan reservados a su titular.**

---

<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=rect&color=123B63&height=5" />

</div>
