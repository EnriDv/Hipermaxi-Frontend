import type { DifyChatRequest, DifyChatResponse } from '../types';

/**
 * Helper to generate mock answers based on query and screen context
 */
export const generateMockAnswer = (query: string, screenContext: any): string => {
  const queryLower = query.toLowerCase();

  // SCENARIO 1: USER IS NOT AUTHENTICATED (LOGIN SCREEN)
  if (screenContext?.isAuthenticated === false) {
    // Flujo 1: Crear credenciales
    if (queryLower.includes('crear') || queryLower.includes('solicitar') || queryLower.includes('nuevo') || queryLower.includes('acceso') || queryLower.includes('obtener') || queryLower.includes('flujo 1') || queryLower.includes('primera')) {
      return `### 🔑 Flujo 1: Gestión de Credenciales de Acceso (SOP-SR-01)

Si eres un **proveedor nuevo** y necesitas obtener tu usuario y contraseña por primera vez, este es el procedimiento formal:

1. **Envío de Correo Formal**: Envía un correo a **\`soportehub@hipermaxi.com\`** con el asunto exacto:
   *  *"Solicitud de Credenciales de Acceso al Portal Web de Proveedores"*
   *  *Nota: Soporte Técnico no genera claves mediante WhatsApp o llamada directa.*
2. **Formulario de Registro**: El área de Compras te responderá con un archivo Excel. Deberás completarlo con:
   *  Razón Social y NIT.
   *  Códigos de catálogo asignados.
   *  Datos del **Encargado HUB** (el único titular autorizado para recibir los accesos).
3. **Validación Comercial y TI**: Compras validará tu relación comercial activa y derivará el caso al equipo de TI (\`soporteti@hipermaxi.com\`), quienes abrirán un ticket en **GLPI**.
4. **Generación de Accesos**: Soporte creará la cuenta en la Base de Datos con una contraseña segura (mínimo 9 caracteres, combinando mayúsculas, minúsculas, números y símbolos).
5. **Entrega**: Las credenciales se enviarán únicamente al correo del Encargado HUB. Soporte te contactará telefónicamente para validar tu primer inicio de sesión en vivo.`;
    }

    // Flujo 3: Reenvío de credenciales
    if (queryLower.includes('reenv') || queryLower.includes('perdi') || queryLower.includes('olvid') || queryLower.includes('clave') || queryLower.includes('contrase') || queryLower.includes('flujo 3')) {
      return `### 🔄 Flujo 3: Reenvío de Credenciales de Acceso (SOP-SR-03)

Si eres un **proveedor activo** y has extraviado o no recibiste tus claves de acceso, sigue este protocolo de seguridad:

1. **Solicitud por Correo**: Escribe un correo a **\`soportehub@hipermaxi.com\`** con el asunto:
   *  *"Solicitud de Reenvío de Credenciales de Acceso"*
   *  *Por motivos de seguridad, Soporte no realiza reenvíos de contraseñas de forma telefónica o directa por WhatsApp.*
2. **Formulario Excel**: Compras te enviará un formulario de control para que verifiques tus datos de contacto y NIT.
3. **Filtro de Seguridad (Vigencia del Encargado HUB)**:
   *  **Si es el mismo encargado registrado**: Soporte derivará las claves existentes a su correo autorizado.
   *  **Si el encargado cambió**: Deberás formalizar una *Solicitud de Actualización de Encargado HUB* desde el correo de la gerencia o del Encargado de Sistemas previamente registrado.
4. **Reenvío Seguro y Confirmación**: Las credenciales se enviarán al Encargado HUB vigente. Soporte te llamará para verificar el acceso y cerrar el ticket en **GLPI**.`;
    }

    // Flujo 2: Activación de código proveedor
    if (queryLower.includes('activ') || queryLower.includes('codigo') || queryLower.includes('código') || queryLower.includes('habilitar') || queryLower.includes('flujo 2')) {
      return `### ⚙️ Flujo 2: Activación de Código Proveedor - Catálogo (SOP-SR-02)

Si ya puedes entrar al portal pero no visualizas tu Código de Proveedor para empezar a cargar productos, debes solicitar su activación:

1. **Solicitud de Activación**: Envía un correo a **\`soportehub@hipermaxi.com\`** con el asunto obligatorio:
   *  *"Solicitud de Activación de Código Proveedor (Catálogo)"*
2. **Formulario de Registro**: Compras te enviará un Excel donde debes detallar NIT, Razón Social, datos del vendedor y el código comercial a habilitar.
3. **Habilitación en Base de Datos**: Compras valida los contratos comerciales y deriva a Soporte TI. El equipo de TI activa tu código en la base de datos SQL Server.
4. **Validación en Vivo**: Soporte te notificará telefónicamente para que ingreses al portal y confirmes que el catálogo está activo. Si todo funciona correctamente, se procede a cerrar el ticket de GLPI.`;
    }

    // Default response on login screen
    return `### 🤖 Asistente de Soporte a Proveedores Hipermaxi

Estás en la pantalla de **Autenticación (Login)** del portal de proveedores. En esta etapa puedo ayudarte a resolver tus dudas sobre:

* **SOP-SR-01 (Flujo 1)**: ¿Cómo solicito credenciales nuevas por primera vez?
* **SOP-SR-02 (Flujo 2)**: ¿Cómo activo mi código de catálogo de proveedor?
* **SOP-SR-03 (Flujo 3)**: ¿Cómo solicito un reenvío de mi contraseña perdida?

*Escribe detalladamente tu consulta o selecciona uno de los botones rápidos de ayuda debajo.*`;
  }

  // SCENARIO 2: USER IS AUTHENTICATED (LEVEL 2 ENFORCEMENT)
  if (screenContext?.isAuthenticated === true) {
    // If user tries to perform an action (view products, view orders, etc.), restrict it according to Level 2.
    if (
      queryLower.includes('ver producto') || 
      queryLower.includes('mis producto') || 
      queryLower.includes('ver orden') || 
      queryLower.includes('mis orden') || 
      queryLower.includes('mostrar orden') || 
      queryLower.includes('mostrar producto') || 
      queryLower.includes('realizar') || 
      queryLower.includes('ejecutar')
    ) {
      return `### 🔒 Permisos Insuficientes (Nivel 2)

Como asistente inteligente, actualmente me encuentro operando en el **Nivel 2** de integración. 

Esto significa que estoy habilitado para responder preguntas generales y guiarte paso a paso por todos los flujos del portal, pero **no tengo permisos para realizar acciones directas ni consultar tu información privada** (como listar tus productos o ver tus órdenes de compra).

Para realizar esas acciones, por favor navega manualmente utilizando el menú lateral del portal.`;
    }
  }

  // SCENARIO 3: ACTIVE TAB IS CATALOGO (PRODUCTS PAGE)
  if (screenContext?.activeTab === 'catalogo') {

    // Modal is open (New Product Modal)
    if (screenContext?.selectedOrderForInvoice === null && screenContext?.selectedOrderForAVD === null && screenContext?.newProductForm) {
      if (queryLower.includes('guardar') || queryLower.includes('error') || queryLower.includes('fallo') || queryLower.includes('imagen') || queryLower.includes('foto') || queryLower.includes('flujo 4') || queryLower.includes('no puedo') || queryLower.includes('requisito')) {
        const form = screenContext.newProductForm;
        const missingFields = [];
        if (!form.sanitaryRegister) missingFields.push('Registro Sanitario AGEMED (debe desplegarse e ingresarse)');
        if (!form.hasProductImage) missingFields.push('Imagen del Producto (debe cargarse en formato JPG o PNG)');
        if (form.priceCatalog.length === 0) missingFields.push('Catálogo de precios (debe añadirse al menos una tarifa costo/cantidad)');

        let issuesText = '';
        if (missingFields.length > 0) {
          issuesText = `**Errores/Omisiones detectados en tu formulario actual:**\n${missingFields.map(f => `* ❌ Falta: **${f}**`).join('\n')}\n\n`;
        } else {
          issuesText = `**¡Felicidades! Tu formulario actual cumple con todos los campos visuales.** Ya puedes hacer clic en **Guardar**.\n\n`;
        }

        return `### 📦 Flujo 4: Asistencia al Cargar un Producto al Catálogo (SOP-04)

${issuesText}**Reglas de validación técnicas obligatorias para este formulario:**

1. **Formato de Imagen**: La foto del artículo debe estar en formato **JPG** o **PNG**. *Subir archivos PDF, TIFF o Word provocará un rechazo automático.*
2. **Campos Clave**: Se inspeccionan rigurosamente la descripción, código de barras del proveedor, códigos internos, dimensiones, precios y el **Registro Sanitario AGEMED** (obligatorio para alimentos, bebidas y farmacia).
3. **Instrucciones de llenado**:
   * Despliega la tarjeta de **Registro Sanitario AGEMED** e ingresa el código.
   * Carga una imagen válida haciendo clic en el botón de la cámara 📷.
   * Haz clic en **+ Agregar** en el catálogo de precios, rellena costo y cantidad, y confirma la fila.
   * Presiona **Guardar** en el botón naranja inferior.`;
      }
    }

    // Default Catalog Page response
    if (queryLower.includes('excel') || queryLower.includes('import') || queryLower.includes('masiv')) {
      return `### 📊 Importación Masiva de Catálogo (Excel)

En la pantalla de **Catálogo Electrónico** puedes cargar varios productos al mismo tiempo:

1. Haz clic en el botón **Importar Excel** 📥.
2. Asegúrate de descargar la plantilla oficial provista por Hipermaxi.
3. Completa los datos en las columnas sin alterar los encabezados.
4. Sube el archivo Excel. El sistema procesará cada fila de manera asíncrona y te mostrará el reporte final de cargas exitosas y filas con errores.`;
    }

    return `### 📦 Catálogo Electrónico (Productos del Proveedor)

Estás en la pantalla de administración de productos. Aquí puedes:
* **Crear un artículo**: Presiona **Registrar Producto** para abrir el formulario y seguir el **Flujo 4** (AGEMED, imágenes y precios).
* **Eliminar registros**: Haz clic en el botón de la papelera 🗑️ en la lista para quitar un producto.
* **Cargas Masivas**: Utiliza la opción **Importar Excel** para importar tu catálogo completo.

¿En qué puedo ayudarte hoy sobre esta pantalla de productos?`;
  }

  // SCENARIO 3: ACTIVE TAB IS COMPRAS (ORDERS PAGE)
  if (screenContext?.activeTab === 'compras') {

    // Modal Cargar Factura is open
    if (screenContext?.selectedOrderForInvoice) {
      const scenario = screenContext.invoiceScenario;

      // Scenario A: Button is hidden
      if (scenario === 'A') {
        return `### 🧾 Escenario A: No aparece la opción para cargar la factura (SOP-05)

Veo que estás en el modal de **Carga de Factura** de la Orden **${screenContext.selectedOrderForInvoice.id}** y te encuentras con la simulación de botón ausente.

**Análisis de la situación:**
* Al posicionar tu cursor (hacer **hover**) sobre el espacio en blanco, verás la alerta emergente.
* El sistema oculta el botón de subida porque **el departamento de Facturación de Hipermaxi aún no ha autorizado/habilitado esta Orden de Compra**.
* **Esto no es una falla técnica del portal.**

**¿Cómo proceder?**
Soporte Técnico no puede habilitar este botón. Debes **comunicarte de forma directa con el área comercial de Facturación de Hipermaxi** para solicitar la liberación y habilitación comercial de la Orden de Compra. Una vez aprobada por ellos, el botón aparecerá de forma inmediata en el portal.`;
      }

      // Scenario B: File is rejected
      if (scenario === 'B' || queryLower.includes('pdf') || queryLower.includes('formato') || queryLower.includes('rechaz') || queryLower.includes('subir')) {
        return `### 🧾 Escenario B: Rechazo del archivo de Factura (SOP-05)

Si estás intentando subir tu factura y el portal te muestra un error o rechaza el archivo, verifica los requisitos técnicos:

1. **Restricción de Formato Único**: El portal web está configurado para aceptar **exclusivamente archivos en formato PDF** (ej: \`factura_1024.pdf\`).
2. **Rechazo automático**: Si intentas subir imágenes (JPG, PNG) o archivos editables (Word, Excel), la plataforma bloqueará la carga de forma automática.
3. **Integridad del archivo**: Asegúrate de que el PDF abra correctamente en tu equipo y no se encuentre corrupto o protegido con contraseñas de escritura.

**Solución**: Exporta o guarda tu factura directamente en formato PDF desde tu sistema de facturación e intenta cargarla de nuevo.`;
      }

      // Scenario C: Factura Observada
      if (scenario === 'C' || queryLower.includes('observad') || queryLower.includes('inconsistencia') || queryLower.includes('precio') || queryLower.includes('diferencia')) {
        return `### 🧾 Escenario C: Factura en estado "Observada" (SOP-05)

Si la factura figura en el portal con el estado **"Factura Observada"** en color naranja, se debe a un proceso automático de **conciliación comercial**:

**¿Por qué ocurre esto?**
El portal realiza un cruce inmediato entre los datos del PDF cargado y la Orden de Compra (OC) original de Hipermaxi. Se ha detectado una **discrepancia o variación** en alguno de los siguientes puntos:
* **Diferencia de Precios**: El precio unitario facturado difiere del precio aprobado en la OC.
* **Cantidades incorrectas**: La cantidad declarada en la factura supera la cantidad de la OC.
* **Datos Fiscales erróneos**: Errores en NIT, Razón Social o datos de facturación.

**¿Cómo proceder?**
Soporte Técnico no puede autorizar una factura observada. Debes **corregir los precios o cantidades facturadas** para que coincidan exactamente con el contrato de la Orden de Compra original, emitir una nueva factura PDF y volver a cargarla.`;
      }

      return `### 🧾 Asistencia al Cargar Factura (SOP-05)

Estás en el modal de **Carga de Factura** de la Orden **${screenContext.selectedOrderForInvoice.id}**. El flujo de subida de facturas se divide en tres escenarios frecuentes de soporte:

* **Escenario A**: Si no visualizas el botón para cargar la factura (Falta habilitación de Facturación).
* **Escenario B**: Si el portal te rechaza el archivo (Solo se permite formato **PDF**).
* **Escenario C**: Si subiste la factura pero cambió a **"Factura Observada"** (Diferencias en precios o cantidades).

*Por favor escribe detalladamente qué error visualizas o selecciona una de las opciones rápidas del chat.*`;
    }

    // Modal Aviso de Despacho (AVD) is open
    if (screenContext?.selectedOrderForAVD) {
      const order = screenContext.selectedOrderForAVD;
      if (order.despatchAlert === 'Confirmado') {
        return `### 🚚 Flujo 6: Aviso de Despacho (AVD) "Confirmado" (SOP-06)

Veo que estás visualizando el **Aviso de Despacho (AVD)** para la Orden **${order.id}** y este se encuentra en estado **"Confirmado"**.

**¿Por qué está todo bloqueado?**
* Al presionar el botón **Confirmar Despacho**, el portal **congela la información y bloquea los campos de cantidades** de forma automática y definitiva.
* Este comportamiento es parte del control operativo de Hipermaxi para evitar que se alteren los despachos que ya están en camino al centro de distribución.
* **No es una falla técnica del sistema.**

**¿Cómo corregir o editar datos en este estado?**
Soporte Técnico no tiene permisos en base de datos para modificar o revertir AVDs ya confirmados. Debes **comunicarte de manera inmediata con tu Comprador Asignado en el Área de Compras de Hipermaxi** para que ellos anulen la recepción comercialmente o generen una nueva orden complementaria.`;
      }

      // Draft mode
      return `### 🚚 Gestión del Aviso de Despacho - AVD (Borrador)

Estás completando el **Aviso de Despacho (AVD)** para la Orden de Compra **${order.id}**.

* **Copiar Cantidades**: Utiliza el botón **Copiar Cant. OC** para copiar las cantidades solicitadas a la columna de despacho.
* **Confirmar Despacho**: Al presionar **Confirmar Despacho**, se congelarán los campos y se enviará la entrega a Hipermaxi. *Asegúrate de que los precios unitarios y cantidades sean correctos antes de confirmar.*`;
    }

    // Default Orders view
    return `### 📄 Módulo de Compras (Órdenes de Compra)

Estás en la pantalla de **Órdenes de Compra**. Desde aquí puedes buscar, filtrar por estado y gestionar los pedidos emitidos por Hipermaxi:

* **Cargar Facturas**: Presiona **Cargar Factura** para adjuntar tus comprobantes fiscales PDF (Flujo SOP-05).
* **Aviso de Despacho (AVD)**: Presiona **AVD / Despachar** para registrar las cantidades a entregar en los almacenes (Flujo SOP-06).

¿Deseas saber cómo filtrar pedidos, por qué un pedido figura con alertas o cómo proceder con el despacho?`;
  }

  // Support contact check
  if (queryLower.includes('servicio técnico') || queryLower.includes('tecnico') || queryLower.includes('soporte') || queryLower.includes('contacto') || queryLower.includes('whatsapp') || queryLower.includes('teléfono')) {
    return `### 📞 Soporte Técnico - Portal de Proveedores Hipermaxi

Puedes contactar con el equipo técnico mediante los siguientes canales oficiales:

* **WhatsApp / Teléfono**: [+591 78401543](https://wa.me/59178401543?text=Hola,%20necesito%20asistencia%20en%20el%20portal%20de%20proveedores)
* **Correo Electrónico**: soportehub@hipermaxi.com
* **Horario de Atención**: Lunes a Viernes 08:30 - 18:30
* **Soporte de Tickets**: Gestión de incidencias de forma trazable mediante **GLPI**.`;
  }

  // Fallback default response
  return `¡Hola! Soy tu **Asistente Hipermaxi** para proveedores.

Puedo guiarte paso a paso en las siguientes gestiones de soporte:
* **Accesos**: Solicitud de claves nuevas (SOP-SR-01) o reenvío por extravío (SOP-SR-03).
* **Catálogo**: Registro de productos, formatos de imágenes y AGEMED (SOP-04).
* **Facturación**: Errores al cargar facturas y estados observados (SOP-05).
* **Despacho**: Modificación de avisos de despacho bloqueados (SOP-06).

¿En qué pantalla del portal te encuentras o qué proceso estás intentando realizar?`;
};

/**
 * Simulates a request to Dify's POST /v1/chat-messages endpoint
 * response_mode: "blocking"
 */
export const sendChatMessageToDify = async (request: DifyChatRequest): Promise<DifyChatResponse> => {
  // Simulate network latency (800ms to 1500ms)
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

  const conversationId = request.conversation_id || `conv_${Date.now()}`;
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Parse screen context if present
  let screenContext: any = null;
  if (request.inputs && request.inputs.screenContent) {
    try {
      screenContext = JSON.parse(request.inputs.screenContent);
    } catch {
      screenContext = null;
    }
  }

  const answer = generateMockAnswer(request.query, screenContext);

  return {
    event: 'message',
    task_id: taskId,
    id: messageId,
    message_id: messageId,
    conversation_id: conversationId,
    mode: 'chat',
    answer,
    metadata: {
      usage: {
        total_tokens: Math.floor(100 + Math.random() * 200),
      },
      retriever_resources: [],
    },
    created_at: Math.floor(Date.now() / 1000),
  };
};

/**
 * Simulates a streaming request to Dify's POST /v1/chat-messages endpoint
 * response_mode: "streaming"
 */
export const sendChatMessageToDifyStream = async (
  request: DifyChatRequest,
  onChunk: (chunk: string, conversationId: string) => void
): Promise<DifyChatResponse> => {
  // Simulate initial small delay before response starts (400ms to 600ms)
  await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 200));

  const conversationId = request.conversation_id || `conv_${Date.now()}`;
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Parse screen context if present
  let screenContext: any = null;
  if (request.inputs && request.inputs.screenContent) {
    try {
      screenContext = JSON.parse(request.inputs.screenContent);
    } catch {
      screenContext = null;
    }
  }

  const answer = generateMockAnswer(request.query, screenContext);

  // Divide the complete text into small chunks of words/chars
  const chunks: string[] = [];
  let index = 0;
  const chunkSize = 5; // characters per chunk to simulate fluid typing
  while (index < answer.length) {
    chunks.push(answer.substring(index, index + chunkSize));
    index += chunkSize;
  }

  // Iterate over chunks and emit them
  for (const chunk of chunks) {
    onChunk(chunk, conversationId);
    // Wait between 15ms and 35ms per chunk
    await new Promise((resolve) => setTimeout(resolve, 15 + Math.random() * 20));
  }

  return {
    event: 'message',
    task_id: taskId,
    id: messageId,
    message_id: messageId,
    conversation_id: conversationId,
    mode: 'chat',
    answer,
    metadata: {
      usage: {
        total_tokens: Math.floor(100 + Math.random() * 200),
      },
      retriever_resources: [],
    },
    created_at: Math.floor(Date.now() / 1000),
  };
};
