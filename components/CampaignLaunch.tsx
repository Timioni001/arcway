'use client';

import { ArrowUpRight, Check, CircleAlert, ExternalLink, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { type Address, decodeEventLog, type Hex } from "viem";
import { usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { campaignsAbi, erc20ApproveAbi } from "../lib/campaignsAbi";
import { type LaunchForm, listingIssueUrl, planLaunch } from "../lib/campaignForm";
import { MODES, MODE_HELP, MODE_LABEL, TASK_KINDS, type CampaignTask, modeIndex, rewardSentence } from "../lib/campaigns";
import { CAMPAIGNS_ADDRESS, IS_MAINNET, NETWORK_NAME, USDC_ADDRESS, arcChain, explorer } from "../lib/config";
import { humanizeError } from "../lib/errors";
import { formatUsdc } from "../lib/format";
import { useWallet } from "../lib/hooks/useWallet";
import { QUESTS } from "../lib/quests";
import { APPS, appContracts } from "../lib/registry";

const inDays = (d: number) => {
  const t = new Date(Date.now() + d * 86400_000);
  t.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}T${pad(t.getHours())}:00`;
};

const newTask = (kind: CampaignTask["kind"], app?: string): CampaignTask => {
  const listed = APPS.find((a) => a.slug === app);
  if (kind === "use-app") return { kind, label: listed ? `Make a transaction on ${listed.name}` : "Make a transaction on the app", contracts: listed ? appContracts(listed) : [] };
  if (kind === "hold-usdc") return { kind, label: "Hold at least 5 USDC on Arc", minUsdc: 5 };
  return { kind, label: `Finish the "${QUESTS[0].title}" quest on Arcway`, questId: QUESTS[0].id };
};

type Step = { state: "idle" } | { state: "approving" | "launching" } | { state: "launched"; id: string; tx: Hex } | { state: "error"; message: string };

export function CampaignLaunch() {
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const wallet = useWallet();
  const address = wallet.connection.status === "connected" ? wallet.connection.address : undefined;
  const client = usePublicClient({ chainId: arcChain.id });
  const { writeContractAsync } = useWriteContract();
  const [f, setF] = useState<LaunchForm>(() => ({
    project: "", app: "", title: "", summary: "", mode: "first-come", pool: "500", winners: "100",
    start: inDays(2), durationDays: "14", claimDays: "14", tasks: [newTask("use-app")]
  }));
  const [tried, setTried] = useState(false);
  const [step, setStep] = useState<Step>({ state: "idle" });
  const [now] = useState(() => Math.floor(Date.now() / 1000));
  const { plan, errors } = useMemo(() => planLaunch(f, now), [f, now]);
  const shown = tried ? errors : {};

  const allowance = useReadContract({
    address: USDC_ADDRESS, abi: erc20ApproveAbi, functionName: "allowance", args: address && CAMPAIGNS_ADDRESS ? [address, CAMPAIGNS_ADDRESS] : undefined, chainId: arcChain.id,
    query: { enabled: Boolean(address && CAMPAIGNS_ADDRESS) }
  });
  const balance = useReadContract({
    address: USDC_ADDRESS, abi: erc20ApproveAbi, functionName: "balanceOf", args: address ? [address] : undefined, chainId: arcChain.id, query: { enabled: Boolean(address) }
  });
  const approved = plan && allowance.data !== undefined && allowance.data >= plan.pool;
  const enough = plan && balance.data !== undefined && balance.data >= plan.pool;

  const set = <K extends keyof LaunchForm>(k: K, v: LaunchForm[K]) => setF((x) => ({ ...x, [k]: v }));
  const setTask = (i: number, t: CampaignTask) => set("tasks", f.tasks.map((x, j) => (j === i ? t : x)));

  const wait = async (hash: Hex) => client!.waitForTransactionReceipt({ hash, timeout: 90_000 });

  const approve = async () => {
    setTried(true);
    if (!plan || !CAMPAIGNS_ADDRESS) return;
    setStep({ state: "approving" });
    try {
      await wait(await writeContractAsync({ address: USDC_ADDRESS, abi: erc20ApproveAbi, functionName: "approve", args: [CAMPAIGNS_ADDRESS, plan.pool], chainId: arcChain.id }));
      await allowance.refetch();
      setStep({ state: "idle" });
    } catch (e) { setStep({ state: "error", message: humanizeError(e) }); }
  };

  const launch = async () => {
    setTried(true);
    if (!plan || !CAMPAIGNS_ADDRESS) return;
    setStep({ state: "launching" });
    try {
      const hash = await writeContractAsync({
        address: CAMPAIGNS_ADDRESS, abi: campaignsAbi, functionName: "createCampaign", chainId: arcChain.id,
        args: [plan.pool, modeIndex(f.mode), plan.winners, BigInt(plan.start), BigInt(plan.end), BigInt(plan.claimWindow), plan.hash]
      });
      const receipt = await wait(hash);
      let created: string | null = null;
      for (const log of receipt.logs) {
        try {
          const ev = decodeEventLog({ abi: campaignsAbi, data: log.data, topics: log.topics });
          if (ev.eventName === "CampaignCreated") created = ev.args.id.toString();
        } catch { /* other logs */ }
      }
      setStep(created ? { state: "launched", id: created, tx: hash } : { state: "error", message: "The launch confirmed but its id wasn't found. Check the transaction on the explorer." });
    } catch (e) { setStep({ state: "error", message: humanizeError(e) }); }
  };

  const busy = step.state === "approving" || step.state === "launching";

  if (step.state === "launched" && plan) {
    return (
      <div className="lc-done" role="status">
        <span className="lc-done__icon" aria-hidden="true"><Check /></span>
        <h2 className="h3">Your campaign is on Arc</h2>
        <p className="secondary">Campaign #{step.id} holds {formatUsdc(plan.pool)} in escrow. Last step: send it for listing so people can find and join it on Arcway.</p>
        <div className="row" style={{ justifyContent: "center" }}>
          <a className="btn btn--primary" href={listingIssueUrl(plan, step.id, step.tx)} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden="true" />Send for listing</a>
          <a className="btn btn--secondary" href={explorer.tx(step.tx)} target="_blank" rel="noopener noreferrer">View transaction<ArrowUpRight aria-hidden="true" /></a>
        </div>
        <p className="xs secondary">The listing includes the description hash stored on chain, so what people see matches what you launched.</p>
      </div>
    );
  }

  return (
    <div className="lc">
      <form className="lc-form" onSubmit={(e) => e.preventDefault()} noValidate>
        <fieldset className="lc-block">
          <legend className="lc-block__title">1. About the campaign</legend>
          <div className="sgrid">
            <div className="sfield" data-invalid={Boolean(shown.project) || undefined}>
              <label htmlFor={id("project")} className="sfield__label">Project</label>
              <input id={id("project")} value={f.project} onChange={(e) => set("project", e.target.value)} placeholder="e.g. Tipjar" />
              {shown.project && <span className="sfield__error"><CircleAlert aria-hidden="true" />{shown.project}</span>}
            </div>
            <div className="sfield">
              <label htmlFor={id("app")} className="sfield__label">Listed app (optional)</label>
              <select id={id("app")} value={f.app} onChange={(e) => { const app = e.target.value; setF((x) => ({ ...x, app, project: x.project || (APPS.find((a) => a.slug === app)?.name ?? ""), tasks: x.tasks.map((t) => (t.kind === "use-app" ? newTask("use-app", app) : t)) })); }}>
                <option value="">Not listed yet</option>
                {APPS.filter((a) => !a.sample).map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div className="sfield" data-invalid={Boolean(shown.title) || undefined}>
            <label htmlFor={id("title")} className="sfield__label">Title</label>
            <input id={id("title")} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. First swap week" maxLength={80} />
            {shown.title && <span className="sfield__error"><CircleAlert aria-hidden="true" />{shown.title}</span>}
          </div>
          <div className="sfield" data-invalid={Boolean(shown.summary) || undefined}>
            <label htmlFor={id("summary")} className="sfield__label">What people get to do</label>
            <textarea id={id("summary")} rows={2} value={f.summary} onChange={(e) => set("summary", e.target.value)} maxLength={280} placeholder="Try our app on Arc with one swap and share the prize pool." />
            {shown.summary && <span className="sfield__error"><CircleAlert aria-hidden="true" />{shown.summary}</span>}
          </div>
        </fieldset>

        <fieldset className="lc-block">
          <legend className="lc-block__title">2. Tasks</legend>
          <p className="xs secondary">Only tasks Arcway can check on Arc, so rewards go to real activity, not screenshots.</p>
          <ul className="lc-tasks">
            {f.tasks.map((t, i) => (
              <li key={i} className="lc-task">
                <div className="row between">
                  <select aria-label={`Task ${i + 1} type`} value={t.kind} onChange={(e) => setTask(i, newTask(e.target.value as CampaignTask["kind"], f.app))}>
                    {TASK_KINDS.map((k) => <option key={k.kind} value={k.kind}>{k.title}</option>)}
                  </select>
                  {f.tasks.length > 1 && <button type="button" className="btn btn--ghost btn--sm" onClick={() => set("tasks", f.tasks.filter((_, j) => j !== i))} aria-label={`Remove task ${i + 1}`}><Trash2 aria-hidden="true" /></button>}
                </div>
                <input aria-label={`Task ${i + 1} description`} value={t.label} onChange={(e) => setTask(i, { ...t, label: e.target.value })} />
                {t.kind === "use-app" && (
                  <input aria-label={`Task ${i + 1} contract addresses`} className="mono" placeholder="Contract address 0x… (comma for several)" value={t.contracts.join(", ")}
                    onChange={(e) => setTask(i, { ...t, contracts: e.target.value.split(/[\s,]+/).filter(Boolean) as Address[] })} />
                )}
                {t.kind === "hold-usdc" && (
                  <input aria-label={`Task ${i + 1} minimum USDC`} type="number" min={0.01} step="0.01" value={t.minUsdc} onChange={(e) => setTask(i, { ...t, minUsdc: Number(e.target.value) })} />
                )}
                {t.kind === "arcway-quest" && (
                  <select aria-label={`Task ${i + 1} quest`} value={t.questId} onChange={(e) => setTask(i, { ...t, questId: e.target.value, label: `Finish the "${QUESTS.find((q) => q.id === e.target.value)?.title}" quest on Arcway` })}>
                    {QUESTS.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
                  </select>
                )}
                <span className="xs secondary">{TASK_KINDS.find((k) => k.kind === t.kind)?.help}</span>
              </li>
            ))}
          </ul>
          {f.tasks.length < 3 && <button type="button" className="btn btn--ghost btn--sm" onClick={() => set("tasks", [...f.tasks, newTask("hold-usdc")])}><Plus aria-hidden="true" />Add a task</button>}
          {shown.tasks && <span className="sfield__error"><CircleAlert aria-hidden="true" />{shown.tasks}</span>}
        </fieldset>

        <fieldset className="lc-block">
          <legend className="lc-block__title">3. Prize pool</legend>
          <div className="lc-modes" role="radiogroup" aria-label="How the pool is shared">
            {MODES.map((m) => (
              <label key={m} className="lc-mode" data-checked={f.mode === m || undefined}>
                <input type="radio" name={id("mode")} checked={f.mode === m} onChange={() => set("mode", m)} />
                <span className="lc-mode__name">{MODE_LABEL[m]}</span>
                <span className="xs secondary">{MODE_HELP[m]}</span>
              </label>
            ))}
          </div>
          <div className="sgrid">
            <div className="sfield" data-invalid={Boolean(shown.pool) || undefined}>
              <label htmlFor={id("pool")} className="sfield__label">Pool (USDC)</label>
              <input id={id("pool")} inputMode="decimal" value={f.pool} onChange={(e) => set("pool", e.target.value)} />
              {shown.pool && <span className="sfield__error"><CircleAlert aria-hidden="true" />{shown.pool}</span>}
            </div>
            <div className="sfield" data-invalid={Boolean(shown.winners) || undefined}>
              <label htmlFor={id("winners")} className="sfield__label">{f.mode === "raffle" ? "Winners to draw" : f.mode === "split" ? "Maximum people" : "Number of rewards"}</label>
              <input id={id("winners")} inputMode="numeric" value={f.winners} onChange={(e) => set("winners", e.target.value)} />
              {shown.winners && <span className="sfield__error"><CircleAlert aria-hidden="true" />{shown.winners}</span>}
            </div>
          </div>
        </fieldset>

        <fieldset className="lc-block">
          <legend className="lc-block__title">4. Dates</legend>
          <div className="sgrid">
            <div className="sfield" data-invalid={Boolean(shown.start) || undefined}>
              <label htmlFor={id("start")} className="sfield__label">Starts</label>
              <input id={id("start")} type="datetime-local" value={f.start} onChange={(e) => set("start", e.target.value)} />
              {shown.start ? <span className="sfield__error"><CircleAlert aria-hidden="true" />{shown.start}</span> : <span className="sfield__hint">Leave a day or two so it can be listed before it opens.</span>}
            </div>
            <div className="sfield" data-invalid={Boolean(shown.durationDays) || undefined}>
              <label htmlFor={id("days")} className="sfield__label">Runs for (days)</label>
              <input id={id("days")} inputMode="decimal" value={f.durationDays} onChange={(e) => set("durationDays", e.target.value)} />
              {shown.durationDays && <span className="sfield__error"><CircleAlert aria-hidden="true" />{shown.durationDays}</span>}
            </div>
            <div className="sfield" data-invalid={Boolean(shown.claimDays) || undefined}>
              <label htmlFor={id("claim")} className="sfield__label">Claim window (days)</label>
              <input id={id("claim")} inputMode="numeric" value={f.claimDays} onChange={(e) => set("claimDays", e.target.value)} />
              {shown.claimDays ? <span className="sfield__error"><CircleAlert aria-hidden="true" />{shown.claimDays}</span> : <span className="sfield__hint">Anything unclaimed after this returns to you.</span>}
            </div>
          </div>
        </fieldset>
      </form>

      <aside className="lc-side" aria-label="Summary">
        <div className="lc-summary">
          <div className="label">Preview</div>
          <div className="lc-summary__title">{f.title.trim() || "Your campaign"}</div>
          <div className="lc-summary__project xs secondary">{f.project.trim() || "Your project"}</div>
          <div className="lc-summary__pool mono">{plan ? formatUsdc(plan.pool) : "—"}</div>
          <p className="small">{plan ? rewardSentence(f.mode, plan.pool, plan.winners) : "Fill in the form to see the reward."}</p>
          {plan && <p className="xs secondary">{new Date(plan.start * 1000).toLocaleString()} → {new Date(plan.end * 1000).toLocaleString()}</p>}
        </div>

        <div className="lc-steps">
          {!CAMPAIGNS_ADDRESS ? (
            <p className="gw-note">Campaign escrow isn&apos;t deployed on {NETWORK_NAME} yet. You can prepare and preview a campaign now; launching opens once it is.</p>
          ) : !address ? (
            <button type="button" className="btn btn--primary btn--block" onClick={() => wallet.connect()}>Connect the project&apos;s wallet</button>
          ) : (
            <>
              {plan && balance.data !== undefined && !enough && <p className="sfield__error"><CircleAlert aria-hidden="true" />This wallet holds {formatUsdc(balance.data)}; the pool needs {formatUsdc(plan.pool)}.</p>}
              <button type="button" className="btn btn--secondary btn--block" onClick={approve} disabled={busy || Boolean(approved) || !enough} aria-busy={step.state === "approving"}>
                {approved ? <><Check aria-hidden="true" />USDC approved</> : step.state === "approving" ? <><LoaderCircle className="spin" aria-hidden="true" />Approving…</> : `1. Approve ${plan ? formatUsdc(plan.pool) : "USDC"}`}
              </button>
              <button type="button" className="btn btn--primary btn--block" onClick={launch} disabled={busy || !approved} aria-busy={step.state === "launching"}>
                {step.state === "launching" ? <><LoaderCircle className="spin" aria-hidden="true" />Launching…</> : "2. Lock the pool and launch"}
              </button>
            </>
          )}
          {step.state === "error" && <p className="sfield__error" role="alert"><CircleAlert aria-hidden="true" />{step.message}</p>}
          {tried && !plan && <p className="sfield__error" role="alert"><CircleAlert aria-hidden="true" />Fix the highlighted fields first.</p>}
          {IS_MAINNET && <p className="xs secondary">Mainnet uses real USDC. The pool is locked until the rules release it.</p>}
        </div>

        <ul className="lc-facts xs secondary">
          <li>Joining is free for participants; there is no Arcway fee.</li>
          <li>You can cancel and get the full pool back any time before it starts.</li>
          <li>If nobody joins, the pool comes back as soon as it ends.</li>
          <li>Arcway can&apos;t withdraw your pool. Only you can, when the rules allow.</li>
        </ul>
      </aside>
    </div>
  );
}
