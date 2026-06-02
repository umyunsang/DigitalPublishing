import{g as a}from"./index-C_mG4s_8.js";import{E as t}from"./Enter-_PTbZfPb.js";const c=`<section class="hero">
  <div class="hero_content">
    <div class="links_codrops">
	      <link-c href="../../index.html">HUB</link-c>
	      <link-c href="../02-saved-scenes/index.html">NEXT</link-c>
    </div>
    <div class="lists_c">
      <ul>
        <li>
          <div class="lines">
            <div class="inner_lines inner_linesleft"></div>
          </div>
        </li>
        <li>
          <p class="anim_p">OFFICIAL GROUND</p>
          <p class="anim_p">World Design Capital Busan 2028</p>
          <div class="lines">
            <div class="inner_lines inner_linesleft"></div>
          </div>
        </li>
        <li>
          <p class="anim_p">EVIDENCE</p>
          <p class="anim_p">WDO designation and city design</p>
          <div class="lines">
            <div class="inner_lines inner_linesleft"></div>
          </div>
        </li>
        <li>
          <p class="anim_p">EXPERIENCE</p>
          <p class="anim_p">Walking, riding, staying, saving</p>
          <div class="lines">
            <div class="inner_lines inner_linesleft"></div>
          </div>
        </li>
      </ul>

      <ul>
        <li class="desktop">
          <div class="lines desktop">
            <div class="inner_lines inner_linesright"></div>
          </div>
        </li>
        <li>
          <p class="anim_p2">SCENES</p>
          <p class="anim_p2">Gwangalli, Cheongsapo, Dadaepo</p>
          <div class="lines">
            <div class="inner_lines inner_linesright"></div>
          </div>
        </li>
        <li>
          <p class="anim_p2">MOOD</p>
          <p class="anim_p2">Pastel sea, moving sea, afterglow</p>
          <div class="lines">
            <div class="inner_lines inner_linesright"></div>
          </div>
        </li>
        <li>
          <p class="anim_p2">RESULT</p>
          <p class="anim_p2">Return desire</p>
          <div class="lines">
            <div class="inner_lines inner_linesright"></div>
          </div>
        </li>
      </ul>
    </div>

    <h1 class="about_title">WDC.2028</h1>
  </div>
</section>`;function o(){return c}function d(i={}){const n=i.container||document.querySelector('[data-transition="container"]'),s=t(n,.32);s?.splitInstance&&(n._splitInstance=s.splitInstance)}function v(){const i=document.querySelector('[data-transition="container"]');if(i?._splitInstance){const n=i.querySelector("h1");n&&a.set(n.querySelectorAll(".char-wrapper > *"),{clearProps:"all"}),i._splitInstance=null,n&&n.querySelectorAll(".char-wrapper").forEach(l=>{const e=l.firstChild;l.parentNode.insertBefore(e,l)})}}export{v as cleanup,o as default,d as init};
