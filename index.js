var CronJob = require('cron').CronJob;
var http = require('http-request');
var HTMLParser = require('fast-html-parser');
var SlackWebhook = require('slack-webhook');
var slack = new SlackWebhook('https://hooks.slack.com/services/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');

var currentYear = null;
var currentMonth = null;
var current6Month = null;

var getPriceFromHTML = function ( htmlParsed, selector, index ) {

	var price = null;
	index = index | 0;
	var obj = htmlParsed.querySelectorAll(selector)[ index ];

	if ( obj && obj.childNodes && obj.childNodes[ 0 ] ){
		price = obj.childNodes[ 0 ].rawText;
	}

	return price;
};

var getCodeSchoolPrices = function() {

	http.get('https://www.codeschool.com/pricing', function( err, data ){

		if ( !err ){

			var html = data.buffer.toString();
			var htmlParsed = HTMLParser.parse(html);
			var sixMonthPrice = getPriceFromHTML(htmlParsed, '.js-price-target');
			var monthlyPrice = getPriceFromHTML(htmlParsed, '#monthly-price');
			var yearlyPrice = getPriceFromHTML(htmlParsed, '.js-price-target', 1);

			yearlyPrice = yearlyPrice ? yearlyPrice : sixMonthPrice;

			if ( !yearlyPrice ){
				yearlyPrice = sixMonthPrice;
				sixMonthPrice = null;
			}

			if ( yearlyPrice !== currentYear || monthlyPrice !== currentMonth ){
				slack.send({
					text: '@tiago @gcardoso @bruno.assuncao @claudia_bernardo @ricardo.proenca @goncalo.assuncao @iranha'+
					'NEW CODE SCHOOL PRICES!!!\n'+
					'*Yearly plan:* $' + yearlyPrice + '/mo ($'+ parseInt( yearlyPrice, 10 ) * 12 + ')' +
					'\n*Montly plan:* $' + monthlyPrice + '/mo' +
					( sixMonthPrice ? '\n*6-Monthly plan:* $' + sixMonthPrice + '/mo ($'+ parseInt( yearlyPrice, 10 ) * 6 + ')' : '\n' ) +
					'\nhttps://www.codeschool.com/pricing',
					icon_emoji: ':ghost:',
					username: 'Dragon Bot',
					link_names: 1
				});

				currentYear = yearlyPrice;
				currentMonth = monthlyPrice;
				current6Month = sixMonthPrice;
			}

		} else {
			console.log( err );
		}

	});

};

var job = new CronJob({
	cronTime: '00 00,30 * * * 0-6',
	onTick: getCodeSchoolPrices,
	start: false,
	timeZone: 'Europe/Lisbon'
});

job.start();

getCodeSchoolPrices();