interface FormFieldProps {
  label: string;
  name: string;
  value: string | undefined;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

export function FormField({ label, name, value, onChange, type = 'text', placeholder }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
    </div>
  );
}
