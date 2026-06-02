#!/usr/bin/env python3
"""Retag reference images with WD14 and remap Why WDC keyword images.

This is a one-off audit/remapping utility, not a site build pipeline.
"""

from __future__ import annotations

import csv
import hashlib
import json
import math
import re
import shutil
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import onnxruntime as ort
from huggingface_hub import hf_hub_download
from PIL import Image


PROJECT = Path(__file__).resolve().parents[2]
SITE = PROJECT / "site"
PAGE = SITE / "pages" / "03-why-wdc"
MANIFEST = SITE / "_meta" / "media-selection-manifest.json"
CLASSIFICATION = SITE / "_meta" / "media-classification.md"
TAG_ROOT = PROJECT / "references" / "media" / "wd14-tags" / "high-sensitivity-20260521"
REPORT_JSON = SITE / "_meta" / "why-wdc-wd14-match-report.json"
REPORT_MD = SITE / "_meta" / "why-wdc-wd14-match-report.md"

MODEL_REPO = "SmilingWolf/wd-v1-4-vit-tagger-v2"
THRESHOLD = 0.10
SOURCE_WEIGHT = 0.32
TAG_WEIGHT = 0.68

EXCLUDED_SOURCE_FRAGMENTS = {
    # Large visible text overlay; WD14 did not classify it as text.
    "311-ig-image-000050likes-cg-wtkvuyfz",
}


KOREAN_HINTS = {
    "광안리": "gwangalli beach bridge ocean night city lights",
    "광안대교": "gwangalli bridge night city lights ocean",
    "부산야경": "busan night city lights skyline bridge",
    "부산바다": "busan sea ocean coast beach water",
    "스카이캡슐": "sky capsule train rail railroad_tracks coast ocean",
    "해운대": "haeundae beach ocean skyline city",
    "감천": "gamcheon village colorful buildings street",
    "감천문화마을": "gamcheon village colorful buildings street",
    "다대포": "dadaepo sunset beach ocean sky",
    "청사포": "cheongsapo train rail ocean coast village",
    "용궁사": "yonggungsa temple cliff coast ocean rock",
    "태종대": "taejongdae cliff coast ocean rock",
    "흰여울": "huinnyeoul village cliff coast ocean street",
    "카페": "cafe window ocean food table indoor",
    "시장": "market food street people",
    "부산항": "busan port harbor ship ocean city",
}


QUERY_HINTS = {
    "world design capital": "cityscape architecture building skyline harbor night bridge public space",
    "inclusive city": "people crowd walking street public city beach open space",
    "citizen-led design": "people crowd street village market public walking community",
    "service design": "street road walkway path train rail sign people everyday",
    "urban recovery": "village street colorful buildings cityscape architecture stairs",
    "connectivity": "bridge train rail railroad road harbor ocean cityscape skyline",
    "design culture": "architecture museum building city night lights public art",
    "resilient coast": "ocean sea water coast beach shore rock wave sky",
    "global design hub": "harbor port cityscape skyline bridge ocean waterfront",
    "quality of life": "cafe food table window ocean people indoor comfort",
    "pastel sea": "ocean sea water beach sky cloud pastel blue scenery",
    "blue line": "train rail railroad_tracks ocean coast sky capsule",
    "sky capsule": "train rail vehicle railroad_tracks sky ocean coast yellow",
    "cheongsapo rhythm": "train rail railroad_tracks ocean coast village sky",
    "gwangalli glow": "bridge night city lights beach ocean skyline",
    "dadaepo afterglow": "sunset beach ocean sky orange cloud silhouette",
    "yonggungsa cliff": "temple shrine cliff rock ocean coast water",
    "huinnyeoul edge": "village cliff ocean coast street buildings white",
    "gamcheon palette": "colorful village buildings street stairs cityscape",
    "harbor light": "harbor port bridge night city lights skyline ocean",
    "film city": "city night lights building architecture street scene",
    "ocean cafe": "cafe table window ocean beach food indoor",
    "walking city": "street walking people road city sidewalk path",
    "local market": "market food street people shop vendor",
    "night food": "food market night street lights table restaurant",
    "k-culture route": "people street city travel food sign night",
    "saved scene": "scenery ocean cityscape sky bridge sunset",
    "revisit loop": "travel road train beach ocean memory scenery",
    "afterglow": "sunset sky orange cloud ocean beach silhouette",
    "return desire": "beach ocean bridge city lights scenery travel",
    "memory map": "street road path city village ocean scenery",
    "travel feed": "travel scenery beach ocean cityscape street",
    "second look": "hidden street detail building alley village",
    "comfort city": "cafe beach ocean people city skyline soft",
    "lingering blue": "blue ocean sea sky water beach cloud",
    "scene replay": "scenery cityscape ocean bridge night travel",
    "design busan": "busan city architecture ocean bridge skyline building",
    "north port future": "port harbor ship ocean city skyline waterfront",
    "f1963 texture": "architecture building industrial texture brick metal",
    "bongsan village": "village street building alley people local",
    "public design": "public space architecture building street people city",
    "solidarity": "people crowd group street city community",
    "sustainable coast": "coast ocean sea water greenery sky nature",
    "everyday design": "street people city food cafe daily",
    "open sea": "open ocean sea water sky horizon beach",
    "photo-worthy route": "scenery travel photo beach bridge cityscape",
    "unfinished trip": "travel road train ocean sunset beach",
    "busan syndrome": "travel beach ocean bridge city lights scenery memory",
}


STOP_WORDS = {
    "and",
    "the",
    "of",
    "to",
    "a",
    "an",
    "for",
    "with",
    "by",
    "in",
    "on",
    "at",
    "as",
    "or",
    "official",
    "title",
    "open",
    "shared",
}


@dataclass
class KeywordItem:
    target: str
    image: str
    left: str
    right: str
    query: set[str]


@dataclass
class Candidate:
    path: Path
    rel: str
    sha256: str
    tag_file: str
    tags: list[tuple[str, float]]
    tag_text: str
    source_tokens: set[str]
    size: tuple[int, int]


def slug(text: str) -> str:
    text = re.sub(r"[^0-9A-Za-z가-힣_-]+", "-", text).strip("-").lower()
    return text[:96] or "image"


def tokenize(text: str) -> set[str]:
    text = text.lower().replace("_", " ").replace("-", " ")
    tokens = set(re.findall(r"[a-z0-9가-힣]+", text))
    expanded = set(tokens)
    joined = " ".join(tokens)
    for key, value in KOREAN_HINTS.items():
        if key in text or key in joined:
            expanded.update(tokenize(value))
    return {t for t in expanded if len(t) > 1 and t not in STOP_WORDS}


def query_terms(left: str, right: str) -> set[str]:
    terms = tokenize(f"{left} {right}")
    for key, value in QUERY_HINTS.items():
        if key in f"{left} {right}".lower():
            terms.update(tokenize(value))
    return terms


def load_keyword_items() -> list[KeywordItem]:
    manifest = json.loads(MANIFEST.read_text())
    items = manifest["pages"]["03-why-wdc"]["items"]
    return [
        KeywordItem(
            target=item["target"],
            image=item["image"],
            left=item["left"],
            right=item["right"],
            query=query_terms(item["left"], item["right"]),
        )
        for item in items
    ]


def iter_source_images() -> list[Path]:
    roots = [
        PROJECT / "references" / "media" / "reference-media" / "images",
        PROJECT / "references" / "media" / "review",
    ]
    out: list[Path] = []
    for root in roots:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if path.name.lower().startswith("contact-sheet"):
                continue
            if any(fragment in path.as_posix() for fragment in EXCLUDED_SOURCE_FRAGMENTS):
                continue
            if path.is_file() and path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
                out.append(path)
    return sorted(out)


def file_sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def prepare_image(path: Path, size: int) -> np.ndarray:
    with Image.open(path) as im:
        im = im.convert("RGBA")
        bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
        bg.alpha_composite(im)
        im = bg.convert("RGB")
        canvas_size = max(im.size)
        canvas = Image.new("RGB", (canvas_size, canvas_size), (255, 255, 255))
        canvas.paste(im, ((canvas_size - im.width) // 2, (canvas_size - im.height) // 2))
        canvas = canvas.resize((size, size), Image.Resampling.LANCZOS)
    arr = np.asarray(canvas, dtype=np.float32)
    arr = arr[:, :, ::-1]
    return np.expand_dims(arr, 0)


def load_wd14():
    model_path = hf_hub_download(MODEL_REPO, "model.onnx")
    tags_path = hf_hub_download(MODEL_REPO, "selected_tags.csv")
    session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
    input_meta = session.get_inputs()[0]
    input_name = input_meta.name
    target_size = int(input_meta.shape[1])
    rows = []
    with open(tags_path, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return session, input_name, target_size, rows


def tag_candidates() -> list[Candidate]:
    TAG_ROOT.mkdir(parents=True, exist_ok=True)
    cache_path = TAG_ROOT / "wd14-tags.json"
    paths_by_sha = {}
    for path in iter_source_images():
        sha = file_sha(path)
        paths_by_sha.setdefault(sha, path)

    if cache_path.exists():
        cached = json.loads(cache_path.read_text())
    else:
        cached = {}

    session, input_name, target_size, tag_rows = load_wd14()
    label_name = session.get_outputs()[0].name
    candidates: list[Candidate] = []
    total = len(paths_by_sha)

    for index, (sha, path) in enumerate(paths_by_sha.items(), 1):
        rel = path.relative_to(PROJECT).as_posix()
        if sha in cached and cached[sha].get("threshold") == THRESHOLD:
            record = cached[sha]
        else:
            print(f"[{index:03d}/{total:03d}] WD14 tagging {rel}", flush=True)
            probs = session.run([label_name], {input_name: prepare_image(path, target_size)})[0][0]
            tags = []
            for row, prob in zip(tag_rows, probs):
                category = int(row.get("category") or 0)
                if category == 9:
                    continue
                value = float(prob)
                if value >= THRESHOLD:
                    tags.append((row["name"], value))
            tags.sort(key=lambda item: item[1], reverse=True)
            with Image.open(path) as im:
                size = im.size
            tag_name = f"{sha[:12]}-{slug(path.stem)}.txt"
            tag_rel = (TAG_ROOT / tag_name).relative_to(PROJECT).as_posix()
            record = {
                "source": rel,
                "sha256": sha,
                "threshold": THRESHOLD,
                "model": MODEL_REPO,
                "tag_file": tag_rel,
                "size": list(size),
                "tags": [{"name": name, "score": score} for name, score in tags],
            }
            cached[sha] = record
            tag_text = ", ".join(name for name, _ in tags)
            (TAG_ROOT / tag_name).write_text(
                "\n".join(
                    [
                        f"# source: {rel}",
                        f"# model: {MODEL_REPO}",
                        f"# threshold: {THRESHOLD}",
                        tag_text,
                        "",
                    ]
                )
            )
            cache_path.write_text(json.dumps(cached, ensure_ascii=False, indent=2))

        tags = [(t["name"], float(t["score"])) for t in record["tags"]]
        tag_text = " ".join(name.replace("_", " ") for name, _ in tags)
        source_tokens = tokenize(record["source"])
        candidates.append(
            Candidate(
                path=PROJECT / record["source"],
                rel=record["source"],
                sha256=sha,
                tag_file=record["tag_file"],
                tags=tags,
                tag_text=tag_text,
                source_tokens=source_tokens,
                size=tuple(record["size"]),
            )
        )

    cache_path.write_text(json.dumps(cached, ensure_ascii=False, indent=2))
    return candidates


def score_tag(query: set[str], candidate: Candidate) -> float:
    if not query:
        return 0.0
    tag_scores = {}
    for tag, prob in candidate.tags:
        tag_tokens = tokenize(tag)
        for token in tag_tokens:
            tag_scores[token] = max(tag_scores.get(token, 0.0), prob)
    total = 0.0
    for token in query:
        best = tag_scores.get(token, 0.0)
        for tag_token, prob in tag_scores.items():
            if token in tag_token or tag_token in token:
                best = max(best, prob * 0.72)
        total += best
    return total / math.sqrt(len(query))


def score_source(query: set[str], candidate: Candidate) -> float:
    if not query:
        return 0.0
    overlap = len(query & candidate.source_tokens)
    soft = 0
    for token in query:
        if any(token in src or src in token for src in candidate.source_tokens):
            soft += 1
    return (overlap + 0.35 * soft) / math.sqrt(len(query))


def total_score(keyword: KeywordItem, candidate: Candidate) -> tuple[float, float, float]:
    visual = score_tag(keyword.query, candidate)
    source = score_source(keyword.query, candidate)
    total = TAG_WEIGHT * visual + SOURCE_WEIGHT * source
    return total, visual, source


def assign_images(keywords: list[KeywordItem], candidates: list[Candidate]):
    all_pairs = []
    for ki, keyword in enumerate(keywords):
        for ci, candidate in enumerate(candidates):
            score, visual, source = total_score(keyword, candidate)
            all_pairs.append((score, visual, source, ki, ci))
    all_pairs.sort(reverse=True, key=lambda row: row[0])

    assigned_keywords = set()
    assigned_candidates = set()
    assignments = {}
    for score, visual, source, ki, ci in all_pairs:
        if ki in assigned_keywords or ci in assigned_candidates:
            continue
        assignments[ki] = {
            "candidate": candidates[ci],
            "score": score,
            "wd14Score": visual,
            "sourceHintScore": source,
            "topAlternatives": [],
        }
        assigned_keywords.add(ki)
        assigned_candidates.add(ci)
        if len(assigned_keywords) == len(keywords):
            break

    for ki, keyword in enumerate(keywords):
        ranked = []
        for ci, candidate in enumerate(candidates):
            score, visual, source = total_score(keyword, candidate)
            ranked.append((score, visual, source, candidate))
        ranked.sort(reverse=True, key=lambda row: row[0])
        assignments[ki]["topAlternatives"] = [
            {
                "source": cand.rel,
                "score": round(score, 4),
                "wd14Score": round(visual, 4),
                "sourceHintScore": round(source, 4),
                "tags": [name for name, _ in cand.tags[:12]],
            }
            for score, visual, source, cand in ranked[:8]
        ]

    return assignments


def copy_image(source: Path, target: Path):
    with Image.open(source) as im:
        im = im.convert("RGB")
        im.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        im.save(target, "WEBP", quality=92, method=6)


def update_manifest(keywords: list[KeywordItem], assignments):
    manifest = json.loads(MANIFEST.read_text())
    items = []
    for index, keyword in enumerate(keywords):
        match = assignments[index]
        cand: Candidate = match["candidate"]
        target = PAGE / keyword.image
        copy_image(cand.path, target)
        with Image.open(target) as im:
            size = list(im.size)
        items.append(
            {
                "target": keyword.target,
                "image": keyword.image,
                "left": keyword.left,
                "right": keyword.right,
                "matchKeywords": sorted(keyword.query),
                "size": size,
                "source": cand.rel,
                "sourceSize": list(cand.size),
                "sha256": cand.sha256,
                "wd14TagFile": cand.tag_file,
                "wd14TopTags": [
                    {"name": name, "score": round(score, 4)} for name, score in cand.tags[:18]
                ],
                "matchScore": round(match["score"], 4),
                "wd14Score": round(match["wd14Score"], 4),
                "sourceHintScore": round(match["sourceHintScore"], 4),
            }
        )
    section = manifest["pages"]["03-why-wdc"]
    section["policy"] = (
        "48 why-WDC / Busan-revisit keywords remapped by high-sensitivity WD14 tags, "
        "with source filename/place hints used as a secondary tie-breaker"
    )
    section["wd14"] = {
        "model": MODEL_REPO,
        "threshold": THRESHOLD,
        "tagWeight": TAG_WEIGHT,
        "sourceHintWeight": SOURCE_WEIGHT,
        "tagDirectory": TAG_ROOT.relative_to(PROJECT).as_posix(),
        "report": REPORT_JSON.relative_to(PROJECT).as_posix(),
    }
    section["count"] = len(items)
    section["items"] = items
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    return items


def update_classification(items):
    md = CLASSIFICATION.read_text()
    table = [
        "## Dual-Wave Keywords",
        "",
        "| Left Keyword | Right Keyword | Image | Source | WD14 top tags |",
        "| --- | --- | --- | --- | --- |",
    ]
    for item in items:
        tags = ", ".join(tag["name"] for tag in item["wd14TopTags"][:6])
        table.append(
            f"| {item['left']} | {item['right']} | `{item['image']}` | "
            f"`{item['source']}` | {tags} |"
        )
    table.append("")
    replacement = "\n".join(table)
    md = re.sub(
        r"## Dual-Wave Keywords\n.*?\n## Horizontal People Feed",
        replacement + "\n## Horizontal People Feed",
        md,
        flags=re.S,
    )
    CLASSIFICATION.write_text(md)


def write_reports(keywords: list[KeywordItem], assignments, items):
    rows = []
    for index, keyword in enumerate(keywords):
        match = assignments[index]
        cand: Candidate = match["candidate"]
        rows.append(
            {
                "index": index + 1,
                "left": keyword.left,
                "right": keyword.right,
                "image": keyword.image,
                "source": cand.rel,
                "wd14TagFile": cand.tag_file,
                "score": round(match["score"], 4),
                "wd14Score": round(match["wd14Score"], 4),
                "sourceHintScore": round(match["sourceHintScore"], 4),
                "selectedTags": [name for name, _ in cand.tags[:18]],
                "topAlternatives": match["topAlternatives"],
            }
        )
    REPORT_JSON.write_text(
        json.dumps(
            {
                "model": MODEL_REPO,
                "threshold": THRESHOLD,
                "tagWeight": TAG_WEIGHT,
                "sourceHintWeight": SOURCE_WEIGHT,
                "items": rows,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    lines = [
        "# Why WDC WD14 Match Report",
        "",
        f"- Model: `{MODEL_REPO}`",
        f"- Threshold: `{THRESHOLD}`",
        f"- WD14 tag weight: `{TAG_WEIGHT}`",
        f"- Source filename/place hint weight: `{SOURCE_WEIGHT}`",
        "",
        "| # | Keyword | Image | Source | Score | Top WD14 tags |",
        "| ---: | --- | --- | --- | ---: | --- |",
    ]
    for row in rows:
        tags = ", ".join(row["selectedTags"][:8])
        lines.append(
            f"| {row['index']} | {row['left']} / {row['right']} | `{row['image']}` | "
            f"`{row['source']}` | {row['score']:.4f} | {tags} |"
        )
    REPORT_MD.write_text("\n".join(lines) + "\n")


def main():
    keywords = load_keyword_items()
    candidates = tag_candidates()
    print(f"Loaded {len(candidates)} unique candidate images.", flush=True)
    assignments = assign_images(keywords, candidates)
    items = update_manifest(keywords, assignments)
    update_classification(items)
    write_reports(keywords, assignments, items)
    print(f"Updated {len(items)} Why WDC images.", flush=True)
    print(f"Report: {REPORT_JSON.relative_to(PROJECT).as_posix()}", flush=True)


if __name__ == "__main__":
    main()
