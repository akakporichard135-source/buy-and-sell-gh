interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  textarea?: boolean;
}

export function FormField({ label, name, type = "text", required, placeholder, options, textarea }: FormFieldProps) {
  const inputClass = "mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3.5 text-base font-semibold text-ink outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15";

  return (
    <label className="block text-sm font-black text-ink">
      {label}
      {options ? (
        <select name={name} required={required} className={inputClass} defaultValue="">
          <option value="" disabled>
            Select option
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : textarea ? (
        <textarea name={name} required={required} placeholder={placeholder} className={`${inputClass} min-h-32 resize-y`} />
      ) : (
        <input name={name} type={type} required={required} placeholder={placeholder} className={inputClass} />
      )}
    </label>
  );
}
