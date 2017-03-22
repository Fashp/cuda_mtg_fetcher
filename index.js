var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var fs = require('fs');
fs.readFile('../token', 'utf8', function (err,bot_token) {
	if (err) {
		return console.log(err);
	}
	const mtg = require('mtgsdk');

	var rtm = new RtmClient(bot_token.trim());

	rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
		if(message.type == 'message' && message.hasOwnProperty('text') && message.text.indexOf("[[") != -1 && message.text.indexOf("]]") != -1)
		{
			var left = message.text.search("\\[\\[") + 2;
			var right = message.text.search("]]");
			var res = message.text.slice(left, right);

			if (res.indexOf("//") > 0)
			{
				res = "\"" + res.slice(0, res.indexOf("//")).trim() + "\"";
			}	

			res = res.replace("’", "%27");

			mtg.card.where({name: res}).then(
				function(cards)
				{
					if (typeof cards != 'undefined')
					{
						for (var i = 0, len = cards.length; i < len; i++)
						{
							console.log(cards[i].name);
							if (typeof cards[i].imageUrl != 'undefined' && cards[i].set != 'VAN')
							{
								rtm.sendMessage(cards[i].imageUrl, message.channel);
								break;
							}
						}
					}
				}
			);
		}
	});

	rtm.start();
});
