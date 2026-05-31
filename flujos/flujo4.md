## Flujo 4: Asistencia al Cargar un Producto al Portal Web (SOP-04)

A diferencia de los tres flujos anteriores (que eran solicitudes de servicio bajo ITIL para accesos o activaciones) , este procedimiento regula la **atención de incidencias operativas frecuentes** en el módulo de Catálogo Electrónico (formulario Productos).

Su propósito es guiar al proveedor cuando comete errores de llenado, aclarando que **no aplica para fallas técnicas o caídas del sistema**, sino para resolver dudas de uso. Se ejecuta bajo los siguientes pasos secuenciales:

### 1. Recepción y Recolección de Evidencia

* 
**Contacto Inicial:** Soporte recibe la consulta del proveedor indicando que no puede registrar o guardar un producto en la plataforma.


* 
**Identificación del Problema:** El técnico analiza el mensaje para identificar si se trata de un error al guardar, un producto que no se registra o una aparente falta de permisos.


* 
**Exigencia de Pruebas:** Para saber con precisión en qué parte del proceso se encuentra el proveedor, Soporte le solicita obligatoriamente una captura de pantalla completa del formulario y el mensaje de error que muestra el sistema (si existe).



### 2. Fase de Revisión y Validación Técnica

El técnico analiza la captura o reproduce el caso directamente en el portal para inspeccionar cuatro niveles críticos:

* 
**Inspección Visual (Campos Vacíos):** Se detectan a simple vista secciones obligatorias o campos visibles que el proveedor haya dejado sin llenar.


* 
**Validación de Campos Obligatorios:** Se revisa minuciosamente cada requerimiento. El técnico no debe asumir que el proveedor sabe qué campo falta, por lo que identifica el dato exacto o incorrecto para comunicarlo de forma directa.


* 
**Control de Formato de Imágenes:** Se verifica que las imágenes del artículo se hayan subido correctamente y que cumplan estrictamente con los formatos permitidos: **JPG o PNG**. Si el proveedor intentó subir un PDF u otro formato no válido, el sistema bloqueará el registro.


* 
**Estructura de Información Técnica:** Se chequea que los datos fundamentales del producto estén completos y sin inconsistencias: descripción, código interno del proveedor, código de barra, etiqueta, dimensiones, precio, unidad de medida y registro sanitario (cuando aplique).



### 3. Diagnóstico y Orientación Guiada

* 
**Determinación de la Causa:** Una vez hechas las validaciones, Soporte establece la causa exacta (campos incompletos, formatos de archivo erróneos o información insuficiente) antes de emitir una respuesta.


* 
**Instrucciones Específicas:** El técnico guía al proveedor paso a paso de manera directa, evitando dar indicaciones generales. Se le comunica exactamente qué campo completar, qué archivo corregir y qué acción ejecutar  (Por ejemplo: *"Debe completar el campo de código de barra, luego cargar la imagen en formato JPG o PNG... y finalmente seleccionar 'Guardar'"*) .



### 4. Confirmación y Cierre del Caso

* 
**Reejecución del Proceso:** Se le solicita al proveedor que realice de nuevo la carga del producto siguiendo las instrucciones brindadas. El técnico confirma en vivo que el artículo se haya registrado con éxito y que no existan nuevas dificultades.


* 
**Registro en GLPI:** Una vez que el proveedor logra completar el registro correctamente y evitar errores futuros, Soporte asienta la solución aplicada, documenta la causa real del problema y procede al cierre formal del ticket en la herramienta **GLPI**.