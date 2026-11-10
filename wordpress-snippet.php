<?php
/**
 * Elementor Pro: carousels inside carousels, as a WordPress snippet.
 * https://github.com/sipaan/elementor-nested-carousel-fix (MIT)
 *
 * Paste into a code snippets plugin (FluentSnippets, Code Snippets, WPCode) as a PHP snippet
 * that runs everywhere, or into a child theme's functions.php. It prints the CSS and JS of this
 * repository in the footer. Remove it once Elementor fixes the bug.
 */
add_action( 'wp_footer', function () {
	?>
<style>
.elementor :is(.elementor-widget-loop-carousel, .elementor-widget-n-carousel) .elementor-widget-image-carousel .elementor-swiper-button.elementor-swiper-button {
	background-color: transparent;
}
</style>
<script>
(function () {
	var widgets = Array.prototype.slice.call(document.querySelectorAll('.elementor-widget-loop-carousel, .elementor-widget-n-carousel'));
	if (!widgets.length) {
		return;
	}
	function own(widget, selector) {
		return Array.prototype.filter.call(widget.querySelectorAll(selector), function (el) {
			return el.closest('.elementor-widget') === widget;
		});
	}
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
	function roundLengths(widget) {
		Array.prototype.forEach.call(widget.querySelectorAll('.swiper-initialized'), function (el) {
			if (el.swiper && !el.swiper.params.roundLengths) {
				el.swiper.params.roundLengths = true;
				el.swiper.update();
			}
		});
	}
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
})();
</script>
	<?php
}, 100 );
