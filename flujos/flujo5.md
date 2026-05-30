## Flujo 5: Asistencia al Cargar Factura en Órdenes de Compra (SOP-05)

Este procedimiento regula la atención de consultas operativas frecuentes en el **Módulo de Compras (formulario Órdenes de Compra)**. Al igual que el flujo anterior, no se trata de fallas técnicas de la plataforma, sino de problemas funcionales o restricciones de control del sistema.

Debido a que este flujo se ramifica en **tres situaciones distintas**, Soporte ejecuta un diagnóstico diferenciado para cada una:

---

### Escenario A: No aparece la opción/botón para cargar la factura

Este caso ocurre cuando el proveedor ingresa al formulario y manifiesta que no visualiza el botón físico para subir su documento.

* 
**Recepcion de Evidencia:** Soporte atiende al proveedor vía telefónica o WhatsApp (+591 78401543). Solicita obligatoriamente el Número de Orden de Compra (OC) y una captura de pantalla del módulo.


* 
**Validación Técnica Exclusiva:** El técnico le pide al proveedor que **posicione el cursor del mouse (hacer hover) sobre el recuadro en blanco** donde debería estar el botón. Al hacer esto, el sistema despliega un mensaje dinámico explicando la razón de la ausencia.


* 
**Diagnóstico:** El sistema oculta el botón deliberadamente porque la Orden de Compra **no ha sido habilitada previamente por el área de Facturación** de Hipermaxi. No es un error del sistema.


* 
**Orientación y Cierre:** Soporte le aclara al proveedor que la opción solo se activará cuando el departamento de Facturación autorice la recepción. Se le instruye a **contactar directamente a dicha área externa**. Tras confirmar el entendimiento del usuario, se registra y cierra el ticket en GLPI.



---

### Escenario B: El sistema rechaza o no permite cargar el archivo

El proveedor ve el botón, pero el sistema le impide completar la carga o le arroja un error al intentar subir la factura.

* 
**Recepción de Evidencia:** Se solicita el archivo original de la factura que intenta subir y la captura de pantalla del error.


* 
**Validación Técnica Exclusiva:** Soporte inspecciona el archivo del proveedor para verificar tres puntos: que abra correctamente, que no esté vacío o dañado, y **su extensión/formato**.


* 
**Diagnóstico:** El Portal Web está programado con una restricción dura: **únicamente acepta archivos en formato PDF**. Si el proveedor intenta subir imágenes (JPG, PNG) o documentos de Office (Word, Excel), el portal rechaza automáticamente la carga.


* 
**Orientación y Cierre:** El técnico le notifica de forma directa que su archivo es inválido. Le indica que debe **convertir o generar la factura nuevamente en formato PDF** estricto antes de reintentarlo. Se verifica en línea que el proveedor logre subir el nuevo PDF de forma exitosa y se cierra el caso en GLPI.



---

### Escenario C: La factura aparece como "Factura Observada"

El proveedor logró subir el documento, pero el portal cambió el estado del registro a "Observada", bloqueando el proceso.

* 
**Recepción de Evidencia:** Soporte solicita el Número de la OC, la captura de la observación en el formulario y el archivo de la factura cargada.


* 
**Validación Técnica Exclusiva:** El técnico lee el mensaje de alerta del sistema. Posteriormente, realiza una **conciliación de datos** comparando la factura del proveedor contra la Orden de Compra registrada en el sistema de Hipermaxi. Revisa específicamente: montos totales, productos detallados, precios unitarios y datos fiscales del proveedor.


* 
**Diagnóstico:** Se determina que la alerta es una validación de control automático del sistema. Existe una **inconsistencia o variación** (en montos, precios o productos) entre lo que el proveedor facturó y lo que Hipermaxi aprobó en la OC original.


* 
**Orientación y Cierre:** Soporte le detalla al proveedor el error exacto encontrado (Por ejemplo: *"La factura presenta diferencias en los precios unitarios respecto a la Orden de Compra..."*). Se le instruye a verificar y corregir los datos comerciales antes de volver a facturar y subir el documento. Una vez que el proveedor comprende la discrepancia, el ticket se documenta y se cierra en GLPI.