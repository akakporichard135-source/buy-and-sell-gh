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
  const inputClass = "mt-1.5 w-full rounded-xl border border-[#d2d2d7] bg-[#fbfbfd] px-4 py-3 text-sm font-normal text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition focus:border-[#0071e3] focus:bg-white focus:ring-3 focus:ring-[#0071e3]/15";
  const inputType = type === "text" && name.toLowerCase().includes("phone") ? "tel" : type;
  const autoComplete = name.toLowerCase().includes("phone") ? "tel" : name.toLowerCase().includes("email") ? "email" : name === "name" ? "name" : undefined;

  return (
    <label className="block text-xs sm:text-sm font-medium text-[#1d1d1f] tracking-tight">
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
