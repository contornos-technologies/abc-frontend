export default function ScholarshipBadge({ type }) {
  const config = {
    NONE:        { label: 'Sem Bolsa',    bg: 'bg-gray-100',   text: 'text-gray-800'  },
    PARTIAL_50:  { label: 'Bolsa 50%',   bg: 'bg-blue-100',   text: 'text-blue-800'  },
    PARTIAL_75:  { label: 'Bolsa 75%',   bg: 'bg-purple-100', text: 'text-purple-800' },
    FULL:        { label: 'Bolsa Total', bg: 'bg-green-100',  text: 'text-green-800' },
  };

  const { label, bg, text } = config[type] || { label: type, bg: 'bg-gray-100', text: 'text-gray-800' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}