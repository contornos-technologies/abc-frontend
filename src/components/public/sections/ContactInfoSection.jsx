
// ============================================================================
// SECTION: CONTACT INFO + FORM
// FILE: src/components/public/sections/ContactInfoSection.jsx
// ============================================================================

import { useState } from "react";
import {
  MapPin,
  Mail,
  Phone,
  Facebook,
  Instagram,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function ContactInfoSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/public/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar mensagem.");
      }

      setSuccess(true);

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setError(
        "Não foi possível enviar a mensagem. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="
        relative
        z-20

        -mt-24
        px-4
        pb-24

        sm:px-6
        md:-mt-32

        lg:-mt-44
      "
    >
      <div
        className="
          mx-auto
          grid
          max-w-[1000px]

          grid-cols-1

          overflow-hidden

          rounded-[28px]
          bg-white

          shadow-[0_20px_60px_rgba(0,0,0,0.08)]

          lg:grid-cols-[0.46fr_0.54fr]
          lg:rounded-[36px]
        "
      >
        {/* LEFT SIDE */}
        <div
          className="
            bg-[#F8FAFD]

            px-6
            py-10

            md:px-12
            md:py-12
          "
        >
          <h2
            className="
              text-[28px]
              font-bold
              text-[#021B4E]

              sm:text-[32px]
              lg:text-[34px]
            "
          >
            Entre em contacto
          </h2>

          <p
            className="
              mt-4
              max-w-md

              text-[16px]
              leading-relaxed
              text-[#6B7280]
            "
          >
            Estamos disponíveis para responder às suas dúvidas
            e ajudá-lo a alcançar os seus objectivos académicos.
          </p>

          {/* CONTACT ITEMS */}
          <div className="mt-10 space-y-6 md:space-y-8">
            {/* ADDRESS */}
            <div className="flex items-start gap-4">
              <div
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#1565A8]
                  text-white
                "
              >
                <MapPin size={24} />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#021B4E]">
                  Localização
                </h3>

                <p className="mt-1 text-[#6B7280]">
                  Cidade Alta,{" "}
                  <strong>
                    Escola do Ensino Especial
                  </strong>{" "}
                  (próximo à Mediateca)
                </p>
              </div>
            </div>

            {/* EMAIL */}
            <div className="flex items-start gap-4">
              <div
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#1565A8]
                  text-white
                "
              >
                <Mail size={24} />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#021B4E]">
                  Email
                </h3>

                <p
                  className="
                    mt-1
                    break-words
                    text-[15px]
                    leading-relaxed
                    text-[#6B7280]
                  "
                >
                  abc@gmail.com
                </p>
              </div>
            </div>

            {/* PHONE */}
            <div className="flex items-start gap-4">
              <div
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#1565A8]
                  text-white
                "
              >
                <Phone size={24} />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#021B4E]">
                  Telefone
                </h3>

                <p className="mt-1 text-[#6B7280]">
                  +244 923 111 222
                  <br />
                  +244 923 111 333
                </p>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="my-10 h-[1px] w-full bg-[#E5E7EB]" />

          {/* SOCIAL */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-[#021B4E]">
              Siga-nos nas redes sociais
            </h3>

            <div className="mt-6 flex items-center justify-center gap-4">
              {[Facebook, Instagram].map((Icon, index) => (
                <button
                  key={index}
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-[#1565A8]
                    text-white
                    transition-all
                    duration-300
                    hover:scale-105
                  "
                >
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          className="
            px-6
            py-10

            md:px-12
            md:py-12
          "
        >
          <h2
            className="
              text-[28px]
              font-bold
              text-[#021B4E]

              sm:text-[32px]
              lg:text-[34px]
            "
          >
            Envie-nos uma mensagem
          </h2>

          <form
            className="mt-10"
            onSubmit={handleSubmit}
          >
            {/* INPUT GRID */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* NAME */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#021B4E]">
                  Nome
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="O seu nome"
                  required
                  className="
                    h-14
                    w-full
                    rounded-2xl
                    border
                    border-transparent
                    bg-[#F5F8FC]
                    px-5
                    outline-none
                    transition-all
                    duration-300
                    focus:border-[#1565A8]
                    focus:bg-white
                  "
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#021B4E]">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="O seu email"
                  required
                  className="
                    h-14
                    w-full
                    rounded-2xl
                    border
                    border-transparent
                    bg-[#F5F8FC]
                    px-5
                    outline-none
                    transition-all
                    duration-300
                    focus:border-[#1565A8]
                    focus:bg-white
                  "
                />
              </div>
            </div>

            {/* SUBJECT */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[#021B4E]">
                Assunto
              </label>

              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Assunto da mensagem"
                required
                className="
                  h-14
                  w-full
                  rounded-2xl
                  border
                  border-transparent
                  bg-[#F5F8FC]
                  px-5
                  outline-none
                  transition-all
                  duration-300
                  focus:border-[#1565A8]
                  focus:bg-white
                "
              />
            </div>

            {/* MESSAGE */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[#021B4E]">
                Mensagem
              </label>

              <textarea
                rows="6"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Escreva a sua mensagem aqui..."
                required
                className="
                  w-full
                  rounded-2xl
                  border
                  border-transparent
                  bg-[#F5F8FC]
                  px-5
                  py-4
                  outline-none
                  transition-all
                  duration-300
                  focus:border-[#1565A8]
                  focus:bg-white
                "
              ></textarea>
            </div>

            {/* FEEDBACK */}
            {success && (
              <p className="mt-4 text-sm font-medium text-green-600">
                Mensagem enviada com sucesso.
                Entraremos em contacto em breve.
              </p>
            )}

            {error && (
              <p className="mt-4 text-sm font-medium text-red-500">
                {error}
              </p>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="
                mt-8
                flex
                h-14
                w-full
                items-center
                justify-center
                rounded-2xl
                bg-[#F69220]
                text-lg
                font-semibold
                text-white
                transition-all
                duration-300
                hover:opacity-90
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading ? "A enviar..." : "Enviar mensagem"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

