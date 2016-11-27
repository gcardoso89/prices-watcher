var CronJob = require('cron').CronJob;
var SlackWebhook = require('slack-webhook');
var config = require('./config');
var slack = new SlackWebhook( process.env.SLACK_WEBHOOK_INCOMING );

//WATCHERS
var codeSchool = require('./watchers/codeSchool');
var jsconf = require('./watchers/jsconfEU');

var codeSchoolJob = new CronJob({
	cronTime: '00 15,45 * * * 0-6',
	onTick: codeSchool( slack ),
	start: false,
	timeZone: 'Europe/Lisbon'
});

var jsconfJob = new CronJob({
	cronTime: '00 00,30 * * * 0-6',
	onTick: jsconf( slack ),
	start: false,
	timeZone: 'Europe/Lisbon'
});

jsconf( slack )( );
codeSchool( slack )( );

codeSchoolJob.start();
jsconfJob.start();