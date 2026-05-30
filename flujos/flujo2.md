## Flujo 2: Activación de Código Proveedor - Catálogo (SOP-SR-02)

Este flujo regula el procedimiento para habilitar operativamente el **Código de Proveedor (Catálogo)** dentro del portal, permitiéndole posteriormente registrar sus productos. Al igual que el anterior, está alineado con la práctica de Gestión de Solicitudes de Servicio de ITIL 4:

### 1. Registro y Envío (Submission)

* 
**Contacto Inicial:** El proveedor se comunica con Soporte por teléfono o WhatsApp (+591 78401543) solicitando ayuda para activar su código. Soporte lo orienta y le indica que la solicitud formal debe enviarse por correo a `soportehub@hipermaxi.com` , aclarando que en esta etapa inicial no se realiza ninguna activación directa.


* 
**Asunto Obligatorio:** El correo del proveedor debe llevar el asunto estricto: *"Solicitud de Activación de Código Proveedor (Catálogo)"*.


* 
**Envío de Formulario:** El Área de Compras recibe el correo y le envía al proveedor un archivo Excel de registro. El proveedor lo completa con sus datos (Nombre, Razón Social, NIT, Roles, Email, Teléfono, Región, Datos del Vendedor y Código de Proveedor a activar) y lo devuelve a la misma casilla.



### 2. Aprobación (Approval)

* 
**Validación de Datos:** El Área de Compras revisa que la información esté completa, valida la relación comercial y verifica que el código solicitado corresponda a registros existentes en Hipermaxi. Si detecta observaciones, solicita correcciones al proveedor.


* 
**Derivación a Soporte:** Una vez que la solicitud cuenta con la aprobación formal de Compras, el caso se transfiere al equipo técnico mediante el correo `soporteti@hipermaxi.com`.



### 3. Cumplimiento (Fulfillment)

* 
**Activación en Base de Datos:** Soporte recibe la solicitud aprobada y registra la activación del código del proveedor directamente en la **Base de Datos SQL Server**.


* 
**Control Interno:** El código activado se asienta en el archivo Excel de control interno de Soporte y se responde al correo institucional confirmando la habilitación, con copia al área comercial correspondiente.


* 
**Validación de Operatividad:** Soporte se contacta con el proveedor y le solicita ingresar al portal para confirmar que el código ya aparece activo y completamente funcional. En caso de fallas, Soporte gestiona el problema como un incidente técnico hasta resolverlo.



### 4. Cierre (Closure)

* 
**Finalización:** Cuando el proveedor confirma en vivo la activación correcta de su código en la plataforma , Soporte registra la validación en el sistema de tickets **GLPI**.


* 
**Cierre de Ticket:** Se archiva la evidencia en el Excel interno, se cambia el estado del ticket a "Procesado" y el flujo se da por concluido de forma documentada.