const Discord = require('discord.js');
const config = require('./config.json');
const {log,error} = console;
const http = require('http');
const fs = require('fs');
 
const PORT = config.server.port; //unused port and since now the OFFICIAL ttt_discord_bot port ;)
 
var guild, channel;
 
var muted = {};
 
var get = [];
 
//create discord client
const client = new Discord.Client();
client.login(config.discord.token);
 
client.on('ready', () => {
	log('Bot is ready to mute them all! :)');
	guild = client.guilds.get(config.discord.guild);
//	guild = client.guilds.find('id',config.discord.guild);
	channel = guild.channels.get(config.discord.channel);
//	channel = guild.channels.find('id',config.discord.channel);
});
client.on('voiceStateUpdate',(oldMember,newMember) => {//player leaves the ttt-channel
	if (oldMember.voiceChannel != newMember.voiceChannel && isMemberInVoiceChannel(oldMember)) {
		if (isMemberMutedByBot(newMember) && newMember.serverMute) newMember.setMute(false).then(()=>{
			setMemberMutedByBot(newMember,false);
		});
	}
});
 
isMemberInVoiceChannel = (member) => member.voiceChannelID == config.discord.channel;
isMemberMutedByBot = (member) => muted[member] == true;
setMemberMutedByBot = (member,set=true) => muted[member] = set;
 
get['connect'] = (params,ret) => {
	let tag_utf8 = params.tag.split(" ");
	let tag = "";
 
	tag_utf8.forEach(function(e) {
		tag = tag+String.fromCharCode(e);
	});
 
	let found = guild.members.filterArray(val => val.user.tag.match(new RegExp('.*'+tag+'.*')));
	if (found.length > 1) {
		ret({
			answer: 1 //pls specify
		});
	}else if (found.length < 1) {
		ret({
			answer: 0 //no found
		});
	}else {
		ret({
			tag: found[0].user.tag,
			id: found[0].id
		});
	}
};
 
get['mute'] = (params,ret) => {
	let id = params.id;
	let mute = params.mute
	if (typeof id !== 'string' || typeof mute !== 'boolean') {