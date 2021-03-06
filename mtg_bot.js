var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var fs = require('fs');
fs.readFile(process.argv[2], 'utf8', function (err,bot_token) {
	if (err) {
		return console.log(err);
	}

	const mtg = require('mtgsdk');

	var rtm = new RtmClient(bot_token.trim());
	
	console.log('Ready');

	rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
		if(message.type == 'message' && message.hasOwnProperty('text'))
		{
			//Matches any MtG card name between [[brackets]]
			if ((matches = message.text.match(/\[\[[\w ,.!?:\-\(\)\/']+\]\]/gi)) != null)
			{
				for (var f = 0, matchesLen = matches.length; f < matchesLen; f++)
				{
					var left = matches[f].search("\\[\\[") + 2;
					var right = matches[f].search("\\]\\]");
					var searchString = matches[f].slice(left, right).trim();

					// Lord only knows what this line does.
					searchString = searchString.replace("’", "%27");

					var quotedString = "\"" + searchString + "\"";

					// Returns the glorious portrait of Zac "Slambo" Hodgkin, when [[Slambo]] is in the message.
					if(searchString == "Slambo" || searchString == "slambo")
					{
						var t = Date.now();
						console.log(t);

						switch(t % 8)
						{
							case 0:  url = "http://i.imgur.com/4vFIe9d.jpg"; break;
							case 1:  url = "http://i.imgur.com/kZyW3EP.png"; break;
							case 2:  url = "https://i.imgur.com/WcpiftW.png"; break;
							case 3:  url = "https://i.imgur.com/qT1bquI.gif"; break;
							case 4:  url = "https://i.imgur.com/SsYiN82.jpg"; break;
							case 5:  url = "https://i.imgur.com/VIFLFAv.jpg"; break;
							case 6:  url = "https://i.imgur.com/gjHxJcD.png"; break;
							default: url = "https://ca.slack-edge.com/T50SNSNF6-U51KKUB0W-480e24985283-512"
						}

						rtm.sendMessage(url, message.channel);
						return;
					}

					// Coolghav finger-guns. [[Zoop]]
					if (searchString == "Zoop" || searchString == "zoop")
					{
						rtm.sendMessage(":coolghav:\n:point_right::point_right:", message.channel);
						return;
					}

					// Selects all cards from the database that match the search string exactly
					mtg.card.where({name: quotedString, contains: 'imageUrl'}).then(
						function(cards)
						{
							if (typeof cards == 'undefined')
							{
								return;
							}

							if (cards.length > 0)
							{
								// If there are multiple matching cards, they are different printings. We don't care, so return the first one.
								rtm.sendMessage(cards[0].imageUrl, message.channel)
							}
							else
							{
								// If there are no strict matches, select all cards that at least contain the search string.
								mtg.card.where({name: searchString, contains: 'imageUrl'}).then(
									function(cards, url)
									{
										if (typeof cards != 'undefined')
										{
											var foundACard = -1;

											// We currently have no way of determining what card the user actually wants in this case. So just pick one...
											for (var i = 0, len = cards.length; i < len; i++)
											{
												console.log(cards[i].name + "  -  " + cards[i].supertypes + "  -  " + cards[i].types + "  -  " + cards[i].set + "  -  " + cards[i].imageUrl)
												
												// As long as it isn't from Vanguard, apparently. This should probably check for card types.
												// I'm now also making it exclude masterpieces, since those tend to be hard to read cough cough invocations.
												if (cards[i].set != 'VAN' && cards[i].set != 'MPS')
												{
													// The algorithm biases towards Legendaries, because those are more likely to be what the user is referring to. 
													// Especially when they just use the proper name, without a descriptor. This will need refinement.
													if (cards[i].supertypes == 'Legendary')
													{
														rtm.sendMessage(cards[i].imageUrl, message.channel);
														return;
													}
													else if (foundACard == -1)
													{
														foundACard = i;
													}
												}
											}

											if (foundACard != -1)
											{
												rtm.sendMessage(cards[foundACard].imageUrl, message.channel);
											}
										}
									}
								);
							}
						}
					);
				}
			} 
			else if (message.text.match(/i'?m bored/gi) != null)
			{
				//Hi mtgbot! I'm bored!
				rtm.sendMessage("Hi Bored! I'm mtgbot!", message.channel);
			}
			else if (message.text.match(/launch[\w '-,]*\?/gi) != null)
			{
				//Screw you and your lunch plans.
				rtm.sendMessage(":rocket:", message.channel);
			}
		}
	});

	rtm.start();
});
