// ─────────────────────────────────────────────
// EnrollmentSuccess.jsx — Página de confirmação
// ─────────────────────────────────────────────

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  MapPin,
  Clock,
  BookOpen,
  Wallet,
  GraduationCap,
  User,
} from 'lucide-react';

const formatKz = (value) =>
  Number(value).toLocaleString('pt-PT') + ' Kz';

function SummaryRow({ icon: Icon, label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 text-[#6C757D]">
        <Icon className="w-4 h-4 text-[#F69220]" />
        <span className="text-sm">{label}</span>
      </div>
      <span
        className={`text-sm font-semibold ${
          highlight ? 'text-[#F69220] text-base' : 'text-[#0A3956]'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function InstrucoesPresenciais() {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <p className="text-[#0A3956] font-semibold text-sm mb-3">
        Para concluir a sua inscrição, dirija-se ao seguinte local para efectuar
        o pagamento:
      </p>
      <div className="flex items-start gap-2 mb-2">
        <MapPin className="w-4 h-4 text-[#F69220] mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-[#1F2937] text-sm font-semibold">
            Escola do Ensino Especial Huambo
          </p>
          <p className="text-[#6C757D] text-xs">Junto à Mediateca</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-[#F69220] flex-shrink-0" />
        <p className="text-[#6C757D] text-xs">
          Segunda a Sexta, das 08h às 17h
        </p>
      </div>
      <div className="bg-white border border-orange-200 rounded-md px-3 py-2">
        <p className="text-[#6C757D] text-xs">
          Apresente o seu BI no acto do pagamento.
        </p>
      </div>
    </div>
  )
}

export default function EnrollmentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const target = location.state?.target;

  useEffect(() => {
    if (!target) {
      navigate('/student/profile', { replace: true });
   }
  }, [target, navigate]);

 if (!target) return null;

  const isFull = target.scholarshipType === 'FULL';

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[500px]">

        <div className="bg-white rounded-xl shadow-md border-t-[4px] border-t-[#28A745] p-8 mb-4">

          {/* Ícone + Título */}
          <div className="text-center mb-6">
            <CheckCircle className="w-14 h-14 text-[#28A745] mx-auto mb-4" />
            <h1 className="text-[#0A3956] text-2xl font-bold mb-1">
              Inscrição criada com sucesso!
            </h1>
            <p className="text-[#6C757D] text-sm">
              Inscrição para o ano lectivo{' '}
              <strong className="text-[#0A3956]">{target.year}</strong>
            </p>
          </div>

          {/* Resumo */}
          <div className="mb-6">
            <p className="text-[#0A3956] font-semibold text-sm mb-2">
              Resumo da inscrição
            </p>

            <SummaryRow
              icon={BookOpen}
              label="Disciplinas seleccionadas"
              value={`${target.subjectCount ?? target.subjects?.length ?? 0} disciplina${
                (target.subjectCount ?? target.subjects?.length ?? 0) !== 1 ? 's' : ''
              }`}
            />

            {target.applications?.length > 0 && (
              <SummaryRow
                icon={GraduationCap}
                label="Candidaturas"
                value={`${target.applications.length} adicionada${
                  target.applications.length !== 1 ? 's' : ''
                }`}
              />
            )}

            <SummaryRow
              icon={Wallet}
              label="Valor a pagar"
              value={isFull ? '0 Kz — Bolsa Total' : formatKz(target.finalAmount ?? target.totalAmount)}
              highlight={!isFull}
            />

            {target.scholarshipType && target.scholarshipType !== 'NONE' && (
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2 text-[#6C757D]">
                  <GraduationCap className="w-4 h-4 text-[#28A745]" />
                  <span className="text-sm">Bolsa de estudo</span>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isFull
                      ? 'bg-green-100 text-[#28A745]'
                      : 'bg-blue-50 text-[#185FA5]'
                  }`}
                >
                  {isFull
                    ? 'Bolsa Total'
                    : target.scholarshipType === 'PARTIAL_75'
                    ? 'Bolsa 75%'
                    : 'Bolsa 50%'}
                </span>
              </div>
            )}
          </div>

          {/* Estado do pagamento */}
          {isFull ? (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <GraduationCap className="w-5 h-5 text-[#28A745] mt-0.5 flex-shrink-0" />
              <div>
                <span className="inline-block bg-[#28A745] text-white px-3 py-1 rounded-md text-sm font-bold mb-1">
                  Bolsa Total Atribuída
                </span>
                <p className="text-[#6C757D] text-sm">
                  Sem custo — bolsa a 100%
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <InstrucoesPresenciais />
            </div>
          )}

          {/* Botão */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/student/profile')}
              className="w-full bg-[#F69220] text-white py-3 rounded-lg font-semibold hover:bg-[#e58419] transition-colors flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              Ir para o Perfil
            </button>
          </div>

        </div>

        {/* Nota informativa */}
        <p className="text-center text-[#6C757D] text-xs px-4">
          Podes gerir a tua inscrição, adicionar candidaturas e acompanhar o
          pagamento a qualquer momento no teu perfil.
        </p>

      </div>
    </div>
  );
}