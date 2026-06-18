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
          <p class="anim_p">THEME</p>
          <p class="anim_p">Busan Syndrome</p>
          <div class="lines">
            <div class="inner_lines inner_linesleft"></div>
          </div>
        </li>
        <li>
          <p class="anim_p">CITY</p>
          <p class="anim_p">World Design Capital Busan 2028</p>
          <div class="lines">
            <div class="inner_lines inner_linesleft"></div>
          </div>
        </li>
        <li>
          <p class="anim_p">IDEA</p>
          <p class="anim_p">Designed to be revisited</p>
          <div class="lines">
            <div class="inner_lines inner_linesleft"></div>
          </div>
        </li>
        <li>
          <p class="anim_p">STORYBOARD</p>
          <p class="anim_p">GPT-5.5 -> storyboard</p>
          <div class="lines">
            <div class="inner_lines inner_linesleft"></div>
          </div>
        </li>
      </ul>
      <!-- <img class="img_hero_small" alt="Busan arrival scene" src="/images/home.webp"></img> -->
      <ul>
        <li class="desktop">
          <div class="lines desktop">
            <div class="inner_lines inner_linesright"></div>
          </div>
        </li>
        <li>
          <p class="anim_p2">FLOW</p>
          <p class="anim_p2">Sea, mobility, alleys, night</p>

          <div class="lines">
            <div class="inner_lines inner_linesright"></div>
          </div>
        </li>
        <li>
          <p class="anim_p2">TONE</p>
          <p class="anim_p2">Editorial travel memory</p>

          <div class="lines">
            <div class="inner_lines inner_linesright"></div>
          </div>
        </li>

        <li>
          <p class="anim_p2">MEMORY</p>
          <p class="anim_p2">Saved, replayed, revisited</p>

          <div class="lines">
            <div class="inner_lines inner_linesright"></div>
          </div>
        </li>
        <li>
          <p class="anim_p2">THREE.JS</p>
          <p class="anim_p2">Claude Code Opus 4.8</p>

          <div class="lines">
            <div class="inner_lines inner_linesright"></div>
          </div>
        </li>
      </ul>
    </div>

    <h1 class="home_title">BS.2028</h1>
  </div>
</section>`;function o(){return c}function d(i={}){const n=i.container||document.querySelector('[data-transition="container"]'),s=t(n,.32);s?.splitInstance&&(n._splitInstance=s.splitInstance)}function v(){const i=document.querySelector('[data-transition="container"]');if(i?._splitInstance){const n=i.querySelector("h1");n&&a.set(n.querySelectorAll(".char-wrapper > *"),{clearProps:"all"}),i._splitInstance=null,n&&n.querySelectorAll(".char-wrapper").forEach(e=>{const l=e.firstChild;e.parentNode.insertBefore(l,e)})}}export{v as cleanup,o as default,d as init};
