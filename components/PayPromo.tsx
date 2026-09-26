import { ArrowRight, Check, QrCode, Zap } from "lucide-react";
import Link from "next/link";
import { Reveal } from "./Reveal";

/** Home section for pay links, with an example of what the payer sees. */
export function PayPromo() {
  return (
    <div className="promo">
      <Reveal className="promo__copy">
        <div className="label" style={{ color: "var(--link)", marginBottom: 10 }}>Pay links</div>
        <h2 id="pay-title" className="h2">Get paid in USDC with a link.</h2>
        <ul className="feature-list">
          <li><span className="tile" data-shade="1"><QrCode aria-hidden="true" /></span><span><b>Link or QR code</b><br /><span className="small secondary">Set an amount and a note, then share it anywhere.</span></span></li>
          <li><span className="tile" data-shade="2"><Zap aria-hidden="true" /></span><span><b>Settles in about a second</b><br /><span className="small secondary">Payments confirm on Arc almost instantly.</span></span></li>
          <li><span className="tile" data-shade="3"><Check aria-hidden="true" /></span><span><b>Counts as a first step</b><br /><span className="small secondary">Paying a link is a real transaction for your quests.</span></span></li>
        </ul>
        <Link href="/pay" className="btn btn--primary" style={{ marginTop: 32 }}>Create a pay link <ArrowRight aria-hidden="true" /></Link>
      </Reveal>
      <Reveal className="promo__demo" delay={120}>
        <div className="demo-pay" aria-hidden="true">
          <span className="demo-pay__tag">Example</span>
          <div className="row" style={{ gap: 12 }}>
            <span className="avatar">M</span>
            <span><span className="label">Pay</span><br /><span className="mono" style={{ fontWeight: 600 }}>0x7A00…2f1A</span></span>
          </div>
          <div className="demo-pay__amount"><span className="mono">25</span> <span className="secondary">USDC</span></div>
          <p className="secondary small">“Dinner on Friday”</p>
          <span className="btn btn--primary btn--block">Send 25 USDC</span>
          <div className="demo-pay__done"><Check /> Confirmed on Arc in <b className="mono">0.9s</b></div>
        </div>
      </Reveal>
    </div>
  );
}
