"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ruler,
  Paintbrush,
  Package,
  Factory,
  CheckCircle,
  Phone,
  Send,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  X,
  Plus,
  Minus,
  Square,
  Layers,
  Palette,
  Hash,
  FileText,
  User,
  Building2,
  Mail,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTACT_INFO } from "@/lib/constants";

const WHATSAPP_NUMBER = "918570059569";

const PLY_OPTIONS = [
  { value: "3-ply", label: "3 Ply (Light)", desc: "For lightweight items", icon: "📄" },
  { value: "5-ply", label: "5 Ply (Medium)", desc: "For standard shipping", icon: "📦" },
  { value: "7-ply", label: "7 Ply (Heavy)", desc: "For heavy/industrial", icon: "💪" },
  { value: "white-3-ply", label: "3 Ply White", desc: "Premium white finish", icon: "⬜" },
  { value: "not-sure", label: "Not Sure", desc: "Need expert advice", icon: "🤔" },
];

const PRINTING_OPTIONS = [
  { value: "none", label: "No Printing", icon: "🚫" },
  { value: "1-color", label: "1 Color Print", icon: "⚫" },
  { value: "2-color", label: "2 Color Print", icon: "🎨" },
  { value: "full-cmyk", label: "Full Color CMYK", icon: "🌈" },
  { value: "not-sure", label: "Not Sure Yet", icon: "🤷" },
];

const BOX_STYLES = [
  { value: "rsc", label: "Regular Slotted (RSC)", icon: "📐" },
  { value: "flap", label: "Flap Box", icon: "📋" },
  { value: "die-cut", label: "Die-Cut / Custom Shape", icon: "✂️" },
  { value: "mailer", label: "Mailer Box", icon: "✉️" },
  { value: "not-sure", label: "Not Sure", icon: "🤔" },
];

const QUANTITY_RANGES = [
  { value: "100-500", label: "100 - 500" },
  { value: "500-1000", label: "500 - 1,000" },
  { value: "1000-5000", label: "1,000 - 5,000" },
  { value: "5000-10000", label: "5,000 - 10,000" },
  { value: "10000+", label: "10,000+" },
];

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  length: string;
  width: string;
  height: string;
  ply: string;
  printing: string;
  boxStyle: string;
  quantity: string;
  notes: string;
}

type FormStep = "contact" | "dimensions" | "options" | "review";

const INITIAL_FORM: FormData = {
  name: "",
  company: "",
  email: "",
  phone: "",
  length: "",
  width: "",
  height: "",
  ply: "",
  printing: "",
  boxStyle: "",
  quantity: "",
  notes: "",
};

function buildWhatsAppMessage(data: FormData): string {
  const lines = [
    "🟠 *Boxzz — Custom Packaging Inquiry*",
    "",
    "━━━ *Contact Info* ━━━",
    `👤 Name: ${data.name || "—"}`,
    `🏢 Company: ${data.company || "—"}`,
    `📧 Email: ${data.email || "—"}`,
    `📱 Phone: ${data.phone || "—"}`,
    "",
    "━━━ *Dimensions* ━━━",
    `📏 L: ${data.length || "—"} in`,
    `📏 W: ${data.width || "—"} in`,
    `📏 H: ${data.height || "—"} in`,
    "",
    "━━━ *Customization* ━━━",
    `📦 Ply: ${PLY_OPTIONS.find(o => o.value === data.ply)?.label || "—"}`,
    `🎨 Printing: ${PRINTING_OPTIONS.find(o => o.value === data.printing)?.label || "—"}`,
    `📋 Style: ${BOX_STYLES.find(o => o.value === data.boxStyle)?.label || "—"}`,
    `🔢 Quantity: ${data.quantity || "—"}`,
    "",
  ];

  if (data.notes.trim()) {
    lines.push("━━━ *Notes* ━━━");
    lines.push(`💬 ${data.notes.trim()}`);
    lines.push("");
  }

  lines.push("✨ *Please share a quote for the above requirements.*");
  lines.push("📍 From Boxzz Website");

  return lines.join("\n");
}

function openWhatsApp(message: string) {
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
  window.open(url, "_blank");
}

interface StepIndicatorProps {
  steps: { id: FormStep; label: string }[];
  currentStep: FormStep;
}

function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const currentIdx = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
      {steps.map((s, idx) => {
        const isActive = s.id === currentStep;
        const isComplete = idx < currentIdx;

        return (
          <div key={s.id} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  isActive && "bg-primary text-white shadow-lg shadow-primary/25",
                  isComplete && "bg-success text-white",
                  !isActive && !isComplete && "bg-zinc-100 text-zinc-400"
                )}
              >
                {isComplete ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  idx + 1
                )}
              </motion.div>
              <span className={cn(
                "text-xs sm:text-sm font-medium hidden sm:block",
                isActive ? "text-zinc-900" : "text-zinc-400"
              )}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn(
                "w-8 sm:w-12 h-0.5 rounded-full transition-colors",
                isComplete ? "bg-success" : "bg-zinc-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FormCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "bg-white rounded-2xl border border-zinc-100 p-5 sm:p-7 shadow-sm",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export default function CustomPackagingPage() {
  const [step, setStep] = useState<FormStep>("contact");
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }, [errors]);

  const clearError = (field: keyof FormData) => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validateContact = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    else if (!/^\+?[\d\s-]{10,}$/.test(form.phone.replace(/\s/g, "")))
      errs.phone = "Enter a valid phone number";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateDimensions = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.length.trim()) errs.length = "Required";
    if (!form.width.trim()) errs.width = "Required";
    if (!form.height.trim()) errs.height = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateOptions = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.ply) errs.ply = "Select a material type";
    if (!form.printing) errs.printing = "Select printing option";
    if (!form.boxStyle) errs.boxStyle = "Select box style";
    if (!form.quantity) errs.quantity = "Select quantity range";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === "contact" && validateContact()) setStep("dimensions");
    else if (step === "dimensions" && validateDimensions()) setStep("options");
    else if (step === "options" && validateOptions()) setStep("review");
  };

  const handleBack = () => {
    if (step === "dimensions") setStep("contact");
    else if (step === "options") setStep("dimensions");
    else if (step === "review") setStep("options");
  };

  const handleSubmit = () => {
    const message = buildWhatsAppMessage(form);
    openWhatsApp(message);
  };

  const steps = [
    { id: "contact" as FormStep, label: "Contact" },
    { id: "dimensions" as FormStep, label: "Dimensions" },
    { id: "options" as FormStep, label: "Options" },
    { id: "review" as FormStep, label: "Review" },
  ];

  const inputClass = (field: keyof FormData) => cn(
    "w-full h-11 px-3.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all bg-white",
    errors[field]
      ? "border-error focus:ring-error/30 focus:border-error"
      : "border-zinc-200 focus:ring-primary/30 focus:border-primary"
  );

  const labelClass = "block text-xs font-medium text-zinc-600 mb-1.5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-primary-50/20 to-white">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 pt-6 sm:pt-8 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900">Custom Packaging</h1>
            <p className="text-xs sm:text-sm text-zinc-500">Get a free quote — we'll respond within 24 hrs</p>
          </div>
        </div>

        {/* Progress Steps */}
        <StepIndicator steps={steps} currentStep={step} />
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <AnimatePresence mode="wait">
          {/* ─── Step 1: Contact ─── */}
          {step === "contact" && (
            <FormCard key="contact">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-zinc-900">Your Details</h2>
              </div>

              <div className="space-y-3.5">
                {/* Name */}
                <div>
                  <label className={labelClass}>Full Name <span className="text-error">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => { updateField("name", e.target.value); clearError("name"); }}
                      className={cn(inputClass("name"), "pl-10")}
                      placeholder="Enter your name"
                    />
                  </div>
                  {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
                </div>

                {/* Company */}
                <div>
                  <label className={labelClass}>Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={form.company}
                      onChange={e => updateField("company", e.target.value)}
                      className={cn(inputClass("company"), "pl-10")}
                      placeholder="Optional — your company name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className={labelClass}>Email <span className="text-error">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => { updateField("email", e.target.value); clearError("email"); }}
                      className={cn(inputClass("email"), "pl-10")}
                      placeholder="email@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className={labelClass}>Phone Number <span className="text-error">*</span></label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => { updateField("phone", e.target.value); clearError("phone"); }}
                      className={cn(inputClass("phone"), "pl-10")}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-error mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25 text-sm"
                >
                  Next — Dimensions
                  <Ruler className="w-4 h-4" />
                </motion.button>
              </div>
            </FormCard>
          )}

          {/* ─── Step 2: Dimensions ─── */}
          {step === "dimensions" && (
            <FormCard key="dimensions">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Ruler className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-zinc-900">Box Dimensions</h2>
              </div>

              <div className="bg-primary-50 border border-primary-100 rounded-xl p-3.5 mb-5">
                <p className="text-xs text-zinc-600">
                  <span className="font-medium text-primary">Tip:</span> Don't have exact dimensions? Give us your best estimate. 
                  We'll advise the perfect size for your product.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Length (in) <span className="text-error">*</span></label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={form.length}
                    onChange={e => { updateField("length", e.target.value); clearError("length"); }}
                    className={inputClass("length")}
                    placeholder="L"
                  />
                  {errors.length && <p className="text-xs text-error mt-1">{errors.length}</p>}
                </div>
                <div>
                  <label className={labelClass}>Width (in) <span className="text-error">*</span></label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={form.width}
                    onChange={e => { updateField("width", e.target.value); clearError("width"); }}
                    className={inputClass("width")}
                    placeholder="W"
                  />
                  {errors.width && <p className="text-xs text-error mt-1">{errors.width}</p>}
                </div>
                <div>
                  <label className={labelClass}>Height (in) <span className="text-error">*</span></label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={form.height}
                    onChange={e => { updateField("height", e.target.value); clearError("height"); }}
                    className={inputClass("height")}
                    placeholder="H"
                  />
                  {errors.height && <p className="text-xs text-error mt-1">{errors.height}</p>}
                </div>
              </div>

              {/* Visual dimension preview */}
              <div className="mt-5 flex justify-center">
                <div className="relative w-40 h-36 sm:w-48 sm:h-40">
                  {/* 3D box preview */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 200 180" className="w-full h-full">
                      {/* Top face */}
                      <path
                        d="M100 20 L180 45 L100 70 L20 45 Z"
                        fill="#f97316"
                        fillOpacity="0.15"
                        stroke="#f97316"
                        strokeWidth="1.5"
                        strokeOpacity="0.4"
                      />
                      {/* Front face */}
                      <path
                        d="M20 45 L100 70 L100 155 L20 130 Z"
                        fill="#f97316"
                        fillOpacity="0.08"
                        stroke="#f97316"
                        strokeWidth="1.5"
                        strokeOpacity="0.3"
                      />
                      {/* Right face */}
                      <path
                        d="M100 70 L180 45 L180 130 L100 155 Z"
                        fill="#f97316"
                        fillOpacity="0.05"
                        stroke="#f97316"
                        strokeWidth="1.5"
                        strokeOpacity="0.3"
                      />
                      {/* Dimension labels */}
                      {form.length && (
                        <text x="55" y="175" fontSize="11" fill="#71717a" textAnchor="middle">
                          <tspan fontStyle="italic">L: {form.length}"</tspan>
                        </text>
                      )}
                      {form.width && (
                        <text x="120" y="118" fontSize="11" fill="#71717a" textAnchor="middle" transform="rotate(30, 120, 118)">
                          <tspan fontStyle="italic">W: {form.width}"</tspan>
                        </text>
                      )}
                      {form.height && (
                        <text x="12" y="90" fontSize="11" fill="#71717a" textAnchor="middle" transform="rotate(-90, 12, 90)">
                          <tspan fontStyle="italic">H: {form.height}"</tspan>
                        </text>
                      )}
                      {!form.length && !form.width && !form.height && (
                        <text x="100" y="105" fontSize="12" fill="#a1a1aa" textAnchor="middle">
                          Enter dimensions
                        </text>
                      )}
                    </svg>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25 text-sm"
                >
                  Next — Options
                  <Layers className="w-4 h-4" />
                </motion.button>
              </div>
            </FormCard>
          )}

          {/* ─── Step 3: Options ─── */}
          {step === "options" && (
            <FormCard key="options">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-zinc-900">Customization Options</h2>
              </div>

              <div className="space-y-6">
                {/* Material / Ply */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 mb-3">
                    <Square className="w-3.5 h-3.5" />
                    Material Type <span className="text-error">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PLY_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { updateField("ply", opt.value); clearError("ply"); }}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center",
                          form.ply === opt.value
                            ? "border-primary bg-primary-50"
                            : "border-zinc-200 hover:border-zinc-300 bg-white"
                        )}
                      >
                        <span className="text-lg">{opt.icon}</span>
                        <span className="text-xs font-medium text-zinc-700 leading-tight">{opt.label}</span>
                        <span className="text-[10px] text-zinc-400 leading-tight">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                  {errors.ply && <p className="text-xs text-error mt-1.5">{errors.ply}</p>}
                </div>

                {/* Printing */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 mb-3">
                    <Palette className="w-3.5 h-3.5" />
                    Printing <span className="text-error">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRINTING_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { updateField("printing", opt.value); clearError("printing"); }}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-xl border-2 transition-all",
                          form.printing === opt.value
                            ? "border-primary bg-primary-50"
                            : "border-zinc-200 hover:border-zinc-300 bg-white"
                        )}
                      >
                        <span className="text-base">{opt.icon}</span>
                        <span className="text-xs font-medium text-zinc-700">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.printing && <p className="text-xs text-error mt-1.5">{errors.printing}</p>}
                </div>

                {/* Box Style */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 mb-3">
                    <Package className="w-3.5 h-3.5" />
                    Box Style <span className="text-error">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {BOX_STYLES.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { updateField("boxStyle", opt.value); clearError("boxStyle"); }}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-xl border-2 transition-all",
                          form.boxStyle === opt.value
                            ? "border-primary bg-primary-50"
                            : "border-zinc-200 hover:border-zinc-300 bg-white"
                        )}
                      >
                        <span className="text-base">{opt.icon}</span>
                        <span className="text-xs font-medium text-zinc-700">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.boxStyle && <p className="text-xs text-error mt-1.5">{errors.boxStyle}</p>}
                </div>

                {/* Quantity */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 mb-3">
                    <Hash className="w-3.5 h-3.5" />
                    Estimated Quantity <span className="text-error">*</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {QUANTITY_RANGES.map(q => (
                      <button
                        key={q.value}
                        type="button"
                        onClick={() => { updateField("quantity", q.value); clearError("quantity"); }}
                        className={cn(
                          "px-3 py-2.5 rounded-xl border-2 text-xs font-medium transition-all text-center",
                          form.quantity === q.value
                            ? "border-primary bg-primary-50 text-primary"
                            : "border-zinc-200 hover:border-zinc-300 text-zinc-600 bg-white"
                        )}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                  {errors.quantity && <p className="text-xs text-error mt-1.5">{errors.quantity}</p>}
                </div>

                {/* Notes */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 mb-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Additional Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={e => updateField("notes", e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none bg-white"
                    placeholder="Any special requirements, delivery timeline, etc..."
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25 text-sm"
                >
                  Review Order
                  <CheckCircle className="w-4 h-4" />
                </motion.button>
              </div>
            </FormCard>
          )}

          {/* ─── Step 4: Review & Submit ─── */}
          {step === "review" && (
            <FormCard key="review">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-success" />
                </div>
                <h2 className="text-base font-semibold text-zinc-900">Review Your Request</h2>
              </div>

              <div className="space-y-3">
                {/* Contact Summary */}
                <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Contact Info</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-zinc-700"><span className="text-zinc-400">Name:</span> {form.name}</p>
                    {form.company && <p className="text-zinc-700"><span className="text-zinc-400">Company:</span> {form.company}</p>}
                    <p className="text-zinc-700"><span className="text-zinc-400">Email:</span> {form.email}</p>
                    <p className="text-zinc-700"><span className="text-zinc-400">Phone:</span> {form.phone}</p>
                  </div>
                </div>

                {/* Dimensions Summary */}
                <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Dimensions</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="px-2.5 py-1 bg-white rounded-lg border border-zinc-200 font-medium text-zinc-700">
                      L: {form.length}"
                    </span>
                    <span className="text-zinc-300">×</span>
                    <span className="px-2.5 py-1 bg-white rounded-lg border border-zinc-200 font-medium text-zinc-700">
                      W: {form.width}"
                    </span>
                    <span className="text-zinc-300">×</span>
                    <span className="px-2.5 py-1 bg-white rounded-lg border border-zinc-200 font-medium text-zinc-700">
                      H: {form.height}"
                    </span>
                  </div>
                </div>

                {/* Options Summary */}
                <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Customization</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{PLY_OPTIONS.find(o => o.value === form.ply)?.icon}</span>
                      <span className="text-zinc-700">{PLY_OPTIONS.find(o => o.value === form.ply)?.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{PRINTING_OPTIONS.find(o => o.value === form.printing)?.icon}</span>
                      <span className="text-zinc-700">{PRINTING_OPTIONS.find(o => o.value === form.printing)?.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{BOX_STYLES.find(o => o.value === form.boxStyle)?.icon}</span>
                      <span className="text-zinc-700">{BOX_STYLES.find(o => o.value === form.boxStyle)?.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-primary" />
                      <span className="text-zinc-700">Qty: {form.quantity}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {form.notes && (
                  <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm text-zinc-700">{form.notes}</p>
                  </div>
                )}

                {/* WhatsApp notice */}
                <div className="bg-green-50 border border-green-100 rounded-xl p-3.5 flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-green-800 leading-relaxed">
                    Your request will be sent directly to our team via WhatsApp. 
                    We'll review it and respond within 24 hours with a detailed quotation.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 border border-zinc-200 text-zinc-700 font-medium rounded-xl hover:bg-zinc-50 transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Edit Details
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/25 text-sm"
                >
                  <Send className="w-4 h-4" />
                  Send via WhatsApp
                </motion.button>
              </div>
            </FormCard>
          )}
        </AnimatePresence>

        {/* Trust Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <Factory className="w-3.5 h-3.5" />
            Direct Manufacturer
          </span>
          <span className="flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5" />
            Samples Available
          </span>
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5" />
            {CONTACT_INFO.phone}
          </span>
        </div>
      </div>
    </div>
  );
}