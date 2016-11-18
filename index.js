var CronJob = require('cron').CronJob;
var http = require('http-request');
var HTMLParser = require('fast-html-parser');
var SlackWebhook = require('slack-webhook');
var slack = new SlackWebhook('https://hooks.slack.com/services/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');

var getPriceFromHTML = function ( htmlParsed, selector ) {

	var price = null;
	var obj = htmlParsed.querySelector(selector);

	if ( obj && obj.childNodes ){
		price = obj.childNodes[ 0 ].rawText;
	}

	return price;
};

var getCodeSchoolPrices = function() {

	http.get('https://www.codeschool.com/pricing', function( err, data ){

		if ( !err ){
			var html = data.buffer.toString();
			var htmlParsed = HTMLParser.parse(html);
			var yearlyPrice = getPriceFromHTML(htmlParsed, '.js-price-target');
			var monthlyPrice = getPriceFromHTML(htmlParsed, '#monthly-price');

			slack.send({
				text: '@tiago @gcardoso @bruno.assuncao @claudia_bernardo @ricardo.proenca @goncalo.assuncao @iranha Code school prices: *' + yearlyPrice + '*$/year | *' + monthlyPrice + '*$/month\nhttps://www.codeschool.com/pricing',
				icon_emoji: ':ghost:',
				link_names: 1
			})
		}

	});

};

var job = new CronJob({
	cronTime: '00 30 10,12,14,16,18 * * 0-6',
	onTick: getCodeSchoolPrices,
	start: false,
	timeZone: 'Europe/Lisbon'
});

job.start();