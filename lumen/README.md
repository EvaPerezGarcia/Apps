 <div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=rect&color=123B63&height=8" />

<br/><br/>

# LUMEN

**AI-POWERED DASHBOARD GENERATOR**

Transformación de datos en dashboards interactivos mediante inteligencia artificial.

<br/>

<a href="https://lumen-eight-sooty-36.vercel.app/">
<img src="https://img.shields.io/badge/↗_ABRIR_LUMEN-123B63?style=for-the-badge&labelColor=0B1220" />
</a>

<br/><br/>

<img src="https://img.shields.io/badge/HTML5-263B53?style=flat-square&logo=html5&logoColor=white" />
<img src="https://img.shields.io/badge/CSS3-263B53?style=flat-square&logo=css3&logoColor=white" />
<img src="https://img.shields.io/badge/JavaScript-263B53?style=flat-square&logo=javascript&logoColor=white" />
<img src="https://img.shields.io/badge/Groq_AI-263B53?style=flat-square" />
<img src="https://img.shields.io/badge/Supabase-263B53?style=flat-square&logo=supabase&logoColor=white" />
<img src="https://img.shields.io/badge/Vercel-263B53?style=flat-square&logo=vercel&logoColor=white" />

<br/><br/>

<img width="100%" src="https://capsule-render.vercel.app/api?type=rect&color=E5E7EB&height=1" />

</div>

## 01. DESCRIPCIÓN

Lumen es una aplicación web que utiliza inteligencia artificial para transformar archivos de datos en dashboards interactivos y personalizados.

La aplicación permite importar archivos Excel y CSV, analizar automáticamente su estructura y generar un panel de visualización adaptado a la información disponible. La inteligencia artificial identifica las variables relevantes, propone indicadores clave (KPIs) y selecciona los gráficos más adecuados para facilitar la interpretación de los datos.

El proyecto incorpora un agente conversacional que permite modificar los dashboards mediante instrucciones en lenguaje natural, evitando que el usuario tenga que configurar manualmente cada elemento.

Lumen combina desarrollo frontend, procesamiento de datos, inteligencia artificial y almacenamiento en la nube para ofrecer una herramienta de análisis accesible e intuitiva.

## 02. FUNCIONALIDADES

### 01 - Importación y análisis de datos

- Importación de archivos Excel (`.xlsx`, `.xls`) y CSV.
- Lectura y procesamiento de los datos mediante JavaScript.
- Identificación automática de columnas y tipos de variables.
- Detección de dimensiones categóricas, numéricas y temporales.
- Generación de un perfil del conjunto de datos para su análisis mediante IA.
- Posibilidad de comenzar con conjuntos de datos de ejemplo.

### 02 - Generación automática de dashboards

- Creación de dashboards a partir del contenido del archivo.
- Selección automática de métricas y dimensiones relevantes.
- Identificación y generación de indicadores clave (KPIs).
- Creación de gráficos de barras, líneas y distribución.
- Adaptación de las visualizaciones a las características del conjunto de datos.
- Generación de títulos e interpretaciones para los gráficos.
- Distribución dinámica de los elementos del dashboard.

### 03 - Agente conversacional de inteligencia artificial

- Interacción mediante instrucciones en lenguaje natural.
- Modificación de métricas y dimensiones.
- Incorporación, actualización y eliminación de gráficos.
- Cambio de tipos de visualización.
- Personalización de colores individuales de los gráficos.
- Configuración de rangos de valores.
- Modificación de títulos, paletas y temas.
- Activación y desactivación de elementos del dashboard.

### 04 - Personalización visual

- Selección de diferentes paletas de colores.
- Creación de paletas personalizadas.
- Extracción de colores a partir de imágenes de referencia.
- Selección de tipografías.
- Configuración de temas claros y oscuros.
- Personalización de los elementos y la composición visual.
- Adaptación del diseño a diferentes tamaños de pantalla.

### 05 - Interactividad y exploración de datos

- Tooltips informativos en las visualizaciones.
- Filtros por categorías, fechas y valores numéricos.
- Actualización de los resultados según los filtros aplicados.
- Consulta de los registros mediante una tabla de datos.
- Indicadores y resúmenes dinámicos.

### 06 - Exportación de información

- Exportación de los datos y resultados a Excel.
- Generación de documentos PDF del dashboard.
- Descarga de los resultados para su consulta y utilización posterior.

### 07 - Gestión de dashboards

- Registro e inicio de sesión mediante Supabase.
- Guardado de dashboards en la cuenta del usuario.
- Biblioteca personal de dashboards.
- Apertura, duplicación y eliminación de proyectos.
- Almacenamiento de los datos, configuraciones y visualizaciones asociadas a cada dashboard.

## 03. TECNOLOGÍAS

| TECNOLOGÍA | APLICACIÓN |
|:---|:---|
| **HTML5** | Estructura de la aplicación |
| **CSS3** | Diseño, estilos y adaptación responsive |
| **JavaScript** | Lógica, procesamiento e interactividad |
| **SheetJS (XLSX)** | Lectura y exportación de archivos Excel |
| **html2canvas** | Captura visual del dashboard |
| **jsPDF** | Generación de documentos PDF |
| **Groq API** | Procesamiento de peticiones mediante IA |
| **Llama 3.3 70B Versatile** | Modelo de inteligencia artificial |
| **Supabase** | Autenticación y almacenamiento en la nube |
| **PostgreSQL** | Base de datos |
| **Vercel Functions** | Backend y comunicación con el modelo de IA |
| **GitHub** | Control de versiones |
| **Vercel** | Despliegue y alojamiento |

## 04. ARQUITECTURA DEL PROYECTO

Lumen utiliza una arquitectura que separa la interfaz de usuario y la lógica de inteligencia artificial.

El frontend se desarrolla mediante HTML, CSS y JavaScript, mientras que las peticiones al modelo de IA se gestionan a través de una función serverless de Vercel. Esta separación permite mantener las credenciales del servicio de IA fuera del código accesible desde el navegador.

**Estructura de directorios**

```text
lumen/
│
├── api/
│   └── lumen-ai.js       Backend de inteligencia artificial
│
├── assets/
│   └── favicon.png       Recursos gráficos
│
├── index.html            Aplicación principal
│
└── vercel.json           Configuración de Vercel
```

### Flujo de funcionamiento

1. El usuario importa un archivo Excel o CSV.
2. La aplicación procesa el archivo y obtiene su estructura.
3. Se genera un perfil de los datos que se envía al backend.
4. La función serverless de Vercel realiza la petición al modelo de IA.
5. La IA devuelve una propuesta estructurada de dashboard.
6. El frontend interpreta la respuesta y construye las visualizaciones.
7. El usuario puede personalizar el resultado mediante la interfaz o el agente conversacional.
8. El dashboard puede guardarse, exportarse o compartirse.

## 05. INTELIGENCIA ARTIFICIAL

Lumen integra un sistema de inteligencia artificial basado en la API de Groq y el modelo **Llama 3.3 70B Versatile**.

La inteligencia artificial interviene en dos procesos principales:

### Análisis inicial

El modelo recibe un perfil estructurado del conjunto de datos, con información sobre las columnas, sus tipos y ejemplos de valores.

A partir de este perfil, propone:

- Título del dashboard.
- Métrica y dimensión principales.
- Indicadores clave.
- Tipos de gráficos.
- Agregaciones adecuadas.
- Interpretaciones de las visualizaciones.

### Agente conversacional

El agente interpreta las instrucciones del usuario y las transforma en operaciones estructuradas sobre el dashboard existente.

La comunicación utiliza respuestas estructuradas mediante *Function Calling*, lo que permite convertir las instrucciones en cambios concretos sobre los elementos de visualización.

### Arquitectura de conexión

```text
USUARIO
   │
   ▼
FRONTEND (HTML + CSS + JS)
   │
   ▼
VERCEL SERVERLESS FUNCTION
   │
   ▼
GROQ API
   │
   ▼
LLAMA 3.3 70B VERSATILE
   │
   ▼
RESPUESTA ESTRUCTURADA
   │
   ▼
DASHBOARD INTERACTIVO
```

La clave de Groq se almacena como variable de entorno en Vercel y no se incluye en el código del navegador.

## 06. BASE DE DATOS Y ALMACENAMIENTO

Lumen utiliza Supabase para gestionar las cuentas de usuario y almacenar los dashboards.

### Autenticación

- Registro mediante correo electrónico y contraseña.
- Inicio y cierre de sesión.
- Gestión de sesiones de usuario.

### Almacenamiento de dashboards

La tabla `lumen_dashboards` permite almacenar la información necesaria para reconstruir cada dashboard.

| CAMPO | FUNCIÓN |
|:---|:---|
| `id` | Identificador del dashboard |
| `user_id` | Propietario del dashboard |
| `title` | Título del proyecto |
| `source_name` | Nombre del archivo de origen |
| `rows_data` | Registros importados |
| `columns_data` | Columnas del conjunto de datos |
| `types_data` | Tipos de variables |
| `metric` | Métrica principal |
| `dimension` | Dimensión principal |
| `settings` | Configuración visual |
| `is_public` | Estado de publicación |
| `share_token` | Identificador del enlace compartido |

La información permite recuperar el estado del dashboard y continuar trabajando sobre él en futuras sesiones.

## 07. SEGURIDAD Y CONFIGURACIÓN

La arquitectura separa las credenciales privadas del frontend y del backend.

- La clave de Groq se almacena en las variables de entorno de Vercel.
- Las peticiones al modelo se realizan desde una función serverless.
- Se limita el tamaño de las peticiones recibidas por el backend.
- Se establece un límite de solicitudes por dirección IP.
- Se puede exigir una sesión válida de Supabase para utilizar la IA mediante la configuración `LUMEN_REQUIRE_LOGIN`.
- Las operaciones de almacenamiento se realizan mediante el cliente de Supabase y las políticas de acceso configuradas en el proyecto.

**Variables de entorno del backend**

| VARIABLE | FUNCIÓN |
|:---|:---|
| `GROQ_API_KEY` | Clave de acceso a Groq |
| `GROQ_MODEL` | Modelo de IA utilizado (opcional) |
| `SUPABASE_URL` | Dirección del proyecto Supabase |
| `SUPABASE_ANON_KEY` | Clave pública de Supabase |
| `LUMEN_REQUIRE_LOGIN` | Control de autenticación para el servicio de IA |

## 08. DESPLIEGUE

La aplicación está desplegada en **Vercel** y conectada al repositorio de GitHub.

La arquitectura permite publicar tanto el frontend como la función serverless responsable de gestionar las peticiones de inteligencia artificial.

<div align="center">

**ENTORNO DE PRODUCCIÓN**

[https://lumen-eight-sooty-36.vercel.app/ ↗](https://lumen-eight-sooty-36.vercel.app/)

</div>

## 09. PROPIEDAD INTELECTUAL Y DERECHOS DE USO

<div align="center">

<img src="https://img.shields.io/badge/COPYRIGHT-ALL_RIGHTS_RESERVED-123B63?style=for-the-badge" />

</div>

**© 2026 Eva. Todos los derechos reservados.**

Lumen es un proyecto original desarrollado por su autora. El diseño, la estructura, la interfaz de usuario, la organización del código, la lógica de funcionamiento y los elementos originales de la aplicación están protegidos por la normativa de propiedad intelectual aplicable.

**Queda expresamente prohibido, sin autorización previa y por escrito de la titular:**

- Copiar, reproducir o reutilizar total o parcialmente el código fuente.
- Modificar, adaptar o crear obras derivadas a partir del proyecto.
- Redistribuir, publicar o compartir copias del código o de sus componentes originales.
- Utilizar el proyecto, su diseño o sus funcionalidades como base para desarrollar o comercializar aplicaciones propias.
- Eliminar o modificar los avisos de autoría y propiedad intelectual.

El acceso público al repositorio no implica la concesión de una licencia de uso, modificación, distribución o explotación del proyecto.

Las librerías, herramientas y servicios de terceros utilizados en Lumen mantienen sus propias licencias y condiciones de uso.

**Este proyecto no se publica bajo una licencia de código abierto. Todos los derechos no concedidos expresamente quedan reservados a su titular.**

---

<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=rect&color=123B63&height=5" />

**LUMEN · AI-POWERED DATA VISUALIZATION**

*Transforming data into insights.*

</div>
