var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var fs = require('fs');
fs.readFile(process.argv[2], 'utf8', function (err,bot_token) {
	if (err) {
		return console.log(err);
	}
	const mtg = require('mtgsdk');

	var rtm = new RtmClient(bot_token.trim());

	rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
		if(message.type == 'message' && message.hasOwnProperty('text') && message.text.indexOf("[[") != -1 && message.text.indexOf("]]") != -1)
		{
			console.log("i'm matching " + message.text);
			var matches = message.text.match(/\[\[[\w ,\-']+\]\]/gi);
			console.log(matches);

			if (matches == null)
			{
				matches = '';
			}

			for (var f = 0, matchesLen = matches.length; f < matchesLen; f++)
			{
				var left = matches[f].search("\\[\\[") + 2;
				var right = matches[f].search("\\]\\]");
				var res = matches[f].slice(left, right);

				if (res.indexOf("//") > 0)
				{
					res = "\"" + res.slice(0, res.indexOf("//")).trim() + "\"";
				}	

				res = res.replace("’", "%27");

				if(res == "Slambo" || res == "slambo")
				{
					var t = Date.now();
					console.log(t);

					if(t % 2 == 0)
					{
						url = "http://i.imgur.com/4vFIe9d.jpg";
					}
					else
					{
						url = "http://i.imgur.com/kZyW3EP.png";
					}

					rtm.sendMessage(url, message.channel);
				}

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
		}
	});

	rtm.start();
});
