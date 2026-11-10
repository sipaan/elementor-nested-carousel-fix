/*!
 * Elementor Pro: carousels inside carousels.
 * https://github.com/sipaan/elementor-nested-carousel-fix (MIT)
 *
 * A Loop Carousel or Nested Carousel finds its arrows with
 * ".elementor-element-<id> .elementor-swiper-button-next", which also matches the arrows of an
 * Image Carousel inside its slides: its arrows get wired to a slide's photo arrows. Its "3.001"
 * slides (with Offset sides) also leave photos a fraction of a pixel off in their frame.
 * This gives each carousel its own arrows back and makes all their slides whole pixels.
 * Load it in the footer (or after DOMContentLoaded), together with the CSS file.
 */
(function () {
	function start() {
		var widgets = Array.prototype.slice.call(document.querySelectorAll('.elementor-widget-loop-carousel, .elementor-widget-n-carousel'));
		if (!widgets.length) {
			return;
		}

		// The elements matching selector inside widget that belong to it, not to a widget inside it.
		function own(widget, selector) {
			return Array.prototype.filter.call(widget.querySelectorAll(selector), function (el) {
				return el.closest('.elementor-widget') === widget;
			});
		}

		// Wire the carousel's arrows to its own buttons; false while Elementor hasn't built it yet.
		function wireArrows(widget) {
			var el = own(widget, '.swiper')[0];
			var swiper = el && el.swiper;
			if (!swiper) {
				return false;
			}
			var nav = swiper.params.navigation;
			if (nav && nav.nextEl) {
				var rtl = window.elementorFrontend && elementorFrontend.config.is_rtl;
				swiper.navigation.destroy();
				nav.nextEl = own(widget, rtl ? '.elementor-swiper-button-prev' : '.elementor-swiper-button-next');
				nav.prevEl = own(widget, rtl ? '.elementor-swiper-button-next' : '.elementor-swiper-button-prev');
				swiper.navigation.init();
				swiper.navigation.update();
			}
			return true;
		}

		// Whole-pixel sizes for the carousel and the carousels in its slides, so photos fill their frame.
		function roundLengths(widget) {
			Array.prototype.forEach.call(widget.querySelectorAll('.swiper-initialized'), function (el) {
				if (el.swiper && !el.swiper.params.roundLengths) {
					el.swiper.params.roundLengths = true;
					el.swiper.update();
				}
			});
		}

		// Elementor builds each carousel without an event, some only when they scroll into view;
		// Swiper marks a built one with the class swiper-initialized, so act on class changes.
		var pending = widgets.slice();
		var queued = false;
		function check() {
			queued = false;
			pending = pending.filter(function (widget) {
				return !wireArrows(widget);
			});
			widgets.forEach(roundLengths);
		}
		var observer = new MutationObserver(function () {
			if (!queued) {
				queued = true;
				requestAnimationFrame(check);
			}
		});
		widgets.forEach(function (widget) {
			observer.observe(widget, { subtree: true, attributes: true, attributeFilter: ['class'] });
		});
		check();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start);
	} else {
		start();
	}
})();
