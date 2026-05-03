export default function PaymentStatusBadge({ status }) {
  const config = {
    PAID:      { label: 'Pago',              bg: 'bg-green-100',  text: 'text-green-800'  },
    PARTIAL:   { label: 'Parcial',           bg: 'bg-blue-100',   text: 'text-blue-800'   },
    PENDING:   { label: 'Pendente',          bg: 'bg-yellow-100', text: 'text-yellow-800' },
    CANCELLED: { label: 'Cancelado',         bg: 'bg-red-100',    text: 'text-red-800'    },
  };

  const { label, bg, text } = config[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-800' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}