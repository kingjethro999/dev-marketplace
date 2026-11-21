#!/usr/bin/env python3
import os
import shutil
import subprocess
import json
import re

DEV_SPACE = "/home/japheth/Desktop/dev-space"
SKILLS_DIR = os.path.join(DEV_SPACE, "skills")
REGISTRY_FILE = os.path.join(DEV_SPACE, "registry.json")

os.makedirs(SKILLS_DIR, exist_ok=True)

SOURCES = {
    "claude_skills": "/home/japheth/.claude/skills",
    "superpowers": "/home/japheth/.gemini/config/plugins/superpowers/skills",
    "claude_plugins": "/home/japheth/.claude/plugins/marketplaces/claude-plugins-official/plugins"
}

def parse_frontmatter(file_path):
    desc = ""
    name = ""
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read(8192)
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                for line in parts[1].strip().split("\n"):
                    if ":" in line:
                        k, v = line.split(":", 1)
                        k = k.strip()
                        v = v.strip().strip('"').strip("'")
                        if k == "name":
                            name = v
                        elif k == "description":
                            desc = v
    except Exception:
        pass
    return name, desc

def categorize(name, desc, item_type):
    n = name.lower()
    d = desc.lower()
    
    if "-lsp" in n or "mcp" in n or "tunnel" in n or "connector" in n:
        return "Connectors & LSP"
    if any(k in n for k in ["animat", "video", "motion", "sound", "voice", "audio", "subtitle", "dubbing", "thumbnail", "slideshow", "remotion", "hyperframes", "ffmpeg", "blender", "media", "nle"]):
        return "Video & Motion"
    if any(k in n for k in ["apple-design", "figma", "design", "impeccable", "improve", "ui", "gestures", "taste", "landing-page", "prototype", "break-ui", "emil-"]):
        return "Design & UI"
    if any(k in n for k in ["review", "test", "debug", "verification", "security", "hardening", "audit", "qc"]):
        return "Code Review & Quality"
    if any(k in n for k in ["planning", "plans", "worktree", "dispatch", "executing", "subagent", "ralph", "commit", "hook", "session", "modernization", "superpowers"]):
        return "Engineering & Workflow"
    return "Developer Tools & AI"

def extract_tags(name, desc, category):
    tags = set([category.lower().replace(" & ", "-").replace(" ", "-")])
    for word in re.findall(r'[a-zA-Z0-9_-]+', name.lower()):
        if len(word) > 2:
            tags.add(word)
    if "lsp" in name.lower():
        tags.add("lsp")
        tags.add("code-intelligence")
    if "video" in name.lower() or "motion" in name.lower() or "remotion" in name.lower():
        tags.add("video")
        tags.add("media")
    return sorted(list(tags))[:6]

def copy_folder_dereference(src_dir, dst_dir):
    os.makedirs(dst_dir, exist_ok=True)
    for root, dirs, files in os.walk(src_dir, followlinks=True):
        rel_path = os.path.relpath(root, src_dir)
        target_root = os.path.join(dst_dir, rel_path) if rel_path != "." else dst_dir
        os.makedirs(target_root, exist_ok=True)
        
        for d in dirs:
            os.makedirs(os.path.join(target_root, d), exist_ok=True)
            
        for f in files:
            # Skip git files, node_modules, cache
            if f.endswith(".pyc") or f == ".DS_Store" or "/.git" in root or "/node_modules" in root:
                continue
            src_file = os.path.join(root, f)
            dst_file = os.path.join(target_root, f)
            try:
                if os.path.islink(src_file):
                    real_file = os.path.realpath(src_file)
                    if os.path.exists(real_file):
                        shutil.copy2(real_file, dst_file)
                else:
                    shutil.copy2(src_file, dst_file)
            except Exception as e:
                print(f"  Warning copying {src_file}: {e}")

# Collect inventory
inventory = {}

# 1. Claude skills
if os.path.exists(SOURCES["claude_skills"]):
    for name in sorted(os.listdir(SOURCES["claude_skills"])):
        p = os.path.realpath(os.path.join(SOURCES["claude_skills"], name))
        skill_file = os.path.join(p, "SKILL.md")
        if os.path.exists(skill_file):
            fm_name, desc = parse_frontmatter(skill_file)
            inventory[name] = {
                "name": name,
                "source": p,
                "description": desc or f"Agent skill for {name}",
                "type": "skill"
            }

# 2. Superpowers
if os.path.exists(SOURCES["superpowers"]):
    for name in sorted(os.listdir(SOURCES["superpowers"])):
        p = os.path.realpath(os.path.join(SOURCES["superpowers"], name))
        skill_file = os.path.join(p, "SKILL.md")
        if os.path.exists(skill_file) and name not in inventory:
            fm_name, desc = parse_frontmatter(skill_file)
            inventory[name] = {
                "name": name,
                "source": p,
                "description": desc or f"Superpower workflow skill for {name}",
                "type": "superpower"
            }

# 3. Connectors & Plugins
plugin_items = [
    "clangd-lsp", "csharp-lsp", "gopls-lsp", "jdtls-lsp", "kotlin-lsp", "lua-lsp",
    "php-lsp", "pyright-lsp", "ruby-lsp", "rust-analyzer-lsp", "swift-lsp", "typescript-lsp",
    "mcp-server-dev", "mcp-tunnels", "hookify", "ralph-loop", "pr-review-toolkit",
    "code-modernization", "commit-commands", "session-report", "claude-security",
    "claude-md-management", "feature-dev"
]

for name in plugin_items:
    p = os.path.realpath(os.path.join(SOURCES["claude_plugins"], name))
    if os.path.exists(p) and name not in inventory:
        readme_file = os.path.join(p, "README.md")
        desc = ""
        if os.path.exists(readme_file):
            with open(readme_file, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#"):
                        desc = line
                        break
        inventory[name] = {
            "name": name,
            "source": p,
            "description": desc or f"Connector and tooling for {name}",
            "type": "connector"
        }

print(f"Total skills & connectors to import: {len(inventory)}")

registry_list = []
total = len(inventory)
current = 0

for name, meta in sorted(inventory.items()):
    current += 1
    src = meta["source"]
    dest = os.path.join(SKILLS_DIR, name)
    cat = categorize(name, meta["description"], meta["type"])
    tags = extract_tags(name, meta["description"], cat)
    
    print(f"[{current}/{total}] Importing {name} ({cat})...")
    copy_folder_dereference(src, dest)
    
    # Ensure SKILL.md exists
    skill_md_path = os.path.join(dest, "SKILL.md")
    if not os.path.exists(skill_md_path):
        # Generate SKILL.md for connectors
        content = f"""---
name: {name}
description: {meta['description']}
category: {cat}
---

# {name}

{meta['description']}

## Overview
This connector provides seamless integration and agent capabilities for `{name}`.

## Usage
Refer to the included documentation and configuration files in this directory.
"""
        with open(skill_md_path, "w", encoding="utf-8") as f:
            f.write(content)
            
    files = [f for f in os.listdir(dest) if not f.startswith(".")]
    
    registry_list.append({
        "name": name,
        "title": name.replace("-", " ").title(),
        "description": meta["description"],
        "category": cat,
        "path": f"skills/{name}",
        "tags": tags,
        "files": files[:10]
    })
    
    # Git add and commit
    try:
        subprocess.run(["git", "add", f"skills/{name}"], cwd=DEV_SPACE, check=True)
        commit_msg = f"feat(skill): add {name} ({cat})"
        subprocess.run(["git", "commit", "-m", commit_msg], cwd=DEV_SPACE, check=True)
    except subprocess.CalledProcessError as e:
        # Might already be committed or nothing changed
        pass

# Save registry.json
with open(REGISTRY_FILE, "w", encoding="utf-8") as f:
    json.dump(registry_list, f, indent=2)

print(f"\n✓ Successfully imported and committed {len(registry_list)} skills!")
print(f"✓ Registry written to {REGISTRY_FILE}")
EOF
