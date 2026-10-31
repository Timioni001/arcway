#!/usr/bin/env python3
"""Arcway demo video, end to end: voiceover, live screen capture, cards, subtitles, mix, export, verify.

    python make_demo.py            # needs edge-tts and Pillow (a venv is fine), ffmpeg, node + playwright
Reads the voiceover from script.md. Writes out/demo_final.mp4 and out/demo_vertical.mp4.
"""
import asyncio, json, os, re, subprocess, sys
from pathlib import Path

import edge_tts
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
OUT = HERE / "out"
WORK = Path(os.environ.get("DEMO_WORK", OUT / "work"))
DEMO = HERE.parent  # marketing/demo, the PNG pack
FONTS = ROOT / "node_modules/geist/dist/fonts/geist-sans"
SITE = os.environ.get("DEMO_SITE", "https://arcway.world")
VOICE, RATE = "en-NG-AbeoNeural", "-5%"
TITLE_S, END_S, GAP_S, FPS = 3.0, 4.0, 0.45, 30
CHROME = "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome"

# Visuals per script section. Web segments are recorded live from the site; stills come from the PNG pack.
# secs are planned lengths; each section is scaled to its voiceover. Steps run after the page settles.
QUEST_FORM = [
    {"select": "Quest", "option": "First transaction"},
    {"type": "Reward per person (USDC)", "text": "0.5"},
    {"type": "How many people", "text": "40"},
    {"type": "Runs for (days)", "text": "21"},
    {"type": "Title", "text": "Lagos crypto explorers: your first Arc transaction"},
]
SECTIONS = [
    [{"web": "/", "secs": 6, "steps": [{"wait": 700}, {"scrollY": 260, "ms": 4200}]}],
    [{"web": "/", "secs": 11, "pre": [{"jumpY": 260}], "steps": [{"scrollY": 1350, "ms": 9500}]}],
    [{"web": "/explore", "secs": 11, "steps": [{"wait": 900}, {"scrollY": 820, "ms": 8500}]},
     {"web": "/quests", "secs": 12, "steps": [{"wait": 700}, {"scrollTo": ".qroute", "ms": 4500}, {"wait": 2500}, {"scrollBy": 500, "ms": 3500}]}],
    [{"web": "/quests", "secs": 7, "steps": [{"scrollTo": ".quest-card:has(.paid-tag)", "ms": 2800}, {"spot": ".paid-tag"}, {"wait": 3000}]},
     {"web": "/sponsor", "secs": 14, "steps": [{"wait": 600}, *QUEST_FORM, {"spot": ".sponsor__sum"}, {"wait": 1500}]}],
    [{"web": "/sponsor", "secs": 9, "steps": [{"scrollTo": "#live", "ms": 2600}, {"spot": ".bounty-stats"}, {"wait": 4500}]},
     {"still": "proof/03-explorer-success.png", "secs": 8},
     {"web": "/sponsor", "secs": 9, "steps": [{"scrollTo": ".bounty-feed", "ms": 2600}, {"spot": ".bounty-feed"}, {"wait": 4500}]}],
    [{"still": "studio/01-sponsor-tools-plan.png", "secs": 9},
     {"still": "studio/02-merges-with-main.png", "secs": 8},
     {"still": "studio/03-pushed.png", "secs": 8},
     {"web": "/sponsor", "secs": 10, "steps": [{"scrollTo": ".studio-credit", "ms": 2600}, {"spot": ".studio-credit"}, {"wait": 5500}]}],
    [{"web": "/quests", "secs": 12, "steps": [{"scrollTo": "#sponsored", "ms": 3200}, {"wait": 6500}]},
     {"web": "/", "secs": 11, "steps": [{"wait": 1200}, {"scrollY": 180, "ms": 6000}]}],
]

CAPTURE_JS = r"""
import { chromium } from "playwright";
import { existsSync } from "node:fs";
const jobs = JSON.parse(process.argv[2]);
const browser = await chromium.launch({ executablePath: existsSync(process.argv[3]) ? process.argv[3] : undefined });
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
async function scrollTo(page, y, ms) {
  await page.evaluate(async ([y, ms]) => {
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const from = window.scrollY, start = performance.now();
    await new Promise((done) => { const tick = (now) => { const t = Math.min(1, (now - start) / ms); window.scrollTo(0, from + (y - from) * ease(t)); t < 1 ? requestAnimationFrame(tick) : done(); }; requestAnimationFrame(tick); });
  }, [y, ms]);
}
const centerOf = (page, sel) => page.evaluate((sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return Math.max(0, r.top + window.scrollY - Math.max(120, (innerHeight - r.height) / 2)); }, sel);
async function run(page, step, field) {
  if (step.wait) return page.waitForTimeout(step.wait);
  if (step.jumpY !== undefined) return page.evaluate((y) => window.scrollTo(0, y), step.jumpY);
  if (step.scrollY !== undefined) return scrollTo(page, step.scrollY, step.ms);
  if (step.scrollBy !== undefined) return scrollTo(page, (await page.evaluate(() => scrollY)) + step.scrollBy, step.ms);
  if (step.scrollTo) { const y = await centerOf(page, step.scrollTo); return y === null ? page.waitForTimeout(step.ms) : scrollTo(page, y, step.ms); }
  if (step.spot) return page.evaluate((sel) => { const el = document.querySelector(sel); if (!el) return; el.style.transition = "box-shadow .5s, outline-color .5s"; el.style.outline = "3px solid rgba(61,145,190,.9)"; el.style.outlineOffset = "6px"; el.style.boxShadow = "0 0 0 12px rgba(61,145,190,.15)"; }, step.spot);
  if (step.select) { const f = page.getByLabel(step.select, { exact: true }).first(); await f.scrollIntoViewIfNeeded(); await f.focus(); await page.waitForTimeout(400); const v = await f.evaluate((s, t) => [...s.options].find((o) => o.text.includes(t))?.value, step.option); if (v) await f.selectOption(v); return page.waitForTimeout(700); }
  if (step.type) { const f = field(step.type); await f.scrollIntoViewIfNeeded(); await f.click(); await f.fill(""); await f.pressSequentially(step.text, { delay: step.text.length > 12 ? 45 : 140 }); return page.waitForTimeout(450); }
}
const results = [];
for (const job of jobs) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: job.dir, size: { width: 1920, height: 1080 } }, colorScheme: "light", reducedMotion: "no-preference" });
  const born = Date.now();
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.setItem("arcway:theme", "light"); } catch {} });
  await page.goto(job.url, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(3200);
  await page.addStyleTag({ content: "*{caret-color:transparent} ::-webkit-scrollbar{display:none} html{scrollbar-width:none}" });
  for (const s of job.pre || []) await run(page, s, (l) => page.getByLabel(l, { exact: false }).first());
  await page.waitForTimeout(300);
  const offset = (Date.now() - born) / 1000;
  for (const s of job.steps) await run(page, s, (l) => page.getByLabel(l, { exact: false }).first());
  const used = (Date.now() - born) / 1000 - offset;
  if (used < job.secs) await page.waitForTimeout((job.secs - used) * 1000);
  const length = (Date.now() - born) / 1000 - offset;
  await ctx.close();
  results.push({ id: job.id, path: await page.video().path(), offset, length });
}
await browser.close();
console.log(JSON.stringify(results));
"""


def sh(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode:
        sys.exit(f"FAILED: {' '.join(map(str, cmd))[:300]}\n{r.stderr[-2500:]}")
    return r.stdout


def duration(path):
    return float(sh(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)]).strip())


def enc(*args):
    return ["-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-r", str(FPS), *args]


def read_script():
    text = (HERE / "script.md").read_text()
    parts = re.split(r"^## .*$", text, flags=re.M)[1:]
    return [re.sub(r"\n\s*End \[.*", "", p).strip().replace("\n", " ") for p in parts]


async def tts(sections):
    for i, text in enumerate(sections):
        path = WORK / f"vo{i}.mp3"
        if not path.exists() or path.stat().st_size < 2000:
            await edge_tts.Communicate(text, VOICE, rate=RATE, proxy=os.environ.get("HTTPS_PROXY") or None).save(str(path))


def card(path, lines):
    img = Image.new("RGB", (1920, 1080))
    px = img.load()
    for y in range(1080):
        for x in range(0, 1920, 4):
            t = (x / 1920) * 0.55 + (y / 1080) * 0.45
            c = (int(7 + 12 * t), int(21 + 30 * t), int(42 + 50 * t))
            for k in range(4):
                px[x + k, y] = c
    d = ImageDraw.Draw(img)
    logo = Image.new("RGBA", (120, 120))
    ld = ImageDraw.Draw(logo)
    ld.rounded_rectangle((0, 0, 119, 119), 34, fill=(36, 100, 165))
    ld.arc((30, 34, 90, 94), 180, 360, fill="white", width=10)
    ld.line((30, 64, 30, 88), fill="white", width=10)
    ld.ellipse((80, 74, 100, 94), fill=(201, 234, 243))
    total = sum(size + gap for _, size, _, gap in lines)
    y = (1080 - total - 150) // 2
    img.paste(logo, ((1920 - 120) // 2, y), logo)
    y += 160
    for text, size, weight, gap in lines:
        f = ImageFont.truetype(str(FONTS / f"Geist-{weight}.ttf"), size)
        w = d.textlength(text, font=f)
        d.text(((1920 - w) / 2, y), text, font=f, fill=(244, 250, 255) if weight != "Regular" else (185, 207, 226))
        y += size + gap
    img.save(path)


def ass_time(t):
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def chunks(text):
    out = []
    for s in re.split(r"(?<=[.?!])\s+", text):
        while len(s) > 84:
            cut = s.rfind(", ", 0, 84)
            cut = cut if cut > 30 else s.rfind(" ", 0, 84)
            out.append(s[: cut + (1 if s[cut] == "," else 0)].strip())
            s = s[cut + 1:].strip()
        if s:
            out.append(s)
    return out


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    texts = read_script()
    assert len(texts) == len(SECTIONS), f"script has {len(texts)} sections, plan has {len(SECTIONS)}"
    words = sum(len(t.split()) for t in texts)
    print(f"[1/6] voiceover: {words} words, {len(texts)} sections")
    asyncio.run(tts(texts))
    vo = [duration(WORK / f"vo{i}.mp3") for i in range(len(texts))]
    sec_len = [v + GAP_S for v in vo]

    print("[2/6] capturing the live site")
    jobs = []
    for i, segs in enumerate(SECTIONS):
        scale = sec_len[i] / sum(s["secs"] for s in segs)
        for j, s in enumerate(segs):
            s["len"] = s["secs"] * scale
            if "web" in s:
                steps = [{**st, **({"ms": int(st["ms"] * scale)} if "ms" in st else {}), **({"wait": int(st["wait"] * scale)} if "wait" in st else {})} for st in s["steps"]]
                jobs.append({"id": f"{i}-{j}", "url": SITE + s["web"], "secs": s["len"], "steps": steps, "pre": s.get("pre", []), "dir": str(WORK / "rec")})
    cap = WORK / "capture.json"
    if not cap.exists():
        js = ROOT / ".demo-capture.mjs"
        js.write_text(CAPTURE_JS)
        try:
            cap.write_text(sh(["node", str(js), json.dumps(jobs), CHROME], cwd=ROOT).strip().splitlines()[-1])
        finally:
            js.unlink(missing_ok=True)
    recs = {r["id"]: r for r in json.loads(cap.read_text())}

    print("[3/6] building sections")
    norm = f"fps={FPS},scale=1920:1080:flags=lanczos,setsar=1"
    parts = []
    card(WORK / "title.png", [("Arcway", 140, "Bold", 30), ("Paid onboarding for Arc", 52, "Medium", 26), ("Find Arc apps. Take real first steps. Get paid in USDC.", 36, "Regular", 0)])
    card(WORK / "end.png", [("Arcway", 130, "Bold", 34), ("arcway.world", 64, "SemiBold", 34), ("Timi Labs", 42, "Medium", 22), ("Built with Arc Studio · Live on Arc mainnet", 34, "Regular", 0)])
    for name, secs in (("title", TITLE_S), ("end", END_S)):
        sh(["ffmpeg", "-y", "-loop", "1", "-i", WORK / f"{name}.png", "-t", str(secs), "-vf", f"{norm},fade=t=in:st=0:d=0.4" + (",fade=t=out:st=%.2f:d=0.6" % (secs - 0.6) if name == "end" else ""), *enc(), WORK / f"{name}.mp4"])
    for i, segs in enumerate(SECTIONS):
        clips = []
        for j, s in enumerate(segs):
            clip = WORK / f"s{i}-{j}.mp4"
            if "still" in s:
                n = int(s["len"] * FPS) + 1
                sh(["ffmpeg", "-y", "-loop", "1", "-i", DEMO / s["still"], "-t", f"{s['len']:.3f}", "-vf",
                    f"scale=3840:-2,zoompan=z='1+0.05*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s=1920x1080:fps={FPS},setsar=1", *enc(), clip])
            else:
                r = recs[f"{i}-{j}"]
                sh(["ffmpeg", "-y", "-ss", f"{r['offset']:.3f}", "-i", r["path"], "-t", f"{r['length']:.3f}", "-vf", norm, "-an", *enc(), clip])
            clips.append(clip)
        lst = WORK / f"s{i}.txt"
        lst.write_text("".join(f"file '{c}'\n" for c in clips))
        joined = WORK / f"s{i}-joined.mp4"
        sh(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", joined])
        have, want = duration(joined), sec_len[i]
        fit = f"setpts=PTS*{want / have:.5f}" if have > want else f"tpad=stop_mode=clone:stop_duration={want - have + 0.1:.3f}"
        sh(["ffmpeg", "-y", "-i", joined, "-vf", f"{fit},trim=duration={want:.3f},setpts=PTS-STARTPTS", "-an", *enc(), WORK / f"sec{i}.mp4"])
        parts.append(WORK / f"sec{i}.mp4")
        print(f"      section {i + 1}: voice {vo[i]:.1f}s, footage {have:.1f}s -> {want:.1f}s")

    print("[4/6] audio and subtitles")
    wavs = []
    sh(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", str(TITLE_S), WORK / "pre.wav"])
    sh(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", str(END_S), WORK / "post.wav"])
    for i in range(len(texts)):
        sh(["ffmpeg", "-y", "-i", WORK / f"vo{i}.mp3", "-af", f"aresample=48000,apad=whole_dur={sec_len[i]:.3f}", "-ac", "2", "-t", f"{sec_len[i]:.3f}", WORK / f"vo{i}.wav"])
        wavs.append(WORK / f"vo{i}.wav")
    alst = WORK / "audio.txt"
    alst.write_text("".join(f"file '{p}'\n" for p in [WORK / "pre.wav", *wavs, WORK / "post.wav"]))
    sh(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", alst, "-c", "copy", WORK / "voice.wav"])

    events, t = [], TITLE_S
    for i, text in enumerate(texts):
        cs = chunks(text)
        total = sum(len(c) for c in cs)
        start = t
        for c in cs:
            dur = vo[i] * len(c) / total
            events.append(f"Dialogue: 0,{ass_time(start)},{ass_time(start + dur - 0.05)},Sub,,0,0,0,,{c}")
            start += dur
        t += sec_len[i]
    (WORK / "subs.ass").write_text(f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Geist SemiBold,46,&H00FFFFFF,&H00FFFFFF,&H5A0B1F3A,&H96000000,0,0,0,0,100,100,0,0,3,14,0,2,220,220,64,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + "\n".join(events) + "\n")

    print("[5/6] assembling")
    vlst = WORK / "video.txt"
    vlst.write_text("".join(f"file '{p}'\n" for p in [WORK / "title.mp4", *parts, WORK / "end.mp4"]))
    sh(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", vlst, "-c", "copy", WORK / "video.mp4"])
    OUT.mkdir(exist_ok=True)
    final, vertical = OUT / "demo_final.mp4", OUT / "demo_vertical.mp4"
    sh(["ffmpeg", "-y", "-i", WORK / "video.mp4", "-i", WORK / "voice.wav",
        "-vf", f"ass={WORK / 'subs.ass'}:fontsdir={FONTS}",
        "-af", "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-r", str(FPS),
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-shortest", final])
    sh(["ffmpeg", "-y", "-i", final, "-filter_complex",
        "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=24:2,eq=brightness=-0.12[bg];[0:v]scale=1080:-2[fg];[bg][fg]overlay=0:(H-h)/2",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-pix_fmt", "yuv420p", "-r", str(FPS), "-c:a", "copy", "-movflags", "+faststart", vertical])

    print("[6/6] verify")
    for f in (final, vertical):
        info = json.loads(sh(["ffprobe", "-v", "error", "-show_entries", "format=duration,size:stream=codec_type,codec_name,width,height,sample_rate", "-of", "json", f]))
        v = next(s for s in info["streams"] if s["codec_type"] == "video")
        a = next(s for s in info["streams"] if s["codec_type"] == "audio")
        loud = subprocess.run(["ffmpeg", "-nostats", "-i", f, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
        lufs = re.findall(r"I:\s+(-?[\d.]+) LUFS", loud)[-1]
        print(f"  {f}\n    {float(info['format']['duration']):.1f}s · {v['width']}x{v['height']} {v['codec_name']} · {a['codec_name']} {a['sample_rate']} Hz · {lufs} LUFS · {int(info['format']['size']) / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
