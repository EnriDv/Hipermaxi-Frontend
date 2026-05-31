## Flujo 1: Gestión de Credenciales de Acceso (SOP-SR-01)

Este flujo regula el proceso completo para que un **proveedor nuevo** obtenga por primera vez su usuario y contraseña para ingresar al portal. Está estructurado bajo la práctica de Gestión de Solicitudes de Servicio de ITIL 4 y se divide en las siguientes etapas consecutivas:

### 1. Registro y Envío (Submission)

* 
**Contacto Inicial:** El proveedor se comunica con el área de Soporte por teléfono o WhatsApp (+591 78401543) para solicitar información de acceso. Soporte le aclara que no genera claves en ese momento y lo instruye a enviar un correo formal a `soportehub@hipermaxi.com` con el asunto exacto: *"Solicitud de Credenciales de Acceso al Portal Web de Proveedores"*.


* 
**Envío de Formulario:** El Área de Compras (que administra esa bandeja de correo) recibe la solicitud y le responde al proveedor enviándole un archivo Excel de registro. El proveedor debe rellenar este archivo con datos obligatorios como Razón Social, NIT, códigos de catálogo y los correos de sus roles asignados (especialmente el del **Encargado HUB**, que es el único autorizado para recibir los accesos finales).



### 2. Aprobación (Approval)

* 
**Validación Comercial:** El proveedor devuelve el Excel completado al correo de Compras. Esta área revisa los datos y valida que exista una relación comercial vigente y formal con Hipermaxi. Si detecta inconsistencias o falta de datos, la solicitud se devuelve para corrección.


* 
**Derivación Interna:** Una vez que Compras aprueba comercialmente al proveedor, transfiere formalmente el caso al equipo de Soporte Técnico enviando la solicitud validada a la casilla interna `soporteti@hipermaxi.com`.



### 3. Cumplimiento (Fulfillment)

* 
**Alta en Sistemas:** Al recibir el correo aprobado por Compras, el área de Soporte abre un ticket de atención en la herramienta **GLPI** para iniciar el control técnico.


* 
**Generación de Credenciales:** Soporte interactúa directamente con la **Base de Datos SQL Server** para crear la cuenta bajo la nomenclatura establecida, registrar el código del proveedor y asignarle una contraseña segura (con un estándar estricto de mínimo 9 caracteres, incluyendo mayúsculas, números y símbolos). Toda esta información se respalda en un archivo Excel interno de control.


* 
**Entrega y Verificación:** Las credenciales junto con el enlace oficial (`https://portal.hipermaxi.com/`) se envían por correo electrónico únicamente al Encargado HUB. Inmediatamente después, Soporte contacta al proveedor para confirmar la recepción del correo y solicitarle que realice el **primer inicio de sesión** en vivo para mitigar cualquier error de acceso.



### 4. Cierre (Closure)

* 
**Conclusión del Caso:** El proceso finaliza en el momento en que el proveedor valida de forma conforme que pudo ingresar con éxito a la plataforma web. Con esta confirmación, Soporte documenta la solución, archiva las evidencias en su Excel de control interno y actualiza el estado del ticket en GLPI a "Procesado" para su cierre definitivo.