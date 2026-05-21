// Misc pages: Checkout, Success, About, FAQ, Contacto, Políticas

const { useState: useStateMisc } = React;

// ----------------------- Checkout -----------------------

function CheckoutPage() {
  const { cart, cartTotal, navigate, clearCart } = useShop();
  const [form, setForm] = useStateMisc({
    nombre: "", apellido: "", telefono: "", email: "",
    ciudad: "", direccion: "", referencia: "",
    entrega: "envio", pago: "transferencia",
  });
  const [step, setStep] = useStateMisc(1);

  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const envio = form.entrega === "envio" ? 3500 : 0;
  const total = cartTotal + envio;

  const submit = (e) => {
    e?.preventDefault();
    navigate("success");
    setTimeout(() => clearCart(), 1500);
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
                <Input label="Teléfono" value={form.telefono} onChange={v => handle("telefono", v)} placeholder="+54 9 ..." />
                <Input label="Email" value={form.email} onChange={v => handle("email", v)} type="email" />
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

            <Section title="3 · Método de pago">
              <div className="grid sm:grid-cols-2 gap-2">
                {[
                  { id: "transferencia", t: "Transferencia bancaria", d: "Te enviamos los datos", icon: "bolt" },
                  { id: "recibir", t: "Pago al recibir", d: "Efectivo en el momento", icon: "tag" },
                  { id: "online", t: "Pago online", d: "Link seguro de pago", icon: "shield" },
                  { id: "wa", t: "Coordinar por WhatsApp", d: "Hablamos los detalles", icon: "whatsapp" },
                ].map(o => (
                  <button key={o.id} type="button" onClick={() => handle("pago", o.id)}
                    className={`text-left p-4 rounded-md border transition flex items-center gap-3 ${form.pago === o.id ? "border-[#1FE620] bg-[#1FE620]/5 shadow-[0_0_12px_rgba(31,230,32,0.15)]" : "border-white/10 bg-[#0d0d0d] hover:border-white/20"}`}>
                    <div className={`w-10 h-10 rounded-md flex items-center justify-center ${form.pago === o.id ? "bg-[#1FE620] text-black" : "bg-white/5 text-white/70"}`}>
                      <Icon name={o.icon} />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{o.t}</div>
                      <div className="text-white/50 text-xs">{o.d}</div>
                    </div>
                  </button>
                ))}
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
              <GlowButton type="submit" className="w-full mt-5">
                Confirmar pedido <Icon name="check" className="w-4 h-4" />
              </GlowButton>
              <div className="flex items-center gap-2 text-xs text-white/40 mt-3">
                <Icon name="shield" className="w-3.5 h-3.5" /> Compra segura · Datos protegidos
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
              <div className="text-white font-display text-2xl">#PAPU-{Math.floor(10000 + Math.random() * 90000)}</div>
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

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[["1.2k+","Clientes"],["12","Categorías"],["4.8★","Rating"],["24/7","WhatsApp"]].map(([v,l]) => (
            <div key={l} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 text-center">
              <div className="font-display text-3xl sm:text-4xl text-white">{v}</div>
              <div className="text-white/50 text-xs uppercase tracking-wider mt-1">{l}</div>
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

Object.assign(window, { CheckoutPage, SuccessPage, SobrePage, FAQPage, ContactoPage, PoliticasPage });
