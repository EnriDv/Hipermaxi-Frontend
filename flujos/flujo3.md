## Flujo 3: Reenvío de Credenciales de Acceso (SOP-SR-03)

Este flujo regula el procedimiento estandarizado para gestionar las solicitudes de reenvío de usuario y contraseña debido a pérdida, extravío o no recepción. Aplica exclusivamente a **proveedores activos** que ya cuentan con una cuenta previamente creada, garantizando que los accesos se entreguen únicamente al correo del personal autorizado. Sigue la práctica de Gestión de Solicitudes de Servicio de ITIL 4:

### 1. Registro y Envío (Submission)

* 
**Contacto Inicial:** El proveedor se comunica con Soporte mediante teléfono o WhatsApp (+591 78401543) indicando el extravío o falta de sus credenciales. Soporte lo atiende, le explica el procedimiento formal y le instruye que envíe una solicitud por correo electrónico.


* 
**Canal y Asunto Oficial:** El proveedor debe redactar un correo dirigido a `soportehub@hipermaxi.com` con el asunto obligatorio: *"Solicitud de Reenvío de Credenciales de Acceso"*. En esta primera llamada o mensaje de WhatsApp no se realiza ningún reenvío directo.


* 
**Recopilación de Datos:** El Área de Compras, encargada de administrar esa bandeja, le responde al proveedor adjuntando un archivo en formato Excel. El proveedor debe rellenar este formulario con toda su información comercial y los datos de contacto de sus encargados para asegurar el control y la trazabilidad del proceso.



### 2. Aprobación (Approval)

* 
**Validación de Identidad:** El proveedor devuelve el Excel completado. El Área de Compras revisa minuciosamente que los datos estén completos, verifica que el código del proveedor corresponda a un registro existente y valida la información en los sistemas de Hipermaxi. Si existen observaciones, se exige una corrección inmediata antes de continuar.


* 
**Derivación:** Tras la aprobación formal de Compras, la solicitud se deriva al equipo técnico mediante la casilla `soporteti@hipermaxi.com`.



### 3. Cumplimiento (Fulfillment)

* 
**Control de Registros:** Al recibir el caso, Soporte registra el ticket correspondiente en la herramienta **GLPI**. El técnico verifica que el proveedor figure de manera correcta tanto en el archivo interno de Excel como en la Base de Datos SQL Server.


* 
**Filtro de Seguridad Obligatorio (Vigencia del Encargado HUB):** Soporte contacta al proveedor para confirmar si la persona designada como **Encargado HUB** sigue siendo la misma:


* 
*Si es el mismo encargado:* El proceso sigue su curso normal.


* 
*Si el encargado cambió:* Soporte revisa si hay un Encargado de Sistemas o Comercial registrado en el Excel interno. De ser así, se le pide al proveedor tramitar una *Solicitud de Actualización de Encargado HUB* desde esos correos autorizados. Si ya no forman parte de la empresa, el proveedor deberá enviar un correo corporativo formal solicitando la actualización del titular.




* 
**Reenvío Seguro:** Una vez validada la vigencia del Encargado HUB, Soporte extrae las credenciales existentes de la base de datos y las reenvía únicamente al correo del Encargado HUB autorizado. El mensaje incluye el usuario, la contraseña, el enlace oficial del portal y las instrucciones de acceso.


* 
**Confirmación Telefónica:** Soporte llama o escribe al proveedor para verificar la recepción del correo y exigirle que confirme en vivo que ha podido ingresar exitosamente a la plataforma web. Si se presenta algún inconveniente en el intento, se gestiona inmediatamente como un incidente hasta solucionarlo.



### 4. Cierre (Closure)

* 
**Finalización del Caso:** El flujo se da por concluido en el momento exacto en que el proveedor confirma su acceso exitoso al portal. Soporte registra la validación en el ticket de GLPI, archiva la evidencia correspondiente en el Excel interno de control y cambia el estado de la solicitud a "Procesado" para dar por cerrado el ticket de forma segura.