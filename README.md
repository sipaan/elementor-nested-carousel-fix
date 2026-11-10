# Elementor Pro: carousels inside carousels (Loop Carousel + Image Carousel fix)

A workaround for an **Elementor Pro** bug that appears when a **Loop Carousel** (or Nested Carousel) has an **Image Carousel** inside its slides, for example a listing card with a photo gallery:

1. **The arrows are linked.** The Loop Carousel's arrows get wired to the arrows of the photo carousel in the first card. Its own "next" arrow does nothing, and clicking a photo arrow in that card moves the photos **and** the whole Loop Carousel.
2. **The arrow style bleeds.** The Loop Carousel's arrow style (e.g. a background colour) also applies to the photo arrows inside the cards.
3. **Soft photo edges** (with "Offset sides" set): the slides are a fraction of a pixel wide (e.g. 333.2px) while the photo carousel rounds to 333px, so a sliver of the neighbouring photo shows at the edges and they look blurry.

Tested with Elementor 4.3.6 and Elementor Pro 4.3.3 (WordPress 7.1, PHP 8.5). The Elementor Pro changelog up to 4.4.0 (9 Nov 2026) has no fix for it.

**Upstream issue:** https://github.com/elementor/elementor/issues/ (link added once filed)

## Confirmed by Elementor support

Reported through Elementor Pro support in **case #TSITOR21SUOF** on 18 Aug 2025. The Tier 2 team confirmed it the same day ("this is a current bug we're experiencing with the image carousel inside a loop carousel") and passed it to their developers, without an ETA. The only workaround offered was to replace the Image Carousel with a single Featured Image. This repository has a workaround that keeps the photo carousel.

## The cause

In Elementor Pro's Loop Carousel handler (`modules/loop-builder/assets/js/frontend/handlers/loop-carousel.js`, `getSwiperSettings`), and the same in the Nested Carousel handler:

```js
const widgetSelector = `.elementor-element-${this.getID()}`;
swiperOptions.navigation = {
	prevEl: `${widgetSelector} .elementor-swiper-button-prev`,
	nextEl: `${widgetSelector} .elementor-swiper-button-next`,
};
```

That descendant selector also matches the `.elementor-swiper-button-*` arrows of every carousel inside the slides. Swiper (with `uniqueNavElements`) then resolves it to the first match inside the swiper element, which is a photo arrow, not the Loop Carousel's own arrow. The CSS generated for the arrow style controls uses the same descendant pattern (`.elementor-element-<id> :is(.elementor-swiper-button-prev, .elementor-swiper-button-next)`), so the style reaches the photo arrows too.

The soft edges come from "Offset sides": the Loop Carousel uses `slidesPerView: 3.001`, so its slides get fractional widths, while the photo carousel inside sizes its slides in whole pixels. The photo then sits a fraction of a pixel off in its frame.

## The fix in this repository

- **JavaScript** ([`elementor-nested-carousel-fix.js`](elementor-nested-carousel-fix.js)): once Elementor has built a Loop or Nested Carousel, re-points its Swiper navigation to its **own** arrow buttons (those whose closest widget is the carousel itself), and turns on Swiper's `roundLengths` for it and the carousels in its slides. Elementor builds carousels without an event, some only when they scroll into view, so the script watches for Swiper's `swiper-initialized` class instead of polling. It does nothing on pages without a Loop or Nested Carousel. RTL is handled like Elementor does (arrows swapped).
- **CSS** ([`elementor-nested-carousel-fix.css`](elementor-nested-carousel-fix.css)): keeps the photo arrows inside a Loop/Nested Carousel transparent.

## Install

**WordPress, without touching the theme:** paste [`wordpress-snippet.php`](wordpress-snippet.php) into a code snippets plugin (FluentSnippets, Code Snippets, WPCode) as a PHP snippet that runs everywhere, or into a child theme's `functions.php`. It prints the CSS and JS in the footer.

**Or** load the two files yourself: the CSS anywhere, the JS in the footer (or after `DOMContentLoaded`).

Remove it once Elementor fixes the bug.

## Test results

On a live site, Chrome, Loop Carousel with arrows and an Image Carousel (dynamic gallery, arrows on) in the loop item:

| | Without the fix | With the fix |
|---|---|---|
| Click a photo arrow in a card | photos **and** Loop Carousel move | only the photos move |
| Click the Loop Carousel's arrow | nothing (wired to a photo arrow) | the Loop Carousel moves, photos stay |
| Photo arrow background | the Loop Carousel's arrow colour | transparent |
| Photo edge vs. frame | 0.2px off, sliver of the neighbouring photo | flush (0px) |
| Sliders with whole-pixel sizes | — | 30 of 30, including those built on scroll |

Not tested: right-to-left sites; a carousel that Elementor destroys and rebuilds later isn't re-wired.

## Suggested upstream fix

Only use the widget's own buttons in `getSwiperSettings`, for example:

```js
const own = ( selector ) => this.$element.find( selector ).filter( ( i, el ) => el.closest( '.elementor-widget' ) === this.$element[ 0 ] ).get();

if ( 'yes' === elementSettings.arrows ) {
	swiperOptions.navigation = {
		prevEl: own( isRtl ? '.elementor-swiper-button-next' : '.elementor-swiper-button-prev' ),
		nextEl: own( isRtl ? '.elementor-swiper-button-prev' : '.elementor-swiper-button-next' ),
	};
}
```

scope the navigation style selectors to the widget's own buttons instead of `{{WRAPPER}} .elementor-swiper-button`, and consider `roundLengths: true` in the carousel base settings.

## Licence

MIT, see [LICENSE](LICENSE).
