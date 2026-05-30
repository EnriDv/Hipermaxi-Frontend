Flujo 6: Asistencia en Aviso de Despacho - AVD (SOP-06) 

Este procedimiento regula la atención de consultas e incidencias funcionales dentro del **Módulo de Compras (formulario Aviso de Despacho)**. Al igual que en los casos de productos y facturas, se enfoca en resolver errores operativos del usuario y explicar restricciones de lógica dura de la plataforma, por lo que **no aplica ante caídas o fallas técnicas del sistema**.

El flujo se activa específicamente cuando el proveedor reporta que le es imposible modificar o editar un aviso ya enviado:

1. Recepción y Captura de Datos 

* 
**Contacto Inicial:** El equipo de Soporte recibe el reclamo del proveedor por vía telefónica o mediante el WhatsApp corporativo (78401543). El usuario suele manifestar frases como: *"No puedo editar el AVD"*, *"Necesito cambiar cantidades"* o *"Me equivoqué y quiero modificarlo"*.


* 
**Requerimiento Obligatorio:** Para poder rastrear el registro exacto dentro del portal, el técnico le solicita obligatoriamente al proveedor dos elementos: el **Número de la Orden de Compra** vinculada y una captura de pantalla del AVD en cuestión.



2. Fase de Verificación y Diagnóstico 

* 
**Localización del Registro:** El técnico ingresa al Portal de Proveedores, localiza el aviso de despacho enviado e inspecciona que tenga una relación correcta con la Orden de Compra informada.


* 
**Chequeo de Estado:** Soporte comprueba visualmente el estado del formulario dentro del sistema.


* 
**Identificación de la Restricción:** El técnico constata si el AVD se encuentra en estado **"Confirmado"**. Al pasar a este estado, la lógica del sistema congela la pantalla y bloquea de forma automática los campos de entrada. Esto significa que el proveedor ya no puede alterar cantidades, corregir datos logísticos ni revertir el proceso desde la interfaz web. El técnico valida que este comportamiento es el funcionamiento normal del software y no un error de programación.



3. Evaluación del Impacto y Orientación 

* 
**Análisis del Contexto:** El técnico evalúa la gravedad del error operativo cometido por el proveedor, identificando si registró cantidades incorrectas o si el documento quedó erróneamente con un monto final en cero. Esto es crucial ya que estos incidentes suelen ocurrir de forma frecuente en proveedores nuevos o que omitieron revisar los manuales y videos tutoriales de apoyo.


* 
**Explicación del Flujo Técnico:** Soporte se comunica con el usuario y le explica detalladamente que, una vez presionado el botón de confirmación, el portal bloquea de forma irreversible cualquier edición posterior como parte del control del flujo operativo de Hipermaxi.



4. Derivación y Cierre del Ticket 

* 
**Procedimiento por Vía Externa:** El técnico le aclara al proveedor que el equipo de Soporte no realiza ni tiene permitido hacer modificaciones sobre Avisos de Despacho ya confirmados. Por lo tanto, le instruye de forma específica que debe **comunicarse directamente con su comprador asignado en el Área de Compras** de Hipermaxi según el rubro al que pertenezca.


* 
**Resolución del Negocio:** El Área de Compras se encargará de evaluar el caso comercialmente de forma externa y definirá la acción a seguir (como la anulación o la emisión de una nueva Orden de Compra).


* 
**Registro Final:** Soporte verifica que el proveedor haya comprendido perfectamente la explicación y los pasos de derivación externa para evitar interpretaciones erróneas del sistema. Finalmente, el técnico asienta en la herramienta **GLPI** la causa real del problema, documenta la orientación brindada y procede al cierre formal del ticket de atención.