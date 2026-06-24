import imagesLoaded from "./imagesLoaded";
import Scene from "./rolls";

const scene = new Scene("container");
const STAGE_WIDTH = 900;
const STAGE_HEIGHT = 1440;
const UNROLL_START_VIEWPORT = 0.95;
const UNROLL_END_VIEWPORT = 0.05;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
  .matches;

// helper functions
const MathUtils = {
  // map number x from range [a, b] to [c, d]
  map: (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c,
  // linear interpolation
  lerp: (a, b, n) => (1 - n) * a + n * b,
  clamp: (x, min, max) => Math.min(Math.max(x, min), max),
  smoothstep: x => x * x * (3 - 2 * x)
};

const body = document.body;

// calculate the viewport size
let winsize;
let stageScale = 1;
const getViewportSize = () => {
  const viewport = window.visualViewport;
  return {
    width: viewport && viewport.width ? viewport.width : window.innerWidth,
    height: viewport && viewport.height ? viewport.height : window.innerHeight
  };
};
const calcWinsize = () => {
  winsize = getViewportSize();
  stageScale = Math.min(winsize.width / STAGE_WIDTH, winsize.height / STAGE_HEIGHT);
  document.documentElement.style.setProperty("--stage-scale", stageScale);
  return winsize;
};
let IMAGES;
calcWinsize();
// and recalculate on resize
let resizeRaf = null;
const requestResize = () => {
  if (resizeRaf !== null) {
    cancelAnimationFrame(resizeRaf);
  }
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = null;
    calcWinsize();
    window.dispatchEvent(new CustomEvent("unroll:resize"));
  });
};
window.addEventListener("resize", requestResize);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", requestResize);
}

window.onbeforeunload = function() {
  window.scrollTo(0, 0);
};

// scroll position and update function
let docScroll;
const getPageYScroll = () =>
  (docScroll = window.pageYOffset || document.documentElement.scrollTop);
window.addEventListener("scroll", getPageYScroll);

// Item
class Item {
  constructor(el, scroll) {
    // the .item element
    this.scroll = scroll;
    this.DOM = { el: el.img };
    this.currentScroll = docScroll;
    this.isVisible = false;

    // set the initial values
    this.getSize();
    this.mesh = scene.createMesh({
      width: this.width,
      height: this.height,
      src: this.src,
      image: this.DOM.el,
      iWidth: this.DOM.el.width,
      iHeight: this.DOM.el.height
    });
    this.mesh.visible = false;
    scene.scene.add(this.mesh);
    let options = {
      root: null,
      rootMargin: "0px",
      threshold: [0, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
    };
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        this.isVisible = entry.intersectionRatio > 0.0;
        this.mesh.visible = this.isVisible;
        if (this.isVisible) {
          this.render();
        }
        this.scroll.shouldRender = true;
      });
    }, options);
    this.observer.observe(this.DOM.el);
    this.render();
  }

  getSize() {
    // get all the sizes here, bounds and all
    const bounds = this.DOM.el.getBoundingClientRect();
    const fromTop = bounds.top;
    const windowHeight = window.innerHeight;
    const withoutHeight = fromTop - windowHeight;
    const withHeight = fromTop + bounds.height;
    this.insideTop = withoutHeight - docScroll;
    this.insideRealTop = fromTop + docScroll;
    this.insideBottom = withHeight - docScroll + 50;
    this.width = bounds.width;
    this.height = bounds.height;
    this.left = bounds.left;
  }
  resize() {
    // on resize rest sizes and update the translation value
    this.getSize();
    this.mesh.scale.set(this.width, this.height, 200);
    this.render();
    this.scroll.shouldRender = true;
  }

  render() {
    this.currentScroll = docScroll;
    const bounds = this.DOM.el.getBoundingClientRect();
    this.width = bounds.width;
    this.height = bounds.height;
    this.left = bounds.left;
    this.mesh.position.y =
      winsize.height / 2 - bounds.top - bounds.height / 2;
    this.mesh.position.x = 0 - winsize.width / 2 + bounds.left + bounds.width / 2;
    this.mesh.scale.set(bounds.width, bounds.height, bounds.width / 2);
    const rawProgress = MathUtils.map(
      bounds.top,
      winsize.height * UNROLL_START_VIEWPORT,
      winsize.height * UNROLL_END_VIEWPORT,
      0,
      1
    );
    const progress = MathUtils.smoothstep(MathUtils.clamp(rawProgress, 0, 1));

    this.mesh.material.uniforms.progress.value = progress;
  }
}

// SmoothScroll
class SmoothScroll {
  constructor() {
    this.shouldRender = false;
    // the <main> element
    this.DOM = { main: document.querySelector("main") };
    // the scrollable element
    // we translate this element when scrolling (y-axis)
    this.DOM.scrollable = this.DOM.main.querySelector("div[data-scroll]");
    // the items on the page
    this.items = [];

    this.createItems();
    this.handleResize = () => this.resize();

    // here we define which property will change as we scroll the page
    // in this case we will be translating on the y-axis
    // we interpolate between the previous and current value to achieve the smooth scrolling effect
    this.renderedStyles = {
      translationY: {
        // interpolated value
        previous: 0,
        // current value
        current: 0,
        // amount to interpolate
        ease: 0.1,
        // current value setter
        // in this case the value of the translation will be the same like the document scroll
        setValue: () => docScroll
      }
    };
    // set the body's height
    this.setSize();
    // set the initial values
    this.update();
    // the <main> element's style needs to be modified
    this.style();
    // init/bind events
    this.initEvents();
    // start the render loop
    requestAnimationFrame(() => this.render());
    requestAnimationFrame(this.handleResize);
    setTimeout(this.handleResize, 250);
  }

  update() {
    // sets the initial value (no interpolation) - translate the scroll value
    for (const key in this.renderedStyles) {
      this.renderedStyles[key].current = this.renderedStyles[
        key
      ].previous = this.renderedStyles[key].setValue();
    }
    // translate the scrollable element
    this.setPosition();
    this.shouldRender = true;
  }
  setPosition() {
    // translates the scrollable element
    if (
      Math.round(this.renderedStyles.translationY.previous) !==
        Math.round(this.renderedStyles.translationY.current) ||
      this.renderedStyles.translationY.previous < 10
    ) {
      this.shouldRender = true;
      this.DOM.scrollable.style.transform = `translate3d(0,${-1 *
        this.renderedStyles.translationY.previous /
        stageScale}px,0)`;
      // console.log(this.items);
      for (const item of this.items) {
        // if the item is inside the viewport call it's render function
        // this will update the item's inner image translation, based on the document scroll value and the item's position on the viewport
        if (item.isVisible) {
          item.render();
        }
      }
    }

    if (this.shouldRender) {
      this.shouldRender = false;
      scene.render();
    }
  }
  setSize() {
    // set the heigh of the body in order to keep the scrollbar on the page
    // console.log(this.DOM.scrollable.scrollHeight, 'HEIGHT');
    body.style.height = `${Math.max(
      this.DOM.scrollable.scrollHeight * stageScale,
      winsize.height
    )}px`;
  }

  createItems() {
    IMAGES.forEach(image => {
      if (image.img.classList.contains("js-image")) {
        this.items.push(new Item(image, this));
      }
    });
  }

  style() {
    // the <main> needs to "stick" to the screen and not scroll
    // for that we set it to position fixed and overflow hidden
    this.DOM.main.style.position = "fixed";
    this.DOM.main.style.width = this.DOM.main.style.height = "100%";
    this.DOM.main.style.top = this.DOM.main.style.left = 0;
    this.DOM.main.style.overflow = "hidden";
  }
  initEvents() {
    // on resize reset the body's height
    window.addEventListener("unroll:resize", this.handleResize);
  }
  resize() {
    calcWinsize();
    this.items.forEach(item => item.resize());
    this.setSize();
    this.update();
  }
  render() {
    // update the current and interpolated values
    for (const key in this.renderedStyles) {
      this.renderedStyles[key].current = this.renderedStyles[key].setValue();
      this.renderedStyles[key].previous = MathUtils.lerp(
        this.renderedStyles[key].previous,
        this.renderedStyles[key].current,
        this.renderedStyles[key].ease
      );
    }
    // and translate the scrollable element
    this.setPosition();

    // loop..
    requestAnimationFrame(() => this.render());
  }
}

/***********************************/
/********** Preload stuff **********/

// Preload images
const preloadImages = new Promise((resolve, reject) => {
  imagesLoaded(document.querySelectorAll("img"), { background: true }, resolve);
});

preloadImages.then(images => {
  IMAGES = images.images;
});

const preloadEverything = [preloadImages];

// And then..
Promise.all(preloadEverything).then(() => {
  // Remove the loader
  document.body.classList.remove("loading");
  document.body.classList.add("loaded");
  // Get the scroll position
  getPageYScroll();
  // Initialize the Smooth Scrolling
  if (!prefersReducedMotion) {
    new SmoothScroll();
  }
});
