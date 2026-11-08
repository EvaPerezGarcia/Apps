<div align="center"> <img width="100%" src="https://capsule-render.vercel.app/api?type=rect&color=0B1220&height=8" /> <br/> <h1>TEMPO</h1>

<sub>PLANIFICADOR PERSONAL · TAREAS · CALENDARIO · CIFRADO EXTREMO A EXTREMO</sub>

<br/><br/>

<a href="https://tempo-xi-ten.vercel.app/"><img src="https://img.shields.io/badge/Ver_demo-tempo--xi--ten.vercel.app-0B1220?style=for-the-badge&logo=vercel&logoColor=white" /></a>

</div>
01. Planificador personal con calendario, tareas y cifrado

<sub>PRODUCTIVIDAD · JAVASCRIPT · SUPABASE</sub>

Aplicación web para organizar el día a día en un único archivo HTML: tareas con fecha y hora, calendario de mes, semana y día, notas, estadísticas y un temporizador de concentración. Los datos se guardan en Supabase y se cifran en el navegador antes de salir del dispositivo.

Funcionalidades principales

Tareas con fecha, hora de inicio y fin, notas, prioridad, estado, etiquetas personalizadas y subtareas.
Repetición semanal o mensual, con edición y borrado de la serie completa o solo de una tarea.
Calendario con vistas de mes, semana y día. Los bloques ocupan el tiempo que dura cada tarea y se pueden arrastrar.
Lista con filtros, búsqueda, orden y vista de tablero (Pendiente, En curso, Hecha).
Inicio con el resumen del día, atrasadas y próximos 7 días.
Productividad: tareas completadas, racha, minutos de enfoque y resumen por etiqueta.
Modo enfoque con temporizador y registro de la sesión en la tarea.
Notas generales, historial de cambios por tarea y deshacer tras borrar.
Cifrado de datos en el navegador (AES-GCM 256 bits, clave derivada con PBKDF2).

Archivos y entregables

tempo-supabase-final.html — Aplicación completa (interfaz, lógica y estilos).
README.md — Esta documentación.
Guía de configuración de Supabase y Google Cloud (ver apartado de instalación).

HABILIDADES TÉCNICAS

<img src="https://img.shields.io/badge/HTML5-263B53?style=flat&logo=html5&logoColor=white" /> <img src="https://img.shields.io/badge/CSS3-263B53?style=flat&logo=css3&logoColor=white" /> <img src="https://img.shields.io/badge/JavaScript-263B53?style=flat&logo=javascript&logoColor=white" /> <img src="https://img.shields.io/badge/Supabase-263B53?style=flat&logo=supabase&logoColor=white" /> <img src="https://img.shields.io/badge/PostgreSQL-263B53?style=flat&logo=postgresql&logoColor=white" /> <img src="https://img.shields.io/badge/Vercel-263B53?style=flat&logo=vercel&logoColor=white" /> <img src="https://img.shields.io/badge/Web_Crypto_API-263B53?style=flat" /> <img src="https://img.shields.io/badge/Cifrado_AES--GCM-263B53?style=flat" /> <img src="https://img.shields.io/badge/Seguridad_por_filas_RLS-263B53?style=flat" />

Ver demo →

Arquitectura

<sub>DISEÑO · SEGURIDAD · DATOS</sub>

Toda la interfaz vive en un único archivo HTML sin dependencias externas. Se comunica directamente con la API REST de Supabase mediante un cliente propio, sin instalar bibliotecas.

Capa	Tecnología	Función
Interfaz	HTML, CSS, JavaScript	Vistas, formularios y lógica en un único archivo
Backend	Supabase	Autenticación por correo y Google, base de datos PostgreSQL
Seguridad de datos	Row Level Security	Cada usuario solo accede a sus filas
Cifrado	Web Crypto API	Datos cifrados en el navegador antes de enviarse
Despliegue	Vercel	Alojamiento estático con HTTPS

Tablas principales: tasks, categories, focus_sessions, general_notes, encrypted_records y crypto_meta.

Cifrado de datos

<sub>PBKDF2 · AES-GCM · CLAVE EN MEMORIA</sub>

Derivación de clave: PBKDF2 con SHA-256 y 600.000 iteraciones, con un salt aleatorio por cuenta.
Cifrado: AES-GCM de 256 bits, con un vector de inicialización aleatorio por registro.
Lo que llega a Supabase: solo texto cifrado. La contraseña nunca se guarda.
Dónde vive la clave: únicamente en la memoria de la pestaña mientras la sesión está desbloqueada.

Importante: cambiar la contraseña impide descifrar los datos creados con la anterior. La recuperación por correo permite entrar en la cuenta, pero no recupera esos datos. Consulta el apartado de limitaciones.

Instalación y configuración

<sub>SUPABASE · AUTENTICACIÓN · DESPLIEGUE</sub>

1. Crear el proyecto en Supabase

Crea un proyecto en una región europea y guarda la contraseña de la base de datos.
Ejecuta en el SQL Editor las tablas y las políticas de seguridad por filas.

2. Configurar la autenticación

En Authentication → Sign In / Providers, activa Email.
En Authentication → URL Configuration, pon la dirección de la app en Site URL y en Redirect URLs.

3. Inicio con Google (opcional)

En Google Cloud Console, crea un ID de cliente OAuth de tipo aplicación web con la URI de redirección https://<TU_PROYECTO>.supabase.co/auth/v1/callback.
En Supabase, activa Google en Sign In / Providers y pega el Client ID y el Client Secret.

4. Publicar

Sube tempo-supabase-final.html como index.html a un repositorio de GitHub.
Importa el repositorio en Vercel. No hace falta compilar nada.
Usa la dirección que te dé Vercel en Supabase (Site URL y Redirect URLs).

Para ejecutarlo en local, abre el archivo en el navegador y añade la dirección local en Redirect URLs.

Limitaciones y próximos pasos

<sub>ROADMAP · MEJORAS PENDIENTES</sub>

Limitaciones actuales

Requiere conexión a internet para guardar y cargar datos.
Los recordatorios se retiraron porque solo funcionaban con la pestaña abierta.
La recuperación de contraseña envía el correo, pero falta la pantalla de nueva contraseña, y cambiarla deja inaccesibles los datos cifrados.

Próximos pasos

Clave de recuperación para restablecer la contraseña sin perder datos.
Pantalla de nueva contraseña al volver desde el enlace del correo.
Copia de seguridad descargable de las tareas.
Modo oscuro y mejoras de accesibilidad.
Separar la lógica, los estilos y el acceso a datos en módulos.

Ver demo →

<div align="center"> <img width="100%" src="https://capsule-render.vercel.app/api?type=rect&color=123B63&height=5" /> </div>
