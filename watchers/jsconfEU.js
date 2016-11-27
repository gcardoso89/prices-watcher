var http = require('http-request');
var HTMLParser = require('fast-html-parser');
var currentPrices = [];

var searchChildNodes = function( obj, classSelector, tagName, prices ) {
	if ( obj && obj.childNodes ){
		for ( var i = 0; i < obj.childNodes.length; i++ ) {
			var child = obj.childNodes[i];
			if ( child.tagName === tagName && child.classNames.indexOf( classSelector ) !== -1 ){
				prices.push( child.childNodes[ 0 ].rawText );
			} else {
				searchChildNodes( child, classSelector, tagName, prices );
			}
		}
	}
};

var getPricesFromHTML = function ( htmlParsed, containerSelector ) {
	var obj = htmlParsed.querySelector(containerSelector);
	var prices = [];
	searchChildNodes( obj, 'tito-ticket-name', 'label', prices );
	return prices;
};

module.exports = function( slack ) {
	return function(  ) {
		http.get('https://ti.to/jsconfeu/jsconfeu2017', function( err, data ){
			if ( !err ){
				var html = data.buffer.toString();
				var htmlParsed = HTMLParser.parse(html);
				var prices = getPricesFromHTML( htmlParsed, '#tito-releases' );

				if ( currentPrices.length !== prices.length ){
					currentPrices = prices;
					var pricesStr = '- _' + currentPrices.join( '_\n - _' );
					pricesStr += '_';

					slack.send({
						text: '@gcardoso '+
						'*JSCONF 2017 prices updated!!!*\n'+
						pricesStr+'\n'+
						'Get your fucking ass up and go buy them: https://ti.to/jsconfeu/jsconfeu2017',
						icon_emoji: ':ghost:',
						username: 'Dragon Bot',
						link_names: 1
					});
				}

			} else {
				console.log( err );
			}

		});
	}
};