/**
 * jFeexMixer - jQuery plugin to embed the multifeed in your website via Google Feed API.
 * @requires jQuery v1.4.2 or above
 *
 * http://www.calmtech.net/jfeedmixer
 *
 * Copyright (c) 2010 Masaya Kogawa (CalmTech)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Version: 0.2.1
 */
(function($) {
	$.extend({
		jFeedMixer: new function() {
			this.defaults = {
				feeds: new Array(),
				countPerFeed: 5,
				countLimit: 10,
				feedFormat: '<li><a href="%link">%title(%date)【%blogTitle】[%category]</a></li>',
				beforeFeeds: '<ul>',
				afterFeeds: '</ul>',
				dateFormat: 'yyyy.mm.dd',
				categorySeparator: ', ',
				nocache: false
			};
		}
	});

	$.fn.jFeedMixer = function(options) {
		var target = this;
		var config = {};
		var entries = [];
		var loaded = 0;
		var container = null;

		function feedFormat(format, entry) {
			format = format.replace('%link', entry.link);
			format = format.replace('%title', entry.title);
			format = format.replace('%date', dateFormat(new Date(entry.publishedDate)));
			format = format.replace('%blogTitle', entry.blogTitle);
			format = format.replace('%blogURL', entry.blogURL);
			format = format.replace('%category', categoryFormat(entry.categories));

			return format;
		}

		function dateFormat(date) {
			var format = config.dateFormat;

			format = format.replace('yyyy', date.getFullYear());

			mm = date.getMonth() + 1;
			if(mm < 10) mm = "0" + mm;
			format = format.replace('mm', mm);

			dd = date.getDate();
			if(dd < 10) dd = "0" + dd;
			format = format.replace('dd', dd);

			H = date.getHours();
			if(H < 10) H = "0" + H;
			format = format.replace('H', H);

			i = date.getMinutes();
			if(i < 10) i = "0" + i;
			format = format.replace('i', i);

			s = date.getSeconds();
			if(s < 10) s = "0" + s;
			format = format.replace('s', s);

			return format;
		}

		function categoryFormat(categories) {
			return categories.join(config.categorySeparator);
		}

		function compare(a, b) {
			return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
		}

		function afterLoad() {
			if(config.feeds.length == loaded) {
				$(target).empty();
				entries.sort(compare);
				var limit = config.countLimit <= entries.length ? config.countLimit : entries.length;
				for(j = 0; j < limit; j++) {
					container.append(feedFormat(config.feedFormat, entries[j]));
				}
				container.appendTo(target);
			}
		}

		return this.each(function(){
			config = $.extend({}, $.jFeedMixer.defaults, options);
			container = $(config.beforeFeeds + config.afterFeeds);

			if(config.feedFormat.search(/.jfm.html$/) >= 0) {
				$.ajax({
					type: 'GET',
					url: config.feedFormat,
					success: function(data, dataType) {
						config.feedFormat = data;
					}
				});
			}

			$.each(config.feeds, function(i, url) {
				if(config.nocache) {
					url += '?' + (new Date()).getTime();
				}
				var gfeed = new google.feeds.Feed(url);
				gfeed.setNumEntries(config.countPerFeed);
				gfeed.load(function(result) {
					if(!result.error) {
						var feed = result.feed;
						$.each(feed.entries, function(i, entry) {
							entry.blogTitle = feed.title;
							entry.blogURL = feed.link;
							entries.push(entry);
						});
						loaded++;
						afterLoad();
					}
				});
			});
		});
	};
})(jQuery);
