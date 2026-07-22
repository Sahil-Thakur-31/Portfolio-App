"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, type LeadFormValues } from "@/lib/validators";
import { submitInquiryAction } from "@/server/actions/leads";
import { App, ConfigProvider, theme } from "antd";

function ContactFormInner({ username, disabled = false }: { username: string; disabled?: boolean }) {
  const { message: antdMessage } = App.useApp();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetCurrency, setBudgetCurrency] = useState("INR");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
  });

  const handleBudgetChange = (amount: string, currency: string) => {
    setBudgetAmount(amount);
    setBudgetCurrency(currency);
    if (amount.trim() === "") {
      setValue("budget", "");
    } else {
      setValue("budget", `${amount} ${currency}`);
    }
  };

  const onSubmit = async (data: LeadFormValues) => {
    if (disabled) {
      antdMessage.error("No user found.");
      return;
    }
    try {
      setError(null);
      await submitInquiryAction(username, data);
      setSuccess(true);
      reset();
      setBudgetAmount("");
      setBudgetCurrency("INR");
    } catch (err: any) {
      setError(err.message || "Failed to submit inquiry. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {success ? (
        <div className="rounded-lg border border-theme-success/30 bg-theme-success/10 p-6 text-center text-theme-success">
          <h3 className="text-lg font-semibold mb-2">Thank you!</h3>
          <p className="text-sm text-theme-success/80">Your message has been received. I will get back to you shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-theme-error/30 bg-theme-error/10 p-4 text-xs font-mono text-theme-error">
              [TRANSMISSION_ERROR] {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 mb-1.5">NAME_STRING</label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Priya Sharma"
                {...register("name")}
                className="w-full h-11 rounded-xl border border-theme-border bg-theme-input-bg/80 focus:border-theme-accent-teal/40 focus:shadow-[0_0_15px_rgba(var(--theme-accent-teal-rgb),0.06)] px-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none transition-all duration-300 font-mono"
              />
              {errors.name && <p className="mt-1 text-[10px] font-mono text-theme-error">[ERR] {errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 mb-1.5">EMAIL_ADDRESS</label>
              <input
                id="email"
                type="email"
                placeholder="e.g. priya@example.com"
                {...register("email")}
                className="w-full h-11 rounded-xl border border-theme-border bg-theme-input-bg/80 focus:border-theme-accent-teal/40 focus:shadow-[0_0_15px_rgba(var(--theme-accent-teal-rgb),0.06)] px-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none transition-all duration-300 font-mono"
              />
              {errors.email && <p className="mt-1 text-[10px] font-mono text-theme-error">[ERR] {errors.email.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="company" className="block text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 mb-1.5">COMPANY_NODE (OPTIONAL)</label>
              <input
                id="company"
                type="text"
                placeholder="e.g. Google"
                {...register("company")}
                className="w-full h-11 rounded-xl border border-theme-border bg-theme-input-bg/80 focus:border-theme-accent-teal/40 focus:shadow-[0_0_15px_rgba(var(--theme-accent-teal-rgb),0.06)] px-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none transition-all duration-300 font-mono"
              />
              {errors.company && <p className="mt-1 text-[10px] font-mono text-theme-error">[ERR] {errors.company.message}</p>}
            </div>

            <div>
              <label htmlFor="budget-amount" className="block text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 mb-1.5">EST_BUDGET (OPTIONAL)</label>
              <div className="flex items-center rounded-xl border border-theme-border bg-theme-input-bg/80 focus-within:border-theme-accent-teal/40 focus-within:shadow-[0_0_15px_rgba(var(--theme-accent-teal-rgb),0.06)] transition-all duration-300 overflow-hidden">
                <input
                  id="budget-amount"
                  type="number"
                  placeholder="e.g. 50000"
                  value={budgetAmount}
                  onChange={(e) => handleBudgetChange(e.target.value, budgetCurrency)}
                  className="flex-grow h-11 bg-transparent px-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none font-mono"
                />
                <select
                  value={budgetCurrency}
                  onChange={(e) => handleBudgetChange(budgetAmount, e.target.value)}
                  className="w-28 h-11 bg-theme-bg border-l border-theme-border pl-3 pr-8 text-xs text-theme-neutral-300 focus:outline-none font-mono cursor-pointer rounded-r-xl appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center] bg-[size:16px_16px] bg-no-repeat"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="SGD">SGD ($)</option>
                </select>
              </div>
              <input type="hidden" {...register("budget")} />
              {errors.budget && <p className="mt-1 text-[10px] font-mono text-theme-error">[ERR] {errors.budget.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 mb-1.5">TRANSMISSION_BODY</label>
            <textarea
              id="message"
              placeholder="Enter message details..."
              {...register("message")}
              className="w-full min-h-[120px] rounded-xl border border-theme-border bg-theme-input-bg/80 p-4 text-sm text-theme-text placeholder-theme-text-muted focus:border-theme-accent-teal/40 focus:shadow-[0_0_15px_rgba(var(--theme-accent-teal-rgb),0.06)] focus:outline-none transition-all duration-300 font-mono"
            />
            {errors.message && <p className="mt-1 text-[10px] font-mono text-theme-error">[ERR] {errors.message.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-theme-accent-teal to-theme-accent-blue hover:from-theme-accent-teal/90 hover:to-theme-accent-blue/90 px-6 font-bold font-mono text-xs uppercase tracking-widest text-theme-bg hover:shadow-[0_0_20px_rgba(var(--theme-accent-teal-rgb),0.2)] transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "TRANSMITTING..." : "INITIATE UPLINK"}
          </button>
        </form>
      )}
    </div>
  );
}

export function ContactForm({ username, disabled = false }: { username: string; disabled?: boolean }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "var(--theme-accent-teal)",
          colorBgContainer: "var(--theme-input-bg)",
          colorBorder: "var(--theme-border)",
          borderRadius: 12,
          colorText: "var(--theme-text)",
          fontFamily: "monospace",
        },
      }}
    >
      <App>
        <ContactFormInner username={username} disabled={disabled} />
      </App>
    </ConfigProvider>
  );
}
