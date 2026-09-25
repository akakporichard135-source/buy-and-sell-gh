interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  options?: string[];
  textarea?: boolean;
  maxLength?: number;
}

export function FormField({ label, name, type = "text", required, placeholder, defaultValue, options, textarea, maxLength }: FormFieldProps) {
  const inputClass = "mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3.5 text-base font-semibold text-ink outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15";
  const inputType = type === "text" && name.toLowerCase().includes("phone") ? "tel" : type;
  const autoComplete = name.toLowerCase().includes("phone") ? "tel" : name.toLowerCase().includes("email") ? "email" : name === "name" ? "name" : undefined;

  return (
    <label className="block text-sm font-black text-ink">
      {label}
      {options ? (
        <select name={name} required={required} className={inputClass} defaultValue={defaultValue ?? ""}>
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
        <textarea name={name} required={required} placeholder={placeholder} defaultValue={defaultValue} maxLength={maxLength} className={`${inputClass} min-h-32 resize-y`} />
      ) : (
        <input name={name} type={inputType} autoComplete={autoComplete} required={required} placeholder={placeholder} defaultValue={defaultValue} maxLength={maxLength} className={inputClass} />
      )}
    </label>
  );
}
