var lemons = new Firebase("https://lemons.firebaseio.com/")

function refreshStatus(){
	var macs = document.getElementsByClassName("mac");
	for(var i = 0; i < macs.length; i++){
		macs[i].className = macs[i].className.replace(/ ?online ?/g, ' ');
	}
	PUBNUB.publish({
		channel: "signalling",
		message: {}
	})
}

document.getElementById('update').onclick = refreshStatus;


PUBNUB.subscribe({
	channel: "listing",
	message: function(m){
		console.log(m)
		var macs = document.getElementsByClassName("mac");
		var match = [].slice.call(macs, 0).filter(function(e){
			if(e.querySelector('.user').innerHTML.trim() == m[2] && e.querySelector('.name').innerHTML.trim() == m[3].replace(".local","")){
				return true
			}
			return false
		})
		if(match.length == 1){
			var el = match[0];
			el.className += ' online ';
			if(el.id){
				var mac = lemons.child(el.id);
				mac.child('online').set(Date.now())
				mac.child('uuid').set(m[1])
				mac.child('user').set(m[2])
				mac.child('name').set(m[3])
				mac.child('version').set(m[4])
				mac.child('ip').set(m[5])
			}else{
				console.error("THIS MAC HAS NO ID", el)
			}

		}else if(match.length == 0){
			console.warn('mac not found')
		}
		console.log(match.length, match)
	}
})
function $(id){return document.getElementById(id)}

function clickMac(){
	if(!this.id){
		console.error("no id for this mac", this);
		return;
	}
	var mac = lemons.child(this.id);
	$('compid').innerHTML = this.id;
	mac.child('online').once('value', function(val){
		var elapsed = Date.now() - val.val();
		var sec = elapsed / 1000, min = sec / 60, hour = min / 60;
		if(hour > 1000){
			$('componline').innerHTML = 'never'	
		}else{
			$('componline').innerHTML = min < 2 ? 'a few seconds ago' : (hour < 1 ? (Math.round(min) + ' minutes ago') : (Math.round(hour) + ' hours ago'));	
		}
		
	})
	
	console.log(mac)

}

function init(){
	var macs = document.getElementsByClassName('mac');
	for (var i = macs.length - 1; i >= 0; i--) {
		macs[i].onclick = clickMac;
	};
}

window.onload = function(){
	init();	
}
