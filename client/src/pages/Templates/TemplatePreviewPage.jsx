import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * SPYRIX Invoice Studio — full React implementation.
 * All UI, styles and behavior are in this JSX file. No iframe and no CSS import.
 *
 * Use:
 * import TemplatePreviewPage from "./pages/Templates/TemplatePreviewPage";
 * <TemplatePreviewPage />
 */

const STARTER_TEMPLATES = [
  { id: "ruby", name: "Ruby Classic", category: "Classic", color: "#ed0018", kind: "ruby" },
  { id: "rose", name: "Rose Modern", category: "Modern", color: "#e52e72", kind: "rose" },
  { id: "midnight", name: "Midnight", category: "Minimal", color: "#17151b", kind: "midnight" },
  { id: "ocean", name: "Ocean Blue", category: "Modern", color: "#1687f8", kind: "ocean" },
  { id: "fresh", name: "Fresh Green", category: "Classic", color: "#299e39", kind: "fresh" },
  { id: "gold", name: "Golden Luxe", category: "Minimal", color: "#c57b14", kind: "gold" },
];

const PRIMARY_SWATCHES = ["#ed0018", "#ff3156", "#ce22e8", "#7557ff", "#2196f3", "#8bd43d", "#ff642f", "#111111"];
const SECONDARY_SWATCHES = ["#ed0018", "#ff8396", "#c54cf1", "#6475ff", "#36b4ff", "#a3d95b", "#ff7c36", "#171717"];

const DEFAULT_ITEMS = [
  { id: 1, name: "Web Development", qty: 1, price: 5000 },
  { id: 2, name: "UI/UX Design", qty: 1, price: 3000 },
  { id: 3, name: "Premium Support", qty: 1, price: 2000 },
];

const CURRENCY = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number(value) || 0
  );

const COMPONENT_STYLES = `
*{box-sizing:border-box}
.stb-page{--stb-primary:#ed0018;--stb-secondary:#ff8799;min-height:100vh;width:100%;background:radial-gradient(ellipse at 77% 0%,#ffe8ef 0,transparent 32%),#fffafd;color:#17151b;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;font-size:14px}
.stb-page button,.stb-page input,.stb-page select,.stb-page textarea{font:inherit}
.stb-page button{cursor:pointer}
.stb-shell{min-height:100vh}
.stb-sidebar{position:fixed;z-index:20;inset:0 auto 0 0;width:236px;background:rgba(255,255,255,.9);border-right:1px solid #f2dfe5;padding:19px 14px 14px;display:flex;flex-direction:column;overflow-y:auto}
.stb-brand{height:70px;display:flex;align-items:center;gap:10px;padding:0 9px 13px;flex-shrink:0}
.stb-brand-mark{width:50px;height:49px;display:grid;place-items:center;flex-shrink:0;clip-path:polygon(50% 0,100% 20%,88% 69%,51% 100%,0 78%,11% 31%);background:linear-gradient(140deg,#ff3246,#bd0014);color:#fff;font-size:32px;font-weight:1000;font-style:italic;text-shadow:1px 2px #8d0010}
.stb-brand-word{font-size:24px;line-height:22px;font-weight:950;letter-spacing:-1px;color:#111}
.stb-brand-word span{display:block;color:#d90017;font-size:19px;letter-spacing:0}
.stb-nav{display:grid;gap:4px;margin-top:16px}
.stb-nav-item{height:47px;flex-shrink:0;border:0;background:transparent;border-radius:15px;text-align:left;padding:0 14px;display:flex;align-items:center;gap:13px;font-weight:650;color:#262027;transition:background .16s,color .16s,transform .16s}
.stb-nav-item:hover{background:#fff0f3}
.stb-nav-item.active{background:linear-gradient(110deg,#ff1d32,#d50017);color:#fff;box-shadow:0 5px 13px #ed00183d}
.stb-nav-icon{width:26px;text-align:center;font-size:22px;color:#e0001b;line-height:1}
.stb-nav-item.active .stb-nav-icon{color:#fff}
.stb-upgrade{margin-top:auto;border:1px solid #ff9eae;border-radius:18px;padding:13px 12px;text-align:center;background:linear-gradient(145deg,#fff,#ffe7ed)}
.stb-crown{font-size:31px;line-height:1.2}
.stb-upgrade h3{margin:4px 0;color:#b70012;font-size:15px}
.stb-upgrade p{font-size:12px;line-height:1.5;margin:5px 0 12px}
.stb-primary-btn{background:linear-gradient(110deg,#ff1c31,#c90017);color:#fff;border:0;border-radius:999px;padding:11px 19px;font-weight:800;box-shadow:0 4px 10px #dc001d2e;display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap;transition:transform .15s,filter .15s}
.stb-primary-btn:hover{filter:brightness(1.04);transform:translateY(-1px)}
.stb-theme-switch{display:flex;justify-content:center;align-items:center;gap:17px;padding:19px 0 3px;color:#93808b;font-size:19px}
.stb-toggle{width:42px;height:23px;border-radius:50px;background:#ff142b;display:inline-block;position:relative;border:0;padding:0}
.stb-toggle:after{content:"";position:absolute;width:17px;height:17px;background:white;border-radius:50%;left:22px;top:3px}
.stb-main{margin-left:236px;padding:0 18px 18px;min-width:0}
.stb-topbar{height:90px;display:flex;align-items:center;gap:18px;padding:0 8px}
.stb-search{height:51px;border-radius:30px;background:#fff1f5;border:1px solid #f6dce4;display:flex;align-items:center;gap:12px;padding:0 20px;max-width:475px;flex:1;color:#d60018;box-shadow:inset 0 1px 2px #ed001808}
.stb-search-icon{font-size:26px;font-weight:300;line-height:1}
.stb-search input{background:transparent;border:0;outline:0;width:100%;min-width:0;color:#34242b;font-size:14px}
.stb-top-right{margin-left:auto;display:flex;align-items:center;gap:18px;flex-shrink:0}
.stb-bell{width:46px;height:46px;border:1px solid #f3d9e0;background:#fff;border-radius:50%;font-size:22px;position:relative;color:#b40016;box-shadow:0 3px 8px #9d5b6b10}
.stb-count{position:absolute;right:-2px;top:-3px;background:#ed0018;color:white;border-radius:50%;font-size:11px;padding:4px 6px;border:1px solid white}
.stb-avatar{width:49px;height:49px;border-radius:50%;border:2px solid var(--stb-primary);background:linear-gradient(135deg,#f5d7cc,#38232a);display:grid;place-items:center;color:white;font-size:23px;overflow:hidden}
.stb-profile{font-size:14px;font-weight:850;line-height:1.6;white-space:nowrap}
.stb-profile small{display:block;color:#d40018;font-weight:750}
.stb-chevron{background:transparent;border:0;font-size:18px;color:#73000c}
.stb-hero{height:162px;border-radius:17px;overflow:hidden;position:relative;display:flex;align-items:center;padding:20px 27px;color:white;background:radial-gradient(ellipse at 12% 30%,#ff5666 0,transparent 30%),linear-gradient(110deg,#e90019,#a60012 62%,#f00d25);box-shadow:0 5px 10px #d7001c3a;border:1px solid #ff6c7c}
.stb-hero:before{content:"";position:absolute;inset:-60% -10%;background:repeating-linear-gradient(128deg,transparent 0 62px,#ffffff0b 63px 65px,transparent 66px 110px);transform:rotate(-8deg);pointer-events:none}
.stb-hero-art{width:220px;flex-shrink:0;position:relative;z-index:1;font-size:66px;text-align:center;filter:drop-shadow(0 7px 3px #600)}
.stb-hero-copy{position:relative;z-index:1;flex:1;min-width:0}
.stb-pill{display:inline-flex;align-items:center;background:white;color:#b60015;border-radius:99px;padding:7px 13px;font-size:12px;font-weight:850;margin-bottom:8px}
.stb-hero h1{font-size:30px;line-height:1.1;margin:0 0 7px;letter-spacing:-.8px}
.stb-hero p{margin:0;font-size:16px}
.stb-hero-features{position:relative;z-index:1;border-left:1px solid #ffffff55;padding-left:42px;min-width:230px;font-size:16px;line-height:1.9;white-space:nowrap}
.stb-hero-features div:before{content:"✓";display:inline-grid;place-items:center;background:#ffcf00;color:#a90012;border:2px solid white;border-radius:50%;width:21px;height:21px;font-weight:950;font-size:14px;margin-right:10px}
.stb-hero-script{position:relative;z-index:1;font-family:cursive;font-size:24px;font-style:italic;text-align:center;transform:rotate(-8deg);margin-left:25px;min-width:110px;line-height:1.2}
.stb-workspace{display:grid;grid-template-columns:minmax(235px,.85fr) minmax(380px,1.3fr) minmax(330px,1.05fr);gap:16px;margin-top:16px;align-items:stretch}
.stb-panel{border:1px solid #f0dce4;border-radius:17px;background:#ffffffdf;box-shadow:0 7px 24px rgba(132,20,46,.09);min-width:0;overflow:hidden}
.stb-panel-head{padding:17px 18px 10px;display:flex;align-items:center;justify-content:space-between;font-size:15px;font-weight:850;gap:8px}
.stb-head-left{display:flex;align-items:center;min-width:0}
.stb-head-icon{font-size:22px;color:var(--stb-primary);margin-right:8px}
.stb-link{border:0;background:transparent;color:#d80019;font-size:12px;font-weight:850;white-space:nowrap}
.stb-filters{display:flex;gap:5px;padding:7px 16px 14px;flex-wrap:wrap}
.stb-filter{border:0;background:#f7eef3;border-radius:30px;padding:9px 12px;font-size:12px;font-weight:750;flex:1;min-width:45px;color:#211a22}
.stb-filter.active{background:linear-gradient(110deg,#ff2437,#d00017);color:#fff;box-shadow:0 3px 7px #e0001835}
.stb-template-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:9px 17px 18px}
.stb-template-card{border:1px solid #f1dfe5;border-radius:10px;background:#fff;padding:4px;position:relative;cursor:pointer;transition:transform .15s,box-shadow .15s;min-width:0;text-align:left}
.stb-template-card:hover{transform:translateY(-2px);box-shadow:0 4px 10px #8b273318}
.stb-template-card.selected{border:2px solid var(--stb-primary);padding:3px;box-shadow:0 3px 8px #e0001820}
.stb-mini{height:151px;border-radius:6px;overflow:hidden;padding:10px 7px;position:relative;font-size:6px;background:linear-gradient(150deg,#fff,#fff4f7);border:1px solid #f7e6eb;color:#1d1721}
.stb-mini.dark{background:#171519;color:white}
.stb-mini.blue{background:linear-gradient(135deg,#fff,#e7f3ff)}
.stb-mini.green{background:linear-gradient(135deg,#fff,#e9ffe7)}
.stb-mini.gold{background:linear-gradient(135deg,#17120b,#3a2609);color:white}
.stb-mini .stb-mini-head{height:30px;background:linear-gradient(110deg,var(--mini,#f0001b) 0 38%,transparent 38%);margin:-10px -7px 9px}
.stb-mini .stb-mini-logo{font-weight:950;color:var(--mini,#e90018);font-size:9px}
.stb-mini strong{font-size:10px;display:block}
.stb-mini-lines{height:4px;background:#e9dfe3;margin:7px 0;width:88%}
.stb-mini-lines.short{width:56%}
.stb-mini table{border-collapse:collapse;width:100%;margin-top:11px;font-size:5px}
.stb-mini td{border:1px solid #eadde2;padding:4px 2px}
.stb-mini-total{height:8px;width:50%;background:var(--mini,#e90018);margin:10px 0 0 auto}
.stb-check{position:absolute;right:6px;top:6px;background:#e90018;color:#fff;width:21px;height:21px;border-radius:50%;display:grid;place-items:center;font-size:13px;border:2px solid white}
.stb-editor-area{min-width:0}
.stb-viewbar{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:4px 0 14px}
.stb-view-btn{border:0;border-radius:30px;background:#f2eaf2;padding:10px 14px;font-size:12px;font-weight:850;color:#3b303e;white-space:nowrap}
.stb-view-btn.active{background:linear-gradient(110deg,#ff2437,#c90017);color:white;box-shadow:0 4px 10px #e000182b}
.stb-view-spacer{flex:1}
.stb-light-btn{border:1px solid #efdce4;background:#fff;border-radius:30px;padding:9px 12px;font-size:12px;font-weight:800;color:#4b3e48;box-shadow:0 2px 5px #9d5b6b0d;white-space:nowrap}
.stb-invoice-wrap{background:#fff;border:1px solid #f0dce4;border-radius:10px;box-shadow:0 6px 13px #4a15201c;overflow:hidden;max-width:100%;margin:0 auto;transition:width .2s}
.stb-invoice{background:var(--stb-invoice-bg,#fff);color:var(--stb-invoice-text,#1d1721);min-height:590px;font-size:12px;position:relative;overflow:hidden}
.stb-invoice-top{height:122px;display:flex;align-items:center;justify-content:space-between;padding:20px 27px;position:relative;background:linear-gradient(125deg,#fff 0 57%,var(--stb-primary) 57% 70%,#a90012 100%);color:#fff}
.stb-invoice-top:after{content:"";position:absolute;inset:0;background:linear-gradient(140deg,transparent 0 67%,#ffffff17 67% 68%,transparent 69%);pointer-events:none}
.stb-invoice-logo{position:relative;z-index:1;color:#17151b;font-size:27px;font-weight:950;letter-spacing:-1px;line-height:1}
.stb-invoice-logo em{display:block;font-style:normal;color:var(--stb-primary);font-size:21px;letter-spacing:0}
.stb-invoice-logo img{max-width:125px;max-height:50px;object-fit:contain;display:block}
.stb-invoice-title{text-align:right;position:relative;z-index:1}
.stb-invoice-title strong{font-size:26px;display:block}
.stb-invoice-title span{display:block;margin-top:5px;font-size:10px}
.stb-invoice-content{padding:18px 25px 66px}
.stb-bill-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;line-height:1.7}
.stb-bill-grid strong{font-size:12px}
.stb-invoice-table{width:100%;border-collapse:separate;border-spacing:0;margin-top:24px;border:1px solid var(--stb-primary);border-radius:6px;overflow:hidden;font-size:10px}
.stb-invoice-table th{background:var(--stb-primary);color:#fff;text-align:left;padding:9px 7px}
.stb-invoice-table td{padding:9px 7px;border-top:1px solid #f0dce4;border-right:1px solid #f0dce4}
.stb-invoice-table td:last-child,.stb-invoice-table th:last-child{border-right:0}
.stb-invoice-table tr:nth-child(even) td{background:#fff8fa}
.stb-invoice-table th:first-child,.stb-invoice-table td:first-child{text-align:center;width:10%}
.stb-totals{width:48%;margin:10px 0 0 auto;font-size:10px}
.stb-totals div{display:flex;justify-content:space-between;gap:8px;padding:5px 7px;border-bottom:1px dashed #ead9df}
.stb-totals .stb-grand{background:var(--stb-primary);color:#fff;font-size:13px;font-weight:900;border-radius:7px;border:0;margin-top:3px}
.stb-thanks{margin-top:14px;font-weight:900;color:#4a101a}
.stb-thanks em{display:block;font-weight:500;margin-top:4px}
.stb-invoice-wave{position:absolute;bottom:0;left:0;right:0;height:48px;background:var(--stb-primary);clip-path:polygon(0 48%,13% 83%,30% 88%,48% 50%,62% 64%,79% 27%,100% 42%,100% 100%,0 100%)}
.stb-invoice-wave:after{content:"";position:absolute;inset:14px 0 0;background:#a80013;clip-path:polygon(0 30%,23% 85%,42% 45%,59% 63%,82% 15%,100% 30%,100% 100%,0 100%)}
.stb-stamp{position:absolute;right:23px;bottom:18px;border:2px solid #fff;border-radius:50%;width:67px;height:67px;background:#c90017;color:#fff;display:grid;place-items:center;text-align:center;font-size:9px;font-weight:900;box-shadow:0 0 0 4px #e5001d;line-height:1.25}
.stb-right-panel{display:flex;flex-direction:column}
.stb-tabs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));background:#f7eef5;padding:5px;gap:3px;border-radius:14px;margin:6px 6px 0}
.stb-tab{border:0;border-radius:12px;background:transparent;padding:9px 2px 7px;font-size:10px;font-weight:800;color:#514452;min-width:0}
.stb-tab span{display:block;font-size:21px;margin-bottom:4px}
.stb-tab.active{background:linear-gradient(130deg,#ff273a,#d00018);color:#fff;box-shadow:0 3px 8px #d5001938}
.stb-settings{padding:16px;flex:1;min-width:0}
.stb-settings h3{font-size:14px;margin:0 0 15px}
.stb-settings h4{font-size:12px;margin:17px 0 10px}
.stb-swatch-list{display:flex;gap:9px;flex-wrap:wrap}
.stb-swatch{width:28px;height:28px;flex-shrink:0;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 1px #e8d7df;position:relative;padding:0}
.stb-swatch.active:after{content:"✓";color:#fff;font-size:15px;font-weight:950;position:absolute;inset:2px;text-align:center;text-shadow:0 1px 2px #333}
.stb-colorbox{width:100%;height:89px;border-radius:9px;border:1px solid #e9d9df;background:linear-gradient(0deg,#000,transparent),linear-gradient(90deg,#fff,var(--stb-primary));margin-top:15px;position:relative;overflow:hidden}
.stb-colorbox input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
.stb-hue{width:100%;margin-top:8px;accent-color:var(--stb-primary)}
.stb-style-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.stb-style-option{border:1px solid #eadbe2;border-radius:8px;padding:4px;background:#fff;font-size:10px;text-align:center;font-weight:800;color:#17151b;min-width:0}
.stb-style-option.active{border:2px solid var(--stb-primary);padding:3px}
.stb-style-sample{height:42px;border-radius:5px;margin-bottom:5px;background:linear-gradient(130deg,var(--stb-primary) 0 40%,#fff 40% 70%,#ba0013 70%)}
.stb-style-sample.grad{background:linear-gradient(130deg,#f00,#ff9bad,#fff)}
.stb-style-sample.modern{background:linear-gradient(130deg,var(--stb-primary) 0 33%,#222 33% 62%,#fff 62%)}
.stb-style-sample.minimal{background:linear-gradient(130deg,#e7e2ed 0 42%,#222 42%)}
.stb-bg-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
.stb-bg-option{height:48px;border:2px solid transparent;border-radius:8px;background:#fff;min-width:0;padding:0}
.stb-bg-option.active{border:2px solid var(--stb-primary)}
.stb-bg-option:nth-child(2){background:repeating-linear-gradient(45deg,#faf4fa,#faf4fa 3px,#eee6ef 4px)}
.stb-bg-option:nth-child(3){background:radial-gradient(#ddd 1px,transparent 1px),#fff;background-size:8px 8px}
.stb-bg-option:nth-child(4){background:linear-gradient(135deg,#dce5ff 25%,#fff 25% 50%,#dce5ff 50% 75%,#fff 75%)}
.stb-bg-option:nth-child(5){background:linear-gradient(135deg,#28232d,#111)}
.stb-setting-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:12px 0;font-size:12px;font-weight:700}
.stb-setting-row label{flex:1;min-width:0}
.stb-setting-row input[type=text],.stb-setting-row input[type=number],.stb-setting-row input[type=date],.stb-setting-row select{width:59%;min-width:0;border:1px solid #e8d9e0;border-radius:8px;padding:9px;background:white;outline-color:var(--stb-primary);color:#28212a}
.stb-setting-row input[type=file]{width:59%;min-width:0;font-size:10px}
.stb-setting-row input[type=range]{width:59%;accent-color:var(--stb-primary)}
.stb-switch{appearance:none;width:38px!important;height:22px;border-radius:99px;background:#d7c8d0;position:relative;cursor:pointer;padding:0!important;border:0!important;flex-shrink:0}
.stb-switch:checked{background:var(--stb-primary)}
.stb-switch:before{content:"";position:absolute;width:16px;height:16px;background:#fff;border-radius:50%;top:3px;left:3px;transition:.15s}
.stb-switch:checked:before{left:19px}
.stb-section-note{font-size:12px;color:#766b75;line-height:1.6}
.stb-small-button{border:1px solid #ff6476;color:#d40018;background:#fff;border-radius:30px;padding:9px 13px;font-weight:800;font-size:12px}
.stb-item-editor{border:1px solid #f0dce4;border-radius:9px;padding:9px;margin:7px 0;background:#fff}
.stb-item-editor-title{display:flex;justify-content:space-between;align-items:center;font-weight:850;font-size:12px}
.stb-actions{display:flex;gap:10px;justify-content:space-between;align-items:center;padding:17px 16px 0;flex-wrap:wrap}
.stb-action-left,.stb-action-right{display:flex;gap:10px;flex-wrap:wrap}
.stb-outline-button{border:1px solid #ff6476;color:#d40018;background:#fff;border-radius:30px;padding:12px 17px;font-weight:850;font-size:12px;box-shadow:0 3px 8px #d4001814;display:inline-flex;gap:7px;align-items:center;justify-content:center;white-space:nowrap}
.stb-toast{position:fixed;bottom:18px;left:50%;transform:translateX(-50%) translateY(90px);background:#21181e;color:white;padding:12px 18px;border-radius:30px;box-shadow:0 6px 20px #0003;font-size:13px;z-index:100;transition:transform .25s;max-width:calc(100vw - 30px);text-align:center}
.stb-toast.show{transform:translateX(-50%) translateY(0)}
.stb-hidden{display:none!important}
@media(max-width:1450px){.stb-workspace{grid-template-columns:minmax(205px,.8fr) minmax(340px,1.2fr)}.stb-right-panel{grid-column:1/-1}.stb-settings{display:block}.stb-hero-art{width:140px;font-size:55px}.stb-hero-features{padding-left:22px;min-width:200px}.stb-hero-script{display:none}.stb-template-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.stb-mini{height:125px}}
@media(max-width:900px){.stb-sidebar{position:relative;inset:auto;width:100%;height:auto;padding:8px 12px;display:block;border-right:0;border-bottom:1px solid #f2dfe5;overflow:visible}.stb-brand{height:55px;padding:0}.stb-brand-mark{width:42px;height:40px;font-size:26px}.stb-brand-word{font-size:20px;line-height:18px}.stb-brand-word span{font-size:16px}.stb-nav{display:flex;overflow-x:auto;margin-top:8px;padding-bottom:3px;gap:5px}.stb-nav-item{height:40px;flex-shrink:0;padding:0 11px;font-size:12px}.stb-nav-icon{font-size:17px;width:auto}.stb-upgrade,.stb-theme-switch{display:none}.stb-main{margin-left:0;padding:0 10px 14px}.stb-topbar{height:67px;padding:0;gap:8px}.stb-search{height:42px;padding:0 13px}.stb-top-right{gap:7px}.stb-bell{width:38px;height:38px;font-size:17px}.stb-avatar{width:38px;height:38px;font-size:18px}.stb-profile,.stb-chevron{display:none}.stb-hero{height:auto;min-height:150px;padding:18px;gap:12px}.stb-hero-art{width:60px;font-size:40px}.stb-hero h1{font-size:22px}.stb-hero p{font-size:12px}.stb-hero-features{display:none}.stb-pill{font-size:10px;padding:5px 9px}.stb-workspace{grid-template-columns:1fr;gap:12px;margin-top:12px}.stb-editor-area{grid-row:1}.stb-right-panel{grid-column:auto}.stb-template-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.stb-mini{height:135px}.stb-invoice{min-height:540px}.stb-invoice-top{height:105px;padding:15px}.stb-invoice-logo{font-size:22px}.stb-invoice-logo em{font-size:17px}.stb-invoice-title strong{font-size:21px}.stb-invoice-content{padding:15px 14px 65px}.stb-invoice-table{font-size:9px}.stb-invoice-table th,.stb-invoice-table td{padding:7px 4px}.stb-actions{padding:12px 0}.stb-action-left,.stb-action-right{width:100%}.stb-actions button{flex:1}.stb-viewbar{margin-bottom:10px}.stb-right-panel .stb-tabs{grid-template-columns:repeat(5,minmax(0,1fr))}.stb-tab{font-size:9px}.stb-tab span{font-size:18px}.stb-settings{padding:14px}.stb-panel-head{padding:14px}}
@media(max-width:500px){.stb-hero-art{display:none}.stb-hero h1{font-size:20px}.stb-template-grid{padding:8px;gap:6px}.stb-mini{height:116px}.stb-filter{padding:8px 9px}.stb-invoice{font-size:10px}.stb-invoice-title strong{font-size:18px}.stb-invoice-logo{font-size:18px}.stb-invoice-logo em{font-size:14px}.stb-invoice-content{padding-left:10px;padding-right:10px}.stb-bill-grid{gap:7px}.stb-invoice-table th,.stb-invoice-table td{padding:6px 3px}.stb-totals{width:60%}.stb-stamp{width:53px;height:53px;right:14px;bottom:18px}.stb-style-grid{gap:5px}.stb-style-sample{height:34px}.stb-view-btn,.stb-light-btn{padding:9px 10px;font-size:11px}.stb-view-spacer{display:none}.stb-viewbar{gap:5px}}
@media print{@page{size:A4;margin:12mm}body{background:#fff!important}.stb-page{background:#fff!important}.stb-sidebar,.stb-topbar,.stb-hero,.stb-left-panel,.stb-right-panel,.stb-viewbar,.stb-actions{display:none!important}.stb-main{margin:0!important;padding:0!important}.stb-workspace{display:block!important;margin:0!important}.stb-editor-area{width:100%!important}.stb-invoice-wrap{border:0!important;box-shadow:none!important;width:100%!important;max-width:none!important}.stb-invoice{min-height:0!important;page-break-inside:avoid}}
`;

function MiniInvoice({ template, selected, onClick }) {
  const kindClass = template.kind === "midnight" || template.kind === "gold" ? "dark" : template.kind === "ocean" ? "blue" : template.kind === "fresh" ? "green" : "";
  return (
    <button type="button" className={`stb-template-card ${selected ? "selected" : ""}`} onClick={onClick} title={template.name}>
      <div className={`stb-mini ${kindClass}`} style={{ "--mini": template.color }}>
        <div className="stb-mini-head" />
        <div className="stb-mini-logo">S SPYRIX</div>
        <strong>INVOICE</strong>
        <div className="stb-mini-lines" />
        <div className="stb-mini-lines short" />
        <table aria-hidden="true">
          <tbody>
            <tr><td>Item</td><td>Qty</td><td>Total</td></tr>
            <tr><td>Design</td><td>1</td><td>₹3,000</td></tr>
            <tr><td>Service</td><td>1</td><td>₹2,000</td></tr>
          </tbody>
        </table>
        <div className="stb-mini-total" />
        <div className="stb-mini-lines short" />
      </div>
      {selected && <span className="stb-check">✓</span>}
      <span style={{ display: "block", padding: "6px 2px 2px", fontSize: 10, fontWeight: 800, color: "#30232a" }}>{template.name}</span>
    </button>
  );
}

export default function TemplatePreviewPage() {
  const [templates, setTemplates] = useState(STARTER_TEMPLATES);
  const [selectedId, setSelectedId] = useState("ruby");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Colors");
  const [primary, setPrimary] = useState("#ed0018");
  const [secondary, setSecondary] = useState("#ff8799");
  const [headerStyle, setHeaderStyle] = useState("Classic");
  const [backgroundStyle, setBackgroundStyle] = useState(0);
  const [fontFamily, setFontFamily] = useState("Inter, sans-serif");
  const [fontSize, setFontSize] = useState("12");
  const [boldHeadings, setBoldHeadings] = useState(true);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [brandName, setBrandName] = useState("SPYRIX");
  const [brandSubtitle, setBrandSubtitle] = useState("INVOICE");
  const [logoData, setLogoData] = useState("");
  const [logoWidth, setLogoWidth] = useState(125);
  const [showStamp, setShowStamp] = useState(true);
  const [imageData, setImageData] = useState("");
  const [imageOpacity, setImageOpacity] = useState(35);
  const [imageFit, setImageFit] = useState("cover");
  const [mobileView, setMobileView] = useState(false);
  const [cleanPreview, setCleanPreview] = useState(false);
  const [customerName, setCustomerName] = useState("John Doe");
  const [customerAddress, setCustomerAddress] = useState("123 Business Street, New Delhi, India - 110001");
  const [businessName, setBusinessName] = useState("SPYRIX Technologies");
  const [invoiceNumber, setInvoiceNumber] = useState("#INV-2025-001");
  const [invoiceDate, setInvoiceDate] = useState("06 Nov 2025");
  const [discount, setDiscount] = useState(500);
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [toastMessage, setToastMessage] = useState("");
  const [savedIndicator, setSavedIndicator] = useState(false);
  const toastTimer = useRef(null);
  const logoInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const downloadInvoicePdf = async () => {
    const wrap = document.querySelector('.stb-invoice-wrap');
    const invoice = wrap?.querySelector('.stb-invoice');
    if (!wrap || !invoice) { window.print(); return; }
    const pageWidth = 794, pageHeight = 1123;
    const safeWidth = pageWidth - 22, safeHeight = pageHeight - 28;
    const originals = {
      wrapWidth: wrap.style.width, wrapMaxWidth: wrap.style.maxWidth,
      invoiceWidth: invoice.style.width, invoiceMinHeight: invoice.style.minHeight,
      invoiceHeight: invoice.style.height, invoiceOverflow: invoice.style.overflow,
    };
    wrap.style.width = `${safeWidth}px`; wrap.style.maxWidth = 'none';
    invoice.style.width = '100%'; invoice.style.minHeight = '0'; invoice.style.height = 'auto'; invoice.style.overflow = 'visible';
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const rect = invoice.getBoundingClientRect();
    const fullWidth = Math.max(1, rect.width, invoice.scrollWidth);
    const fullHeight = Math.max(1, rect.height, invoice.scrollHeight);
    const scale = Math.min(1, safeWidth / fullWidth, safeHeight / fullHeight);
    const left = Math.max(0, (pageWidth - fullWidth * scale) / 2);
    wrap.style.width = originals.wrapWidth; wrap.style.maxWidth = originals.wrapMaxWidth;
    invoice.style.width = originals.invoiceWidth; invoice.style.minHeight = originals.invoiceMinHeight;
    invoice.style.height = originals.invoiceHeight; invoice.style.overflow = originals.invoiceOverflow;

    document.getElementById('spyrix-template-one-page-print')?.remove();
    const printStyle = document.createElement('style');
    printStyle.id = 'spyrix-template-one-page-print';
    printStyle.textContent = `@page{size:A4 portrait;margin:0}@media print{
      html,body,#root{width:${pageWidth}px!important;height:${pageHeight-2}px!important;max-height:${pageHeight-2}px!important;margin:0!important;padding:0!important;overflow:hidden!important;background:#fff!important}
      body *{visibility:hidden!important}
      .stb-page{position:absolute!important;inset:0 auto auto 0!important;width:${pageWidth}px!important;height:${pageHeight-2}px!important;max-height:${pageHeight-2}px!important;margin:0!important;padding:0!important;overflow:hidden!important;background:#fff!important}
      .stb-sidebar,.stb-topbar,.stb-hero,.stb-left-panel,.stb-right-panel,.stb-viewbar,.stb-actions{display:none!important}
      .stb-main,.stb-workspace,.stb-editor-area{position:absolute!important;inset:0 auto auto 0!important;display:block!important;width:${pageWidth}px!important;height:${pageHeight-2}px!important;max-height:${pageHeight-2}px!important;margin:0!important;padding:0!important;overflow:hidden!important}
      .stb-invoice-wrap,.stb-invoice-wrap *{visibility:visible!important}
      .stb-invoice-wrap{position:absolute!important;left:${left}px!important;top:8px!important;width:${fullWidth}px!important;height:${pageHeight-14}px!important;max-width:none!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;box-shadow:none!important;background:#fff!important}
      .stb-invoice{position:absolute!important;inset:0 auto auto 0!important;width:${fullWidth}px!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;overflow:visible!important;transform:scale(${scale})!important;transform-origin:top left!important;box-shadow:none!important;break-inside:avoid!important;page-break-inside:avoid!important}
    }`;
    document.body.appendChild(printStyle);
    const cleanup = () => printStyle.remove();
    window.addEventListener('afterprint', cleanup, { once: true });
    window.print();
  };

  const selectedTemplate = templates.find((item) => item.id === selectedId) || templates[0];
  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return templates.filter((item) => {
      const filterMatch = filter === "All" || item.category === filter;
      const searchMatch = !query || item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
      return filterMatch && searchMatch;
    });
  }, [templates, filter, search]);

  const subtotal = items.reduce((sum, item) => sum + Math.max(0, Number(item.qty) || 0) * Math.max(0, Number(item.price) || 0), 0);
  const safeDiscount = Math.max(0, Number(discount) || 0);
  const grandTotal = Math.max(0, subtotal - safeDiscount);
  const invoiceBackgrounds = [
    "#ffffff",
    "repeating-linear-gradient(45deg,#fff,#fff 4px,#faf2f5 5px)",
    "radial-gradient(#eadfe4 1px,transparent 1px),#fff",
    "linear-gradient(135deg,#e8edff,#fff)",
    "linear-gradient(135deg,#28232d,#17151b)",
  ];

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  function notify(message) {
    setToastMessage(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(""), 2600);
  }

  function chooseTemplate(template) {
    setSelectedId(template.id);
    setPrimary(template.color);
    notify(`${template.name} template selected`);
  }

  function updatePrimaryColor(color) {
    setPrimary(color);
    setTemplates((current) => current.map((template) => template.id === selectedId ? { ...template, color } : template));
  }

  function updateItem(id, field, value) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, [field]: field === "name" ? value : Number(value) } : item));
  }

  function addItem() {
    const nextId = Math.max(0, ...items.map((item) => item.id)) + 1;
    setItems((current) => [...current, { id: nextId, name: "New service", qty: 1, price: 1000 }]);
    notify("Invoice item added");
  }

  function removeItem(id) {
    setItems((current) => current.filter((item) => item.id !== id));
    notify("Invoice item removed");
  }

  function readImage(event, callback) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("Please choose an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => callback(String(reader.result || ""));
    reader.onerror = () => notify("Could not read that image");
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function saveChanges() {
    const data = {
      selectedId, templates, primary, secondary, headerStyle, backgroundStyle, fontFamily, fontSize,
      boldHeadings, letterSpacing, brandName, brandSubtitle, logoData, logoWidth, showStamp, imageData,
      imageOpacity, imageFit, customerName, customerAddress, businessName, invoiceNumber, invoiceDate,
      discount, items,
    };
    try {
      localStorage.setItem("spyrixInvoiceTemplateStudio", JSON.stringify(data));
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 1800);
      notify("Changes saved in this browser");
    } catch {
      notify("Browser storage is full. Try removing the uploaded background image.");
    }
  }

  function saveAsTemplate() {
    const enteredName = window.prompt("Name your custom template:", `${selectedTemplate.name} Custom`);
    if (enteredName === null) return;
    const name = enteredName.trim() || "My Custom Template";
    const custom = { ...selectedTemplate, id: `custom-${Date.now()}`, name, category: "Custom" };
    setTemplates((current) => [...current, custom]);
    setSelectedId(custom.id);
    notify(`“${name}” added to your templates`);
  }

  function resetSettings() {
    setSelectedId("ruby");
    setFilter("All");
    setSearch("");
    setPrimary("#ed0018");
    setSecondary("#ff8799");
    setHeaderStyle("Classic");
    setBackgroundStyle(0);
    setFontFamily("Inter, sans-serif");
    setFontSize("12");
    setBoldHeadings(true);
    setLetterSpacing(0);
    setBrandName("SPYRIX");
    setBrandSubtitle("INVOICE");
    setLogoData("");
    setLogoWidth(125);
    setShowStamp(true);
    setImageData("");
    setImageOpacity(35);
    setImageFit("cover");
    setCustomerName("John Doe");
    setCustomerAddress("123 Business Street, New Delhi, India - 110001");
    setBusinessName("SPYRIX Technologies");
    setInvoiceNumber("#INV-2025-001");
    setInvoiceDate("06 Nov 2025");
    setDiscount(500);
    setItems(DEFAULT_ITEMS);
    setMobileView(false);
    setCleanPreview(false);
    setActiveTab("Colors");
    notify("Template settings have been reset");
  }

  function useTemplate() {
    saveChanges();
    notify("Template is ready to use. Continue editing or download the invoice.");
  }

  function applyUploadedInvoiceImage(event) {
    readImage(event, (data) => {
      setImageData(data);
      notify("Invoice artwork uploaded");
    });
  }

  const headerBackground = headerStyle === "Minimal"
    ? "#ffffff"
    : headerStyle === "Gradient"
      ? `linear-gradient(125deg,${primary},#ff9bab,#ffffff)`
      : headerStyle === "Modern"
        ? `linear-gradient(125deg,${primary} 0 35%,#222 35% 62%,#fff 62%)`
        : `linear-gradient(125deg,#fff 0 57%,${primary} 57% 70%,#a90012 100%)`;

  const invoiceBackgroundImage = imageData
    ? `linear-gradient(rgba(255,255,255,${1 - imageOpacity / 100}),rgba(255,255,255,${1 - imageOpacity / 100})),url("${imageData}")`
    : invoiceBackgrounds[backgroundStyle];

  return (
    <div className="stb-page" style={{ "--stb-primary": primary, "--stb-secondary": secondary }}>
      <style>{COMPONENT_STYLES}</style>
      <div className="stb-shell">
        <aside className="stb-sidebar">
          <div className="stb-brand">
            <div className="stb-brand-mark">S</div>
            <div className="stb-brand-word">SPYRIX<span>INVOICE</span></div>
          </div>
          <nav className="stb-nav" aria-label="Main navigation">
            {[
              ["⌂", "Dashboard"], ["▣", "Invoice Studio"], ["♟", "Customers"], ["⬡", "Products"],
              ["♥", "Inventory"], ["S", "Payments"], ["▣", "Expenses"], ["▧", "Reports"],
              ["▤", "Quotations"], ["▦", "Calendar"], ["▣", "Templates"], ["⚙", "Settings"],
            ].map(([icon, label]) => (
              <button type="button" key={label} className={`stb-nav-item ${label === "Invoice Studio" ? "active" : ""}`} onClick={() => label === "Invoice Studio" ? notify("You are in Invoice Studio") : notify(`${label} section navigation can be connected to your app routes`)}>
                <span className="stb-nav-icon">{icon}</span><span>{label}</span>{label === "Invoice Studio" && <span style={{ marginLeft: "auto" }}>➜</span>}
              </button>
            ))}
          </nav>
          <div className="stb-upgrade">
            <div className="stb-crown">👑</div>
            <h3>Upgrade to Pro</h3>
            <p>Unlock Premium Features<br />&amp; Get More Credits</p>
            <button type="button" className="stb-primary-btn" onClick={() => notify("Pro plans can be connected to your subscription page")}>Go Pro <span>→</span></button>
          </div>
          <div className="stb-theme-switch"><span>☼</span><span className="stb-toggle" aria-label="Theme switch" /><span>☾</span></div>
        </aside>

        <main className="stb-main">
          <header className="stb-topbar">
            <label className="stb-search">
              <span className="stb-search-icon">⌕</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search templates..." aria-label="Search templates" />
            </label>
            <div className="stb-top-right">
              <button type="button" className="stb-bell" aria-label="Notifications" onClick={() => notify("You are all caught up!")}>♧<span className="stb-count">3</span></button>
              <div className="stb-avatar" aria-label="Profile image">🕶️</div>
              <div className="stb-profile">Shivam Patel<small>♛ Pro Member</small></div>
              <button type="button" className="stb-chevron" onClick={() => notify("Profile menu")}>⌄</button>
            </div>
          </header>

          <section className="stb-hero">
            <div className="stb-hero-art" aria-hidden="true">💻🎨</div>
            <div className="stb-hero-copy">
              <span className="stb-pill">✦ Create Stunning Invoices</span>
              <h1>Customize Your Invoice</h1>
              <p>Change colors, fonts, add logo &amp; more...</p>
            </div>
            <div className="stb-hero-features"><div>Multiple Templates</div><div>Live Preview</div><div>Export &amp; Share</div></div>
            <div className="stb-hero-script">Your Brand<br />Your Style!</div>
          </section>

          <section className="stb-workspace">
            <section className={`stb-panel stb-left-panel ${cleanPreview ? "stb-hidden" : ""}`}>
              <div className="stb-panel-head">
                <span className="stb-head-left"><span className="stb-head-icon">▰</span>Choose Template</span>
                <button type="button" className="stb-link" onClick={() => { setFilter("All"); setSearch(""); }}>View All&nbsp; →</button>
              </div>
              <div className="stb-filters">
                {["All", "Modern", "Classic", "Minimal"].map((category) => (
                  <button type="button" key={category} className={`stb-filter ${filter === category ? "active" : ""}`} onClick={() => setFilter(category)}>{category}</button>
                ))}
              </div>
              <div className="stb-template-grid">
                {filteredTemplates.map((template) => (
                  <MiniInvoice key={template.id} template={template} selected={template.id === selectedId} onClick={() => chooseTemplate(template)} />
                ))}
                {filteredTemplates.length === 0 && <p className="stb-section-note">No templates match your search.</p>}
              </div>
            </section>

            <section className="stb-editor-area">
              <div className="stb-viewbar">
                <button type="button" className={`stb-view-btn ${!mobileView ? "active" : ""}`} onClick={() => setMobileView(false)}>▣ Desktop View</button>
                <button type="button" className={`stb-view-btn ${mobileView ? "active" : ""}`} onClick={() => setMobileView(true)}>▯ Mobile View</button>
                <span className="stb-view-spacer" />
                <button type="button" className="stb-light-btn" onClick={resetSettings}>⟳ Reset</button>
                <button type="button" className="stb-light-btn" onClick={() => setCleanPreview((value) => !value)}>◉ {cleanPreview ? "Edit" : "Preview"}</button>
              </div>

              <div className="stb-invoice-wrap" style={{ width: mobileView ? "375px" : "100%", maxWidth: "100%" }}>
                <article
                  className="stb-invoice"
                  style={{
                    fontFamily,
                    fontSize: `${fontSize}px`,
                    letterSpacing: `${letterSpacing}px`,
                    background: invoiceBackgroundImage,
                    backgroundSize: imageData ? imageFit : backgroundStyle === 2 ? "9px 9px" : "auto",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    color: backgroundStyle === 4 && !imageData ? "#fff" : "#1d1721",
                  }}
                >
                  <div className="stb-invoice-top" style={{ background: headerBackground }}>
                    <div className="stb-invoice-logo" style={{ fontWeight: boldHeadings ? 950 : 600 }}>
                      {logoData ? <img src={logoData} alt="Uploaded business logo" style={{ maxWidth: `${logoWidth}px` }} /> : <>{brandName || "SPYRIX"}<em>{brandSubtitle || "INVOICE"}</em></>}
                    </div>
                    <div className="stb-invoice-title" style={{ color: headerStyle === "Minimal" ? primary : "#fff" }}>
                      <strong style={{ fontWeight: boldHeadings ? 900 : 500 }}>INVOICE</strong>
                      <span>{invoiceNumber || "#INV-2025-001"}</span>
                      <span>Date: {invoiceDate || "—"}</span>
                    </div>
                  </div>
                  <div className="stb-invoice-content">
                    <div className="stb-bill-grid">
                      <div><strong>Bill To:</strong><br /><b>{customerName || "Customer name"}</b><br />{customerAddress.split(",").map((part, index) => <React.Fragment key={`${part}-${index}`}>{index > 0 && ", "}{part.trim()}{index < customerAddress.split(",").length - 1 && <br />}</React.Fragment>)}</div>
                      <div><strong>From:</strong><br /><b>{businessName || "Business name"}</b><br />✉ info@spyrix.com<br />☎ +91 98765 43210</div>
                    </div>
                    <table className="stb-invoice-table">
                      <thead><tr><th>#</th><th>Item Description</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={item.id}><td>{index + 1}</td><td>{item.name || "Item"}</td><td>{item.qty}</td><td>{CURRENCY(item.price)}</td><td>{CURRENCY((Number(item.qty) || 0) * (Number(item.price) || 0))}</td></tr>
                        ))}
                        {items.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center" }}>Add invoice items in Advanced settings</td></tr>}
                      </tbody>
                    </table>
                    <div className="stb-totals">
                      <div><span>Subtotal:</span><b>{CURRENCY(subtotal)}</b></div>
                      <div><span>Discount:</span><b>{CURRENCY(safeDiscount)}</b></div>
                      <div className="stb-grand"><span>Total:</span><b>{CURRENCY(grandTotal)}</b></div>
                    </div>
                    <div className="stb-thanks">Thank you for your business!<em>Keep Growing with SPYRIX</em></div>
                  </div>
                  <div className="stb-invoice-wave" />
                  {showStamp && <div className="stb-stamp">👑<br />SPYRIX<br />PREMIUM</div>}
                </article>
              </div>

              <div className="stb-actions">
                <div className="stb-action-left"><button type="button" className="stb-outline-button" onClick={saveAsTemplate}>▣ Save as Template</button></div>
                <div className="stb-action-right">
                  <button type="button" className="stb-outline-button" onClick={downloadInvoicePdf}>⇩ Download PDF</button>
                  <button type="button" className="stb-primary-btn" onClick={saveChanges}>{savedIndicator ? "✓ Saved" : "▣ Save Changes"}</button>
                  <button type="button" className="stb-primary-btn" onClick={useTemplate}>🚀 Use Template&nbsp; →</button>
                </div>
              </div>
            </section>

            <section className={`stb-panel stb-right-panel ${cleanPreview ? "stb-hidden" : ""}`}>
              <div className="stb-tabs">
                {[["Colors", "☷"], ["Fonts", "Aa"], ["Logo", "▧"], ["Image", "▧"], ["Advanced", "⚙"]].map(([tab, icon]) => (
                  <button type="button" key={tab} className={`stb-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}><span>{icon}</span>{tab}</button>
                ))}
              </div>
              <div className="stb-settings">
                {activeTab === "Colors" && (
                  <>
                    <h3>🎨 Colors</h3>
                    <h4>Primary Color</h4>
                    <div className="stb-swatch-list">{PRIMARY_SWATCHES.map((color) => <button type="button" key={color} aria-label={`Set primary ${color}`} className={`stb-swatch ${primary.toLowerCase() === color.toLowerCase() ? "active" : ""}`} style={{ background: color }} onClick={() => updatePrimaryColor(color)} />)}</div>
                    <h4>Secondary Color</h4>
                    <div className="stb-swatch-list">{SECONDARY_SWATCHES.map((color) => <button type="button" key={color} aria-label={`Set secondary ${color}`} className={`stb-swatch ${secondary.toLowerCase() === color.toLowerCase() ? "active" : ""}`} style={{ background: color }} onClick={() => setSecondary(color)} />)}</div>
                    <label className="stb-colorbox" title="Choose custom primary color"><input type="color" aria-label="Custom primary color" value={primary} onChange={(event) => updatePrimaryColor(event.target.value)} /></label>
                    <input className="stb-hue" type="range" min="0" max="360" aria-label="Hue accent" value={0} onChange={(event) => updatePrimaryColor(`hsl(${event.target.value},100%,50%)`)} />
                    <h4>Header Style</h4>
                    <div className="stb-style-grid">
                      {[["Classic", ""], ["Gradient", "grad"], ["Modern", "modern"], ["Minimal", "minimal"]].map(([name, cls]) => <button type="button" key={name} className={`stb-style-option ${headerStyle === name ? "active" : ""}`} onClick={() => setHeaderStyle(name)}><div className={`stb-style-sample ${cls}`} />{name}</button>)}
                    </div>
                    <h4>Background</h4>
                    <div className="stb-bg-grid">{invoiceBackgrounds.map((_, index) => <button type="button" key={index} title={`Background ${index + 1}`} className={`stb-bg-option ${backgroundStyle === index ? "active" : ""}`} onClick={() => { setBackgroundStyle(index); setImageData(""); }} />)}</div>
                  </>
                )}

                {activeTab === "Fonts" && (
                  <>
                    <h3>🔤 Typography</h3>
                    <div className="stb-setting-row"><label htmlFor="stb-font">Font family</label><select id="stb-font" value={fontFamily} onChange={(event) => setFontFamily(event.target.value)}><option value="Inter, sans-serif">Inter / System</option><option value="Arial, sans-serif">Arial</option><option value="Georgia, serif">Georgia</option><option value="'Trebuchet MS', sans-serif">Trebuchet MS</option><option value="'Courier New', monospace">Courier New</option><option value="Verdana, sans-serif">Verdana</option></select></div>
                    <div className="stb-setting-row"><label htmlFor="stb-size">Base font size</label><select id="stb-size" value={fontSize} onChange={(event) => setFontSize(event.target.value)}><option value="10">Compact</option><option value="12">Medium</option><option value="14">Large</option><option value="16">Extra large</option></select></div>
                    <div className="stb-setting-row"><label htmlFor="stb-bold">Bold headings</label><input className="stb-switch" id="stb-bold" type="checkbox" checked={boldHeadings} onChange={(event) => setBoldHeadings(event.target.checked)} /></div>
                    <div className="stb-setting-row"><label htmlFor="stb-spacing">Letter spacing</label><input id="stb-spacing" type="range" min="-1" max="3" step=".5" value={letterSpacing} onChange={(event) => setLetterSpacing(Number(event.target.value))} /></div>
                    <p className="stb-section-note">Typography changes are reflected in the invoice preview immediately.</p>
                  </>
                )}

                {activeTab === "Logo" && (
                  <>
                    <h3>▧ Brand &amp; Logo</h3>
                    <div className="stb-setting-row"><label htmlFor="stb-brand">Brand name</label><input id="stb-brand" type="text" value={brandName} onChange={(event) => { setBrandName(event.target.value); setLogoData(""); }} /></div>
                    <div className="stb-setting-row"><label htmlFor="stb-subtitle">Subtitle</label><input id="stb-subtitle" type="text" value={brandSubtitle} onChange={(event) => setBrandSubtitle(event.target.value)} /></div>
                    <div className="stb-setting-row"><label>Upload logo</label><input ref={logoInputRef} type="file" accept="image/*" onChange={(event) => readImage(event, (data) => { setLogoData(data); notify("Logo uploaded"); })} /></div>
                    <div className="stb-setting-row"><label htmlFor="stb-logo-width">Logo width</label><input id="stb-logo-width" type="range" min="70" max="190" value={logoWidth} onChange={(event) => setLogoWidth(Number(event.target.value))} /></div>
                    <div className="stb-setting-row"><label htmlFor="stb-stamp">Show brand stamp</label><input className="stb-switch" id="stb-stamp" type="checkbox" checked={showStamp} onChange={(event) => setShowStamp(event.target.checked)} /></div>
                    {logoData && <button type="button" className="stb-small-button" onClick={() => { setLogoData(""); if (logoInputRef.current) logoInputRef.current.value = ""; }}>Remove uploaded logo</button>}
                    <p className="stb-section-note">Use a transparent PNG or JPG logo for the best result.</p>
                  </>
                )}

                {activeTab === "Image" && (
                  <>
                    <h3>▧ Invoice Artwork</h3>
                    <div className="stb-setting-row"><label>Upload background image</label><input ref={imageInputRef} type="file" accept="image/*" onChange={applyUploadedInvoiceImage} /></div>
                    <div className="stb-setting-row"><label htmlFor="stb-opacity">Image opacity</label><input id="stb-opacity" type="range" min="5" max="100" value={imageOpacity} onChange={(event) => setImageOpacity(Number(event.target.value))} /></div>
                    <div className="stb-setting-row"><label htmlFor="stb-fit">Fit style</label><select id="stb-fit" value={imageFit} onChange={(event) => setImageFit(event.target.value)}><option value="cover">Cover</option><option value="contain">Contain</option><option value="auto">Original size</option></select></div>
                    <button type="button" className="stb-small-button" onClick={() => { setImageData(""); if (imageInputRef.current) imageInputRef.current.value = ""; }}>Remove artwork</button>
                    <p className="stb-section-note">Add subtle artwork or a texture. Keep opacity low to preserve text readability.</p>
                  </>
                )}

                {activeTab === "Advanced" && (
                  <>
                    <h3>⚙ Advanced Settings</h3>
                    <div className="stb-setting-row"><label htmlFor="stb-number">Invoice number</label><input id="stb-number" type="text" value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} /></div>
                    <div className="stb-setting-row"><label htmlFor="stb-date">Invoice date</label><input id="stb-date" type="text" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} /></div>
                    <div className="stb-setting-row"><label htmlFor="stb-customer">Customer name</label><input id="stb-customer" type="text" value={customerName} onChange={(event) => setCustomerName(event.target.value)} /></div>
                    <div className="stb-setting-row"><label htmlFor="stb-address">Customer address</label><input id="stb-address" type="text" value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} /></div>
                    <div className="stb-setting-row"><label htmlFor="stb-business">Business name</label><input id="stb-business" type="text" value={businessName} onChange={(event) => setBusinessName(event.target.value)} /></div>
                    <div className="stb-setting-row"><label htmlFor="stb-discount">Discount (₹)</label><input id="stb-discount" type="number" min="0" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} /></div>
                    <div className="stb-setting-row"><label htmlFor="stb-advanced-stamp">Show footer stamp</label><input className="stb-switch" id="stb-advanced-stamp" type="checkbox" checked={showStamp} onChange={(event) => setShowStamp(event.target.checked)} /></div>
                    <h4>Invoice items</h4>
                    {items.map((item, index) => (
                      <div className="stb-item-editor" key={item.id}>
                        <div className="stb-item-editor-title"><span>Item {index + 1}</span><button type="button" className="stb-link" onClick={() => removeItem(item.id)}>Remove</button></div>
                        <div className="stb-setting-row"><label htmlFor={`stb-item-name-${item.id}`}>Description</label><input id={`stb-item-name-${item.id}`} type="text" value={item.name} onChange={(event) => updateItem(item.id, "name", event.target.value)} /></div>
                        <div className="stb-setting-row"><label htmlFor={`stb-item-qty-${item.id}`}>Qty</label><input id={`stb-item-qty-${item.id}`} type="number" min="0" value={item.qty} onChange={(event) => updateItem(item.id, "qty", event.target.value)} /></div>
                        <div className="stb-setting-row"><label htmlFor={`stb-item-price-${item.id}`}>Price (₹)</label><input id={`stb-item-price-${item.id}`} type="number" min="0" value={item.price} onChange={(event) => updateItem(item.id, "price", event.target.value)} /></div>
                      </div>
                    ))}
                    <button type="button" className="stb-small-button" onClick={addItem}>＋ Add item</button>
                  </>
                )}
              </div>
            </section>
          </section>
        </main>
      </div>
      <div className={`stb-toast ${toastMessage ? "show" : ""}`} role="status">{toastMessage}</div>
    </div>
  );
}
