# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML/CSS educational project for a university course (동서대학교 디지털퍼블리싱). Contains standalone HTML pages demonstrating various web layout and styling techniques. No build tools, frameworks, or JavaScript — pure HTML and CSS only.

## Architecture

Each HTML page is a self-contained exercise/example:

- **index.html** — "담소" Korean food cafe menu page (main page, uses `css/style.css`)
- **news.html** — News article card layout with flexbox and RGBA styling (`css/news.css`)
- **figma.html** — Figma-to-code export: absolute-positioned newspaper-style two-column layout (inline styles)
- **float_layout.html** — Float-based layout exercise (inline styles)
- **layout_1200.html** — Fixed 1200px page layout with BTS theme, uses background images from `images/bts/` (inline styles)
- **radious.html** — Border-radius variations exercise (`css/radious.css`)

## Conventions

- Language: Korean (`lang="ko"`) throughout all pages
- CSS is split between external files in `css/` and inline `<style>` blocks depending on the exercise
- Images stored in `images/` (food photos) and `images/bts/` (layout assets)
- No responsive design on most pages — fixed-width layouts are intentional for the exercises
- Font: Nanum Gothic (external pages), Noto Sans KR (figma export), system fonts (layout exercises)

## Development

No build step. Open HTML files directly in a browser. No package manager or dependencies.
