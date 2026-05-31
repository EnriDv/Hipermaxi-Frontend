Así debería ser el flujo desde frontend.

  Idea Base

  - session = identidad persistente del visitante/proveedor.
  - conversation = un proceso específico.
  - message = chat dentro de una conversación.

  1. Usuario Deslogeado Entra Al Portal
  Genera o recupera un anon_id local. Guárdalo en localStorage.

  let anonId = localStorage.getItem("anon_id");

  if (!anonId) {
    anonId = crypto.randomUUID();
    localStorage.setItem("anon_id", anonId);
  }

  2. Crear O Recuperar Session Anónima

  const res = await fetch(`${API_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      anon_id: anonId,
    }),
  });

  const { session_id, memory, is_new } = await res.json();

  localStorage.setItem("session_id", session_id);

  3. Crear Conversation Externa
  Por ejemplo, usuario quiere activar código proveedor:

  const res = await fetch(`${API_URL}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id,
      anon_id: anonId,
      layer: "external",
      process_type: "activacion_codigo",
    }),
  });

  const { conversation_id } = await res.json();

  Procesos externos:

  activacion_codigo
  credenciales_acceso
  reenvio_credenciales

  4. Chatear Deslogeado

  const res = await fetch(`${API_URL}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_id,
      message: "Necesito activar mi código proveedor",
    }),
  });

  Leer streaming:

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const events = chunk.split("\n\n").filter(Boolean);

    for (const event of events) {
      const data = JSON.parse(event.replace("data: ", ""));

      if (data.text) {
        appendAssistantText(data.text);
      }

      if (data.done) {
        console.log("done", data);
      }
    }
  }

  5. Listar Conversations Anónimas

  const res = await fetch(
    `${API_URL}/sessions/${session_id}/conversations?anon_id=${anonId}`
  );

  const conversations = await res.json();

  6. Ver Mensajes De Una Conversation

  const res = await fetch(`${API_URL}/conversations/${conversation_id}/messages`);
  const messages = await res.json();

  Para anónimo esto funciona si la conversación pertenece a una sesión anónima.

  7. Usuario Se Logea
  Cuando el usuario hace login:

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const { access_token, provider } = await res.json();

  localStorage.setItem("access_token", access_token);
  localStorage.setItem("provider_id", provider.id);

  8. Reclamar Session Anónima Opcional
  Si quieres que el usuario conserve historial anónimo tras logearse:

  await fetch(`${API_URL}/sessions/${session_id}/claim`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({
      anon_id: anonId,
    }),
  });

  Después de reclamarla, esa sesión ya pertenece al proveedor.

  9. Crear O Recuperar Session Logeada
  Si no quieres reclamar sesión anónima, o quieres asegurar la sesión del proveedor:

  const res = await fetch(`${API_URL}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({}),
  });

  const { session_id: providerSessionId } = await res.json();

  localStorage.setItem("session_id", providerSessionId);

  10. Crear Conversation Interna
  Por ejemplo, carga de factura:

  const res = await fetch(`${API_URL}/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({
      session_id: providerSessionId,
      layer: "internal",
      process_type: "carga_factura",
    }),
  });

  const { conversation_id } = await res.json();

  Procesos internos:

  carga_factura
  carga_producto
  asistencia_avd

  11. Chatear Logeado

  const res = await fetch(`${API_URL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({
      conversation_id,
      message: "No puedo cargar mi factura",
    }),
  });

  El streaming se lee igual que antes.

  12. Listar Conversations Logeado

  const res = await fetch(`${API_URL}/sessions/${providerSessionId}/conversations`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const conversations = await res.json();

  13. Ver Mensajes Logeado

  const res = await fetch(`${API_URL}/conversations/${conversation_id}/messages`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const messages = await res.json();

  Flujo Recomendado

  - Al abrir portal:
      - Crear anon_id
      - POST /sessions anónimo
      - Mostrar procesos externos

  - Si el usuario abre chat externo:
      - POST /conversations
      - POST /chat/stream

  - Si el usuario se logea:
      - POST /auth/login
      - Opcional: POST /sessions/{session_id}/claim
      - POST /sessions con token
      - Mostrar procesos internos

  - Si abre proceso interno:
      - POST /conversations con token
      - POST /chat/stream con token

  Regla De Oro

  - Sin token: siempre manda anon_id.
  - Con token: siempre manda Authorization.
  - Para chatear: siempre usa conversation_id, nunca session_id.