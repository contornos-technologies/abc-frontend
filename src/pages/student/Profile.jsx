import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import PersonalInfoCard from '../../components/student/PersonalInfoCard';
import SecurityCard from '../../components/student/SecurityCard';
import EnrollmentCard from '../../components/student/EnrollmentCard';
import PaymentCard from '../../components/student/PaymentCard';
import { getProfile, getTargets, getPayments } from '../../services/student.service';
import { AuthContext } from '../../context/AuthContext';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('perfil');
  const { setProfile } = useContext(AuthContext);

  const [student,  setStudent]  = useState(null);
  const [targets,  setTargets]  = useState([]);
  const [payments, setPayments] = useState(null);

  const [loadingStudent,  setLoadingStudent]  = useState(true);
  const [loadingTargets,  setLoadingTargets]  = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [errorStudent,    setErrorStudent]    = useState('');
  const [errorTargets,    setErrorTargets]    = useState('');
  const [errorPayments,   setErrorPayments]   = useState('');

  // Refs para cada card
  const refs = {
    perfil:     useRef(null),
    inscricao:  useRef(null),
    pagamentos: useRef(null),
    seguranca:  useRef(null),
  };

  const fetchStudent = useCallback(async () => {
    setLoadingStudent(true); setErrorStudent('');
    try {
      const data = await getProfile();
      setStudent(data);
      setProfile && setProfile(data);
    } catch (err) {
      setErrorStudent(err.message || 'Erro ao carregar perfil');
    } finally { setLoadingStudent(false); }
  }, [setProfile]);

  const fetchTargets = useCallback(async () => {
    setLoadingTargets(true); setErrorTargets('');
    try {
      const data = await getTargets();
      setTargets(data);
    } catch (err) {
      setErrorTargets(err.message || 'Erro ao carregar inscrição');
    } finally { setLoadingTargets(false); }
  }, []);

  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true); setErrorPayments('');
    try {
      const data = await getPayments();
      setPayments(data);
    } catch (err) {
      setErrorPayments(err.message || 'Erro ao carregar pagamentos');
    } finally { setLoadingPayments(false); }
  }, []);

  useEffect(() => {
    fetchStudent();
    fetchTargets();
    fetchPayments();
  }, [fetchStudent, fetchTargets, fetchPayments]);

  // Quando activeTab muda, faz scroll para o card correspondente
  useEffect(() => {
    const ref = refs[activeTab];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  return (
    <StudentLayout activeTab={activeTab} onTabChange={setActiveTab}>

      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-[#0A3956] font-bold text-2xl mb-1">Meu Perfil</h1>
        <p className="text-[#6B7280] text-sm">Gerencie as suas informações pessoais</p>
        <div className="h-px bg-[#E5E7EB] mt-4" />
      </div>

      {/* Todos os cards visíveis na mesma página */}
      <div className="space-y-8">

        {/* PERFIL */}
        <div ref={refs.perfil}>
          {loadingStudent ? (
            <PersonalInfoCardSkeleton />
          ) : errorStudent ? (
            <ErrorBanner message={errorStudent} onRetry={fetchStudent} />
          ) : (
           <PersonalInfoCard student={student} onUpdate={fetchStudent} />
          )}
        </div>

        {/* INSCRIÇÃO */}
        <div ref={refs.inscricao}>
          <EnrollmentCard
            targets={targets}
            loading={loadingTargets}
            error={errorTargets}
            onRefresh={fetchTargets}
          />
        </div>

        {/* PAGAMENTOS */}
        <div ref={refs.pagamentos}>
          <PaymentCard
            payments={payments}
            loading={loadingPayments}
            error={errorPayments}
            onRefresh={fetchPayments}
          />
        </div>

        {/* SEGURANÇA */}
        <div ref={refs.seguranca}>
          <SecurityCard />
        </div>

      </div>

    </StudentLayout>
  );
}

/* ─── Helpers ─── */

function PersonalInfoCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border-t-[3px] border-t-[#F69220] p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-5 w-48 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-[#F8FAFC] p-4 rounded-lg">
            <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-36 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border-t-[3px] border-t-[#DC3545] p-6 flex items-center justify-between">
      <p className="text-[#DC3545] text-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-[#F69220] font-semibold hover:underline ml-4">
          Tentar novamente
        </button>
      )}
    </div>
  );
}