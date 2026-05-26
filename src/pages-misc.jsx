// Misc pages: Checkout, Success, About, FAQ, Contacto, Políticas

const { useState: useStateMisc } = React;

// ----------------------- Checkout -----------------------

function CheckoutPage() {
  const { cart, cartTotal, navigate } = useShop();
  const [form, setForm] = useStateMisc({
    nombre: "", apellido: "", telefono: "", email: "", documento: "",
    ciudad: "", direccion: "", referencia: "",
    entrega: "envio", pago: "pagopar",
  });
  const [step, setStep] = useStateMisc(1);
  const [submitting, setSubmitting] = useStateMisc(false);
  const [errorMsg, setErrorMsg] = useStateMisc("");

  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const envio = form.entrega === "envio" ? 3500 : 0;
  const total = cartTotal + envio;

  // Validación mínima de campos requeridos por PagoPar
  function validateForCheckout() {
    if (!form.nombre.trim()) return "Ingresá tu nombre.";
    if (!form.telefono.trim()) return "Ingresá tu teléfono.";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) return "Ingresá un email válido.";
    if (total < 1000) return "El total debe ser al menos Gs. 1.000.";
    return "";
  }

  const submit = async (e) => {
    e?.preventDefault();
    if (submitting) return;
    setErrorMsg("");

    const err = validateForCheckout();
    if (err) { setErrorMsg(err); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/pagopar/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, form }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.redirectUrl) {
        const msg = (data && (data.detail || data.error)) || "No pudimos iniciar el pago.";
        throw new Error(msg);
      }
      // Guardar referencia local para mostrar en pantalla de resultado
      window.__PAPU_LAST_ORDER__ = {
        order_code: data.order_code,
        hash: data.hash,
        total,
        at: Date.now(),
      };
      // Redirigir al checkout de PagoPar (misma pestaña)
      window.location.href = data.redirectUrl;
    } catch (err) {
      console.error("[papu] checkout PagoPar:", err);
      setErrorMsg("No pudimos iniciar el pago con PagoPar. Intentá de nuevo.");
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main data-screen-label="Checkout" className="pt-32 pb-20 min-h-screen">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-24 h-24 rounded-full mx-auto mb-5 bg-[#0a0a0a] border border-[#1FE620]/30 flex items-center justify-center">
            <Icon name="cart" className="w-10 h-10 text-[#1FE620]" />
          </div>
          <h1 className="font-display text-4xl text-white mb-3">Tu carrito está vacío</h1>
          <p className="text-white/60 mb-6">No tenés productos para finalizar la compra.</p>
          <GlowButton onClick={() => navigate("catalogo")}>Ver catálogo</GlowButton>
        </div>
      </main>
    );
  }

  return (
    <main data-screen-label="Checkout" className="pt-24 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => navigate("catalogo")} className="text-white/60 hover:text-[#1FE620] text-sm flex items-center gap-1 mb-3">
          <Icon name="arrow-left" className="w-4 h-4" /> Seguir comprando
        </button>
        <h1 className="font-display text-5xl sm:text-6xl text-white">Checkout</h1>
        <p className="text-white/60 mt-2">Completá tus datos y confirmá. Te contactamos para coordinar.</p>

        {/* Steps */}
        <div className="flex items-center gap-2 mt-6 mb-8">
          {["Datos", "Entrega", "Pago"].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${step >= i + 1 ? "text-[#1FE620]" : "text-white/40"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= i + 1 ? "bg-[#1FE620] text-black" : "bg-white/5 text-white/60"}`}>{i + 1}</div>
                <span className="text-xs uppercase tracking-wider font-bold hidden sm:inline">{s}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-px max-w-[60px] ${step > i + 1 ? "bg-[#1FE620]" : "bg-white/10"}`}></div>}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={submit} className="grid lg:grid-cols-[1fr_400px] gap-6">
          <div className="space-y-6">
            <Section title="1 · Tus datos">
              <div className="grid sm:grid-cols-2 gap-3">
                <Input label="Nombre" value={form.nombre} onChange={v => handle("nombre", v)} />
                <Input label="Apellido" value={form.apellido} onChange={v => handle("apellido", v)} />
                <Input label="Teléfono" value={form.telefono} onChange={v => handle("telefono", v)} placeholder="+595 9..." />
                <Input label="Email" value={form.email} onChange={v => handle("email", v)} type="email" />
                <div className="sm:col-span-2">
                  <Input label="Cédula / CI (opcional)" value={form.documento} onChange={v => handle("documento", v)} placeholder="Mejora la validación del pago" />
                </div>
              </div>
            </Section>

            <Section title="2 · Método de entrega">
              <div className="grid sm:grid-cols-3 gap-2 mb-4">
                {[
                  { id: "envio", t: "Envío a domicilio", d: fmt(3500), icon: "truck" },
                  { id: "retiro", t: "Retiro coordinado", d: "Sin costo", icon: "box" },
                  { id: "wa", t: "Coordinar por WhatsApp", d: "A consultar", icon: "whatsapp" },
                ].map(o => (
                  <button key={o.id} type="button" onClick={() => handle("entrega", o.id)}
                    className={`text-left p-3 rounded-md border transition ${form.entrega === o.id ? "border-[#1FE620] bg-[#1FE620]/5 shadow-[0_0_12px_rgba(31,230,32,0.15)]" : "border-white/10 bg-[#0d0d0d] hover:border-white/20"}`}>
                    <Icon name={o.icon} className={`w-5 h-5 mb-2 ${form.entrega === o.id ? "text-[#1FE620]" : "text-white/70"}`} />
                    <div className="text-white font-bold text-sm">{o.t}</div>
                    <div className="text-white/50 text-xs mt-0.5">{o.d}</div>
                  </button>
                ))}
              </div>
              {form.entrega === "envio" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input label="Ciudad" value={form.ciudad} onChange={v => handle("ciudad", v)} />
                  <Input label="Dirección" value={form.direccion} onChange={v => handle("direccion", v)} />
                  <div className="sm:col-span-2">
                    <Input label="Referencia / Piso / Depto" value={form.referencia} onChange={v => handle("referencia", v)} />
                  </div>
                </div>
              )}
            </Section>

            <Section title="3 · Pago">
              <div className="flex items-center gap-3 p-4 rounded-md border border-[#1FE620]/30 bg-[#1FE620]/5">
                <div className="w-10 h-10 rounded-md bg-[#1FE620] text-black flex items-center justify-center">
                  <Icon name="shield" />
                </div>
                <div className="text-sm">
                  <div className="text-white font-bold">Vas a pagar con PagoPar</div>
                  <div className="text-white/60 text-xs mt-0.5">
                    Tarjeta de crédito/débito, Tigo Money, Personal Pay, Giros Tigo, transferencias y más — vas a elegir en la próxima pantalla.
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-[#0a0a0a] border border-[#1FE620]/20 rounded-xl p-5">
              <div className="font-display text-2xl text-white mb-4">Resumen del pedido</div>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-4">
                {cart.map(i => (
                  <div key={i.id} className="flex gap-3 items-center">
                    <img src={i.img} className="w-14 h-14 rounded object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-bold truncate">{i.nombre}</div>
                      <div className="text-white/50 text-xs">×{i.qty}</div>
                    </div>
                    <div className="text-[#1FE620] text-sm font-bold">{fmt(i.precio * i.qty)}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-3 border-t border-white/5">
                <div className="flex justify-between text-sm text-white/60"><span>Subtotal</span><span>{fmt(cartTotal)}</span></div>
                <div className="flex justify-between text-sm text-white/60"><span>Envío</span><span>{envio === 0 ? "Gratis" : fmt(envio)}</span></div>
                <div className="flex justify-between items-end pt-3 border-t border-white/5">
                  <span className="text-white/70 text-sm uppercase tracking-wider">Total</span>
                  <span className="font-display text-3xl text-white">{fmt(total)}</span>
                </div>
              </div>
              <GlowButton type="submit" className="w-full mt-5" disabled={submitting}>
                {submitting ? "Redirigiendo a PagoPar..." : (<>Confirmar pedido <Icon name="arrow-right" className="w-4 h-4" /></>)}
              </GlowButton>
              {errorMsg && (
                <div className="mt-3 p-3 rounded-md border border-red-500/30 bg-red-500/10 text-red-300 text-xs">
                  {errorMsg}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-white/40 mt-3">
                <Icon name="shield" className="w-3.5 h-3.5" /> Compra segura vía PagoPar
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5">
      <div className="text-[10px] uppercase tracking-[0.3em] text-[#1FE620] font-bold mb-1">paso</div>
      <div className="font-display text-2xl text-white mb-5">{title}</div>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold mb-1.5 block">{label}</span>
      <input type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#111] border border-white/10 focus:border-[#1FE620]/60 outline-none rounded-md px-4 py-3 text-white text-sm placeholder:text-white/30 transition" />
    </label>
  );
}

// ----------------------- Success -----------------------

function SuccessPage() {
  const { navigate } = useShop();
  return (
    <main data-screen-label="Success" className="pt-32 pb-20 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(ellipse 50% 40% at 50% 30%, rgba(31,230,32,0.25), transparent 60%)" }}></div>
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-[#1FE620]/40 blur-3xl animate-pulse"></div>
          <div className="relative w-28 h-28 rounded-full bg-white flex items-center justify-center ring-2 ring-[#1FE620] shadow-[0_0_60px_rgba(31,230,32,0.6)] animate-pop">
            <Icon name="check" className="w-14 h-14 text-black" />
          </div>
        </div>

        <div className="text-[#1FE620] uppercase tracking-[0.3em] text-[11px] font-bold mb-2">Pedido confirmado</div>
        <h1 className="font-display text-5xl sm:text-6xl text-white mb-4 leading-[0.95]">
          Pedido recibido <br className="hidden sm:block" /> <span className="text-white drop-shadow-[0_0_18px_rgba(31,230,32,0.6)]" style={{ WebkitTextStroke: "1.5px #1FE620" }}>con éxito</span>
        </h1>
        <p className="text-white/70 text-lg max-w-lg mx-auto mb-8">
          Gracias por comprar en El Papu Store. Te vamos a contactar para confirmar los detalles de tu pedido.
        </p>

        <div className="bg-[#0a0a0a] border border-[#1FE620]/20 rounded-xl p-6 mb-8 text-left">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#1FE620] font-bold">Número de pedido</div>
              <div className="text-white font-display text-2xl">#{(window.__PAPU_LAST_ORDER__ && window.__PAPU_LAST_ORDER__.order_code) || ("PAPU-" + Math.floor(10000 + Math.random() * 90000))}</div>
            </div>
            <Badge kind="viral">Confirmado</Badge>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider mb-0.5">Próximo paso</div>
              <div className="text-white">Te contactamos por WhatsApp</div>
            </div>
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider mb-0.5">Tiempo estimado</div>
              <div className="text-white">10–30 minutos</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <GlowButton onClick={() => navigate("home")}>Volver al inicio</GlowButton>
          <GlowButton variant="outline" onClick={() => navigate("catalogo")}>Seguir comprando</GlowButton>
          <GlowButton variant="dark"><Icon name="whatsapp" className="w-4 h-4" /> WhatsApp</GlowButton>
        </div>
      </div>
    </main>
  );
}

// ----------------------- Sobre -----------------------

function SobrePage() {
  const blocks = [
    { i: "sparkles", t: "Nuestra identidad", d: "Curamos productos que nos parecen buenos. Sin vueltas." },
    { i: "bolt", t: "Compra fácil", d: "Pocos clicks, atención directa, plata bien gastada." },
    { i: "tag", t: "Productos seleccionados", d: "No te ofrecemos cualquier cosa. Lo que recomendamos, lo usaríamos." },
    { i: "chat", t: "Atención directa", d: "Hablás con personas reales, no con un bot estúpido." },
    { i: "fire", t: "Estética diferente", d: "Una tienda que se ve como las marcas que te gustan." },
  ];
  return (
    <main data-screen-label="Sobre" className="pt-24 pb-20">
      <section className="relative py-16 sm:py-20 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(ellipse at 30% 50%, rgba(31,230,32,0.2), transparent 60%)" }}></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-[#1FE620] text-[11px] uppercase tracking-[0.3em] font-bold mb-2">Sobre nosotros</div>
          <h1 className="font-display text-6xl sm:text-8xl text-white leading-[0.85] mb-6">
            La store con <span className="italic text-white drop-shadow-[0_0_20px_rgba(31,230,32,0.5)]" style={{ WebkitTextStroke: "2px #1FE620" }}>más estilo</span>.
          </h1>
          <p className="text-white/70 text-xl leading-relaxed max-w-3xl">
            El Papu Store nace para ofrecer productos urbanos seleccionados, virales y de utilidad real. Buscamos que cada compra sea rápida, simple y con una experiencia visual diferente. Acá encontrás productos seleccionados, ofertas y novedades pensadas para clientes que quieren comprar fácil y con estilo.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {blocks.map((b, i) => (
            <div key={i} className={`bg-[#0a0a0a] border border-white/5 rounded-xl p-6 hover:border-[#1FE620]/40 transition-all group ${i === 0 ? "lg:row-span-2 bg-gradient-to-br from-[#0B3D13]/40 to-[#0a0a0a] border-[#1FE620]/20" : ""}`}>
              <div className="w-12 h-12 rounded-md bg-[#1FE620]/10 border border-[#1FE620]/30 text-[#1FE620] flex items-center justify-center mb-5 group-hover:bg-[#1FE620] group-hover:text-black transition">
                <Icon name={b.i} className="w-6 h-6" />
              </div>
              <div className="font-display text-2xl text-white mb-2">{b.t}</div>
              <div className="text-white/60 text-sm leading-relaxed">{b.d}</div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}

// ----------------------- FAQ -----------------------

function FAQPage() {
  const { FAQS } = window.__PAPU_DATA__;
  const [open, setOpen] = useStateMisc(0);

  return (
    <main data-screen-label="FAQ" className="pt-24 pb-20">
      <section className="relative py-12 border-b border-white/5">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(ellipse at 30% 50%, rgba(31,230,32,0.15), transparent 60%)" }}></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-[#1FE620] text-[11px] uppercase tracking-[0.3em] font-bold mb-2">FAQ</div>
          <h1 className="font-display text-5xl sm:text-7xl text-white leading-[0.9]">Preguntas frecuentes</h1>
          <p className="text-white/60 mt-3">Las dudas más comunes, respondidas sin vueltas.</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className={`border rounded-xl overflow-hidden transition-all ${open === i ? "border-[#1FE620]/50 bg-[#0d0d0d] shadow-[0_0_24px_rgba(31,230,32,0.1)]" : "border-white/5 bg-[#0a0a0a] hover:border-white/15"}`}>
              <button onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full text-left flex items-center justify-between gap-4 p-5">
                <span className={`font-bold ${open === i ? "text-[#1FE620]" : "text-white"}`}>{f.q}</span>
                <Icon name="chevron-down" className={`w-5 h-5 shrink-0 transition-transform ${open === i ? "rotate-180 text-[#1FE620]" : "text-white/50"}`} />
              </button>
              <div className={`grid transition-all duration-300 ${open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 text-white/70 leading-relaxed">{f.a}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-gradient-to-br from-[#0B3D13]/40 to-[#0a0a0a] border border-[#1FE620]/30 rounded-xl p-6 text-center">
          <div className="font-display text-2xl text-white mb-2">¿Otra duda, papu?</div>
          <p className="text-white/60 text-sm mb-4">Escribinos por WhatsApp y te contestamos rápido.</p>
          <GlowButton><Icon name="whatsapp" className="w-4 h-4" /> Escribir por WhatsApp</GlowButton>
        </div>
      </section>
    </main>
  );
}

// ----------------------- Contacto -----------------------

function ContactoPage() {
  const [form, setForm] = useStateMisc({ nombre: "", telefono: "", mensaje: "" });
  const [sent, setSent] = useStateMisc(false);

  return (
    <main data-screen-label="Contacto" className="pt-24 pb-20">
      <section className="relative py-12 border-b border-white/5">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(ellipse at 70% 50%, rgba(31,230,32,0.15), transparent 60%)" }}></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-[#1FE620] text-[11px] uppercase tracking-[0.3em] font-bold mb-2">Contacto</div>
        <h1 className="font-display text-6xl sm:text-8xl text-white leading-[0.85]">Hablemos, <span className="italic text-white drop-shadow-[0_0_14px_rgba(31,230,32,0.5)]" style={{ WebkitTextStroke: "1.5px #1FE620" }}>papu</span>.</h1>
          <p className="text-white/70 mt-4 max-w-2xl text-lg">Consultá productos, stock, ofertas o coordiná tu compra por WhatsApp.</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 sm:p-8">
          <a href="#" className="block bg-white text-black rounded-xl p-5 mb-6 flex items-center justify-between ring-1 ring-[#1FE620]/50 shadow-[0_0_18px_rgba(31,230,32,0.25)] hover:ring-[#1FE620] hover:shadow-[0_0_30px_rgba(31,230,32,0.5)] transition">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-md bg-black/20 flex items-center justify-center">
                <Icon name="whatsapp" className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider font-bold opacity-80">La forma más rápida</div>
                <div className="font-display text-2xl">Escribinos por WhatsApp</div>
              </div>
            </div>
            <Icon name="arrow-right" className="hidden sm:block" />
          </a>

          {sent ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-white ring-2 ring-[#1FE620] mx-auto mb-4 flex items-center justify-center shadow-[0_0_24px_rgba(31,230,32,0.4)]"><Icon name="check" className="w-8 h-8 text-black" /></div>
              <div className="font-display text-2xl text-white mb-2">¡Mensaje enviado!</div>
              <div className="text-white/60">Te respondemos en breve.</div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-3">
              <Input label="Nombre" value={form.nombre} onChange={v => setForm(f => ({ ...f, nombre: v }))} />
              <Input label="Teléfono" value={form.telefono} onChange={v => setForm(f => ({ ...f, telefono: v }))} />
              <label className="block">
                <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold mb-1.5 block">Mensaje</span>
                <textarea value={form.mensaje} onChange={(e) => setForm(f => ({ ...f, mensaje: e.target.value }))}
                  rows={5}
                  className="w-full bg-[#111] border border-white/10 focus:border-[#1FE620]/60 outline-none rounded-md px-4 py-3 text-white text-sm placeholder:text-white/30 resize-none" />
              </label>
              <GlowButton type="submit" className="w-full">Enviar mensaje</GlowButton>
            </form>
          )}
        </div>

        <aside className="space-y-3">
          {[
            { i: "whatsapp", t: "WhatsApp", d: "+54 9 11 5555-5555" },
            { i: "instagram", t: "Instagram", d: "@elpapustore" },
            { i: "facebook", t: "Facebook", d: "/elpapustore" },
            { i: "chat", t: "Horarios", d: "Lun a Sáb · 10 a 20hs" },
          ].map(c => (
            <a key={c.t} href="#" className="flex items-center gap-3 bg-[#0a0a0a] border border-white/5 hover:border-[#1FE620]/40 rounded-xl p-4 transition group">
              <div className="w-11 h-11 rounded-md bg-[#1FE620]/10 border border-[#1FE620]/30 text-[#1FE620] flex items-center justify-center group-hover:bg-[#1FE620] group-hover:text-black transition">
                <Icon name={c.i} />
              </div>
              <div>
                <div className="text-white font-bold text-sm">{c.t}</div>
                <div className="text-white/60 text-xs">{c.d}</div>
              </div>
            </a>
          ))}

          {/* Mapa placeholder */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-[#0B3D13] to-[#050505] relative">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(31,230,32,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(31,230,32,0.4) 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1FE620] shadow-[0_0_30px_#1FE620] animate-pulse flex items-center justify-center text-black font-bold">📍</div>
            </div>
            <div className="p-4">
              <div className="text-white text-sm font-bold">Atención online</div>
              <div className="text-white/50 text-xs">Coordinamos punto de retiro por WhatsApp.</div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

// ----------------------- Políticas -----------------------

function PoliticasPage() {
  const sections = [
    { t: "Cambios y devoluciones", c: "Aceptamos cambios dentro de los 7 días posteriores a la entrega, siempre que el producto se encuentre sin uso y con su empaque original. Los gastos de envío del cambio corren por cuenta del comprador." },
    { t: "Envíos", c: "Realizamos envíos a domicilio y permitimos retiros coordinados. Los tiempos dependen de la zona, pero generalmente entregamos entre 24 y 72hs. Te avisamos cuando despachamos." },
    { t: "Métodos de pago", c: "Aceptamos transferencia bancaria, pago al recibir, pago online a través de link seguro y coordinación por WhatsApp. Mostramos todas las opciones disponibles en el checkout." },
    { t: "Stock y disponibilidad", c: "El stock se actualiza periódicamente, pero ante alta demanda puede haber demoras. Si un producto no está disponible, te avisamos rápido y te ofrecemos alternativas." },
    { t: "Privacidad", c: "Tus datos personales se usan únicamente para procesar tu pedido y mejorar tu experiencia de compra. No compartimos información con terceros sin tu autorización." },
    { t: "Contacto para consultas", c: "Por cualquier duda, escribinos por WhatsApp o desde nuestra sección de contacto. Estamos para ayudarte rápido y sin vueltas." },
  ];
  return (
    <main data-screen-label="Politicas" className="pt-24 pb-20">
      <section className="py-12 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-[#1FE620] text-[11px] uppercase tracking-[0.3em] font-bold mb-2">Información legal</div>
          <h1 className="font-display text-5xl sm:text-7xl text-white leading-[0.9]">Políticas</h1>
          <p className="text-white/60 mt-3">Las reglas claras desde el principio.</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-4">
        {sections.map((s, i) => (
          <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 hover:border-[#1FE620]/30 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="font-display text-3xl text-white">{String(i + 1).padStart(2, "0")}</div>
              <div className="font-display text-2xl text-white">{s.t}</div>
            </div>
            <p className="text-white/70 leading-relaxed">{s.c}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

// ----------------------- PagoPar Result -----------------------
// PagoPar redirige al cliente a /pagopar/resultado/<hash> después del
// pago. Esta pantalla consulta al backend el estado real (no confía
// en el cliente) y muestra Pagado / Pendiente / Cancelado / Error.

function PagoparResultPage() {
  const { navigate, clearCart } = useShop();
  // El hash lo dejamos en window.__PAPU_PG_HASH__ durante el bootstrap
  // (app.jsx detecta la ruta y lo extrae del pathname).
  const hash = window.__PAPU_PG_HASH__ || "";
  const [loading, setLoading] = useStateMisc(true);
  const [data, setData] = useStateMisc(null);
  const [errorMsg, setErrorMsg] = useStateMisc("");
  const cartClearedRef = React.useRef(false);

  const consultar = React.useCallback(async () => {
    if (!hash) { setErrorMsg("Falta el hash del pago."); setLoading(false); return; }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/pagopar/consultar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash_pedido: hash }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error((json && (json.detail || json.error)) || "consulta_falló");
      }
      setData(json);
      if (json.pagado && !cartClearedRef.current) {
        cartClearedRef.current = true;
        clearCart();
      }
    } catch (err) {
      console.error("[papu] consultar PagoPar:", err);
      setErrorMsg("No pudimos consultar el estado del pago.");
    } finally {
      setLoading(false);
    }
  }, [hash, clearCart]);

  React.useEffect(() => { consultar(); }, [consultar]);

  const last = (typeof window !== "undefined" && window.__PAPU_LAST_ORDER__) || {};

  return (
    <main data-screen-label="PagoparResult" className="pt-32 pb-20 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(ellipse 50% 40% at 50% 30%, rgba(31,230,32,0.18), transparent 60%)" }}></div>
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
        {loading && (
          <>
            <div className="w-20 h-20 rounded-full border-2 border-[#1FE620]/30 border-t-[#1FE620] animate-spin mx-auto mb-6" />
            <div className="text-white/60 text-sm uppercase tracking-[0.3em]">Consultando estado del pago…</div>
          </>
        )}

        {!loading && errorMsg && (
          <>
            <div className="w-24 h-24 rounded-full bg-red-500/15 border border-red-500/40 mx-auto mb-5 flex items-center justify-center">
              <Icon name="x" className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="font-display text-4xl text-white mb-3">Error al consultar</h1>
            <p className="text-white/60 mb-6">{errorMsg}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <GlowButton onClick={consultar}>Reintentar</GlowButton>
              <GlowButton variant="outline" onClick={() => navigate("home")}>Volver al inicio</GlowButton>
            </div>
          </>
        )}

        {!loading && !errorMsg && data && (
          <>
            {data.estado === "paid" && (
              <>
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-[#1FE620]/40 blur-3xl animate-pulse"></div>
                  <div className="relative w-28 h-28 rounded-full bg-white flex items-center justify-center ring-2 ring-[#1FE620] shadow-[0_0_60px_rgba(31,230,32,0.6)] animate-pop">
                    <Icon name="check" className="w-14 h-14 text-black" />
                  </div>
                </div>
                <div className="text-[#1FE620] uppercase tracking-[0.3em] text-[11px] font-bold mb-2">Pago confirmado</div>
                <h1 className="font-display text-5xl sm:text-6xl text-white mb-4 leading-[0.95]">
                  ¡Tu pago se <span className="text-white drop-shadow-[0_0_18px_rgba(31,230,32,0.6)]" style={{ WebkitTextStroke: "1.5px #1FE620" }}>aprobó!</span>
                </h1>
                <p className="text-white/70 text-lg mb-8">
                  Gracias por tu compra en El Papu Store. Te vamos a contactar para coordinar la entrega.
                </p>
              </>
            )}

            {data.estado === "pending" && (
              <>
                <div className="w-24 h-24 rounded-full bg-yellow-500/15 border border-yellow-500/40 mx-auto mb-5 flex items-center justify-center">
                  <Icon name="bolt" className="w-10 h-10 text-yellow-400" />
                </div>
                <div className="text-yellow-400 uppercase tracking-[0.3em] text-[11px] font-bold mb-2">Pago pendiente</div>
                <h1 className="font-display text-4xl text-white mb-3">Estamos esperando la confirmación</h1>
                <p className="text-white/60 mb-6">
                  Si pagaste en efectivo o por transferencia, puede tardar unos minutos.
                  Volvé a consultar en un rato.
                </p>
              </>
            )}

            {data.estado === "cancelled" && (
              <>
                <div className="w-24 h-24 rounded-full bg-red-500/15 border border-red-500/40 mx-auto mb-5 flex items-center justify-center">
                  <Icon name="x" className="w-10 h-10 text-red-400" />
                </div>
                <div className="text-red-400 uppercase tracking-[0.3em] text-[11px] font-bold mb-2">Pago cancelado</div>
                <h1 className="font-display text-4xl text-white mb-3">No se completó el pago</h1>
                <p className="text-white/60 mb-6">El pago fue cancelado. Podés intentar de nuevo desde el carrito.</p>
              </>
            )}

            <div className="bg-[#0a0a0a] border border-[#1FE620]/20 rounded-xl p-5 text-left text-sm space-y-2 mb-6">
              {(data.order_code || last.order_code) && (
                <div className="flex justify-between text-white/60">
                  <span>Pedido</span>
                  <span className="text-white font-mono">{data.order_code || last.order_code}</span>
                </div>
              )}
              {data.numero_pedido && (
                <div className="flex justify-between text-white/60">
                  <span>N° PagoPar</span>
                  <span className="text-white font-mono">{data.numero_pedido}</span>
                </div>
              )}
              {data.forma_pago && (
                <div className="flex justify-between text-white/60">
                  <span>Forma de pago</span>
                  <span className="text-white">{data.forma_pago}</span>
                </div>
              )}
              {data.monto != null && (
                <div className="flex justify-between text-white/60">
                  <span>Monto</span>
                  <span className="text-white">Gs. {Number(data.monto).toLocaleString("es-PY")}</span>
                </div>
              )}
              {data.fecha_pago && (
                <div className="flex justify-between text-white/60">
                  <span>Fecha pago</span>
                  <span className="text-white">{data.fecha_pago}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {data.estado === "pending" && <GlowButton onClick={consultar}>Volver a consultar</GlowButton>}
              {data.estado === "cancelled" && <GlowButton onClick={() => navigate("catalogo")}>Volver al catálogo</GlowButton>}
              <GlowButton variant="outline" onClick={() => navigate("home")}>Volver al inicio</GlowButton>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

Object.assign(window, { CheckoutPage, SuccessPage, SobrePage, FAQPage, ContactoPage, PoliticasPage, PagoparResultPage });
