'use client';

import { BadgeCheck, CircleAlert, ExternalLink, LoaderCircle, Send } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { isAddress } from "viem";
import { apiFetch } from "../lib/api";
import { NETWORK_NAME } from "../lib/config";
import type { Intel } from "../lib/intel";
import { CATEGORIES, type Category } from "../lib/registry";
import { EMPTY_SUBMISSION, parseContracts, submissionIssueUrl, validateSubmission, type Submission } from "../lib/submit";
import { CATEGORY_META, CategoryTile } from "./CategoryIcon";

type Check = { state: "checking" } | { state: "error" } | { state: "done"; isContract: boolean | null; verified: boolean | null; name: string | null; transactions: number | null };

function useContractChecks(value: string) {
  const [checks, setChecks] = useState<Record<string, Check>>({});
  const addresses = useMemo(() => parseContracts(value).filter((a) => isAddress(a)).slice(0, 5), [value]);
  useEffect(() => {
    const id = setTimeout(() => {
      for (const a of addresses) {
        const key = a.toLowerCase();
        setChecks((c) => (c[key] ? c : { ...c, [key]: { state: "checking" } }));
        apiFetch<Intel<{ isContract: boolean | null; verified: boolean | null; name: string | null; transactions: number | null }>>(`/api/intel/check?address=${a}`)
          .then((r) => setChecks((c) => ({ ...c, [key]: { state: "done", ...r.data } })))
          .catch(() => setChecks((c) => ({ ...c, [key]: { state: "error" } })));
      }
    }, 500);
    return () => clearTimeout(id);
  }, [addresses]);
  return { addresses, checks };
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="sfield" data-invalid={Boolean(error) || undefined}>
      <label htmlFor={id} className="sfield__label">{label}</label>
      {children}
      {error ? <span className="sfield__error" id={`${id}-err`}><CircleAlert aria-hidden="true" />{error}</span> : hint ? <span className="sfield__hint">{hint}</span> : null}
    </div>
  );
}

/** Submit an Arc mainnet project: validated, contracts checked live, sent as a pre-filled GitHub issue. */
export function SubmitForm() {
  const [s, setS] = useState<Submission>(EMPTY_SUBMISSION);
  const [tried, setTried] = useState(false);
  const [opened, setOpened] = useState(false);
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const errors = validateSubmission(s);
  const shown = tried ? errors : {};
  const { addresses, checks } = useContractChecks(s.contracts);
  const set = (k: keyof Submission) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setS((v) => ({ ...v, [k]: e.target.value }));
  const a11y = (k: keyof Submission) => ({ id: id(k), "aria-invalid": Boolean(shown[k]) || undefined, "aria-describedby": shown[k] ? `${id(k)}-err` : undefined });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (Object.keys(errors).length) return;
    const summary: Record<string, string> = {};
    for (const a of addresses) {
      const c = checks[a.toLowerCase()];
      if (c?.state === "done") summary[a.toLowerCase()] = [c.isContract ? "contract" : "not a contract", c.verified ? "source verified" : "source not verified", c.transactions !== null ? `${c.transactions} tx` : ""].filter(Boolean).join(", ");
    }
    window.open(submissionIssueUrl(s, summary), "_blank", "noopener,noreferrer");
    setOpened(true);
  };

  const category = s.category as Category | "";
  return (
    <div className="submit">
      <form className="submit__form panel" onSubmit={submit} noValidate>
        <div className="sgrid">
          <Field id={id("name")} label="Project name" error={shown.name}>
            <input {...a11y("name")} value={s.name} onChange={set("name")} placeholder="e.g. Tipjar" autoComplete="off" />
          </Field>
          <Field id={id("url")} label="Live app link" hint="The deployed app on Arc mainnet." error={shown.url}>
            <input {...a11y("url")} value={s.url} onChange={set("url")} placeholder="https://" inputMode="url" />
          </Field>
          <Field id={id("category")} label="Category" error={shown.category}>
            <select {...a11y("category")} value={s.category} onChange={set("category")}>
              <option value="">Choose one…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field id={id("tagline")} label="What it does, in one line" hint={`${s.tagline.trim().length}/120`} error={shown.tagline}>
            <input {...a11y("tagline")} value={s.tagline} onChange={set("tagline")} maxLength={140} placeholder="Send USDC tips with a link." />
          </Field>
        </div>

        <Field id={id("contracts")} label={`Contract addresses on ${NETWORK_NAME}`} hint="One per line. We check each one on the explorer as you type." error={shown.contracts}>
          <textarea {...a11y("contracts")} value={s.contracts} onChange={set("contracts")} rows={3} placeholder="0x…" className="mono" spellCheck={false} />
        </Field>
        {addresses.length > 0 && (
          <ul className="checks" aria-live="polite">
            {addresses.map((a) => {
              const c = checks[a.toLowerCase()];
              return (
                <li key={a} className="check-row" data-state={c?.state === "done" ? (c.isContract ? "ok" : "bad") : c?.state ?? "checking"}>
                  <span className="mono xs">{a.slice(0, 10)}…{a.slice(-6)}</span>
                  {!c || c.state === "checking" ? <span className="xs secondary"><LoaderCircle className="spin" aria-hidden="true" />Checking…</span>
                    : c.state === "error" ? <span className="xs secondary">Couldn&apos;t check right now. You can still submit.</span>
                    : c.isContract ? <span className="xs"><BadgeCheck aria-hidden="true" />{c.name ?? "Contract found"}{c.verified ? " · source verified" : " · source not verified"}{c.transactions !== null ? ` · ${c.transactions.toLocaleString("en-US")} tx` : ""}</span>
                    : <span className="xs">Not a contract on {NETWORK_NAME}. Check the address and network.</span>}
                </li>
              );
            })}
          </ul>
        )}

        <div className="sgrid">
          <Field id={id("repo")} label="Public repo" error={shown.repo}>
            <input {...a11y("repo")} value={s.repo} onChange={set("repo")} placeholder="https://github.com/you/project" inputMode="url" />
          </Field>
          <Field id={id("profile")} label="Builder profile" hint="GitHub, X or Farcaster." error={shown.profile}>
            <input {...a11y("profile")} value={s.profile} onChange={set("profile")} placeholder="https://x.com/you" inputMode="url" />
          </Field>
        </div>
        <Field id={id("notes")} label="Anything else (optional)">
          <textarea id={id("notes")} value={s.notes} onChange={set("notes")} rows={2} placeholder="What it uses Arc for, what's next…" />
        </Field>

        <div className="submit__actions">
          <button type="submit" className="btn btn--primary"><Send aria-hidden="true" />Continue on GitHub</button>
          <span className="xs secondary">Opens a pre-filled issue in a new tab. Review it there and press Submit.</span>
        </div>
        {tried && Object.keys(errors).length > 0 && <p className="sfield__error" role="alert"><CircleAlert aria-hidden="true" />Fix the highlighted fields to continue.</p>}
        {opened && <p className="submit__done" role="status"><ExternalLink aria-hidden="true" />Your submission opened on GitHub. Once it&apos;s posted, it&apos;s queued for review.</p>}
      </form>

      <aside className="submit__preview" aria-label="Listing preview">
        <div className="label">Preview</div>
        <div className="app-card card" style={{ marginTop: 10 }}>
          <div className="app-card__top">
            {category ? <CategoryTile category={category} /> : <span className="ctile" aria-hidden="true" />}
            <span className="row" style={{ gap: 6 }}><span className="badge badge--community">Community</span></span>
          </div>
          <div>
            <h3 className="h4">{s.name.trim() || "Your project"}</h3>
            <p className="small secondary app-card__desc">{s.tagline.trim() || "One line about what it does."}</p>
          </div>
          <div className="app-card__foot">
            <span className="app-card__meta"><span className="tag">{category || "Category"}</span><span className="xs secondary">{NETWORK_NAME}</span></span>
          </div>
        </div>
        {category && <p className="xs secondary" style={{ marginTop: 10 }}>{CATEGORY_META[category].blurb}.</p>}
      </aside>
    </div>
  );
}
