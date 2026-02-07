interface FormFieldProps {
  label: string;
  name: string;
  value: string | undefined;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function FormField({ 
  label, 
  name, 
  value, 
  onChange, 
  type = 'text', 
  placeholder,
  disabled = false 
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        style={{ color: '#000000' }}
      />
    </div>
  );
}