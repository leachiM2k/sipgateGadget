var sipgate = {
	username: null,
	password: null,
	team: false,
	sender: null,
	sg_connection: null,
	contacts: [],
	autocompleter: null,
	onLoad: function() {
		System.Gadget.settingsUI = "settings.html";
		System.Gadget.onSettingsClosed = this.settingsClosed.bind(this);
		this.username = System.Gadget.Settings.readString('sipgate_username');
		this.password = System.Gadget.Settings.readString('sipgate_password');
		this.team = (System.Gadget.Settings.readString('sipgate_team') == 'True');
		this.sender = System.Gadget.Settings.readString('sipgate_sender');
	    this.sg_connection = new Sipgate(this.team);
		this.login();
	},
	settingsClosed: function(b) {
		var username = System.Gadget.Settings.readString('sipgate_username');
		var password = System.Gadget.Settings.readString('sipgate_password');
		var team = (System.Gadget.Settings.readString('sipgate_team') == 'True');
		if(username != '' && password != '' && team != '' && (username != this.username || password != this.password || team != this.team))
		{
			//$('debug').set('text', 'settings changed');
			this.username = username;
			this.password = password;
			this.team = team;
			this.login();
		}
	},
	login: function() {
	    if (this.username && this.password) {
	        if (this.sg_connection.login(this.username, this.password)) {
	            if (this.team) {
	                $('site_info').set('text','team');
	            } else {
	                $('site_info').set('text','classic');
	            }
	            this.getBalance();
				this.getContacts();
				$('loggedOff').setStyle('display', 'none');
				if (System.Gadget.docked)
				$('imgBackground').src = "images/bgimage" + (System.Gadget.docked ? "-small" : " 3") + ".png"; 				
//	            $('button').erase('disabled').set('opacity', 1);
	            return;
	        } else {
				$('site_info').set('text','login failed');
	        }
	    } else {
	        $('site_info').set('text','no login data');
	    }
	    $('site_info').set('text','offline');
//	    $('button').set('disabled', true).set('opacity', 0.6);
		$('loggedOff').setStyle('display', 'block');
		$('imgBackground').src = "images/back.png";
//		$('loggedOff').set('opacity', 0.6);
	},
	getBalance: function() {
	    if (this.sg_connection.is_online==false) return;
	    var r = this.sg_connection.call('samurai.BalanceGet');
	    if (r && r['CurrentBalance']) {
	        var balance=r['CurrentBalance']['TotalIncludingVat'];
	       
	        document.getElementById("balance_info").innerHTML="Guthaben: "+(Math.floor(balance*100)/100).toFixed(2)+' '+r['CurrentBalance']['Currency'];
	
	    }
	},
	getContacts: function() {
		if (this.sg_connection.is_online==false) return;
		var params = {
			'EntryIDList': []
		};
		var r = this.sg_connection.call('samurai.PhonebookEntryGet', params);

		if (r && r['EntryList'] && r['EntryList'].length > 0) {
			var contacts = [];
			for (var i = r.EntryList.length - 1; i >= 0; i--){
				var vcard = r.EntryList[i].Entry;
		        var name=vcard.match(/FN(;?[^:]*):([^\n\r]+)/);
		        var tels=vcard.match(/TEL;type=[^\n\r]+/ig);
		        
		        if ($type(tels)=="array") tels.each(function(tel) {
		            var matchtel=tel.match(/TEL;type=([^;:]+)[^:]*:([^$]+)/i);
		            if (matchtel && typeof matchtel[0]!=="undefined") {
		                if (matchtel[1].toUpperCase()=="CELL") {
							contacts.push(name[2]+' ('+matchtel[2]+')');
						}
		            }
		        });
			};
			this.contacts = contacts;
			
		    this.autocompleter = new Autocompleter.Local('sms_recipients', contacts, {
		        'filterSubset': true,
		        'maxChoices':8,
		        'minLength': 1, // We wait for at least one character
				'overflow': false,
		        'injectChoice':function(token) {
		            var matched=token.match(/^([^(]+)\(([^\)]+)/);
		        
		            var choice = new Element('li');
								            
		            if (matched && typeof matched[1] !== 'undefined' && typeof matched[2] !== 'undefined') {
		                new Element('span', {'html': this.markQueryValue(matched[1])}).inject(choice);
		                choice.inputValue = matched[2];
		            } else {
		                new Element('span', {'html': this.markQueryValue(token)}).inject(choice);
		                choice.inputValue = token;
		            }
					if(!choice.inputValue.match(/^\+/)) {
						choice.inputValue = '+' + choice.inputValue;
					}
					this.addChoiceEvents(choice).inject(this.choices);
		        },
		        'onChoice':function() {
		            $('sms_text').select();
		        }
		    });
		}
	},
	parseNumber: function(number)
	{
	    var target="";
	    number=number+"";
	    target=number.replace(/[^0-9+]/ig,"");
	    if (target.substr(0,1)!=="0" && target.substr(0,1)!=="+") {
	        return null;
	    }
	    if (target.substr(0,2)==="00") {
	        target=target.substr(2);
	    }
	    if (target.substr(0,1)==="0") {
	        target='49'+target.substr(1);
	    }
	    if (target.substr(0,1)==="+") {
	        target=target.substr(1);
	    }
	    target="sip:"+target+"@sipgate.net";
	    return target;
	},
	sendSMS: function(rcpt, text)
	{
	    var target = this.parseNumber(rcpt);
	    
	    if (target === null) return false;
	    if (this.sg_connection.is_online == false) return false;
	    
	    var sms_data = {
	        'RemoteUri': target,
	        'TOS': 'text',
	        'Content': text
		};
	    
	    if (this.sender && this.sender != 'sipgate') {
	        sms_data['LocalUri'] = this.parseNumber(this.sender);
	    }
	    
	    var r = this.sg_connection.call('samurai.SessionInitiate', sms_data);
	    
	    if (r && r['StatusCode']==200) {
	        return true;
	    }
	    
	    return false;
	},
	sendClick: function() {
	    if ($('button').disabled) return;
	    if (this.sendSMS($('sms_recipients').value, $('sms_text').value)) {
			$('sms_recipients').value="";
	        $('sms_text').value="";
	        this.updateData();
			this.getBalance.delay(2000);
			//$('debug').set('text','message sent');
	    } else {
			//$('debug').set('text','sending failed');
	    }				
	},
	updateData: function(event)
	{
	    var rcpt_value=document.getElementById("sms_recipients").value;
	    var rcpts=0;
	    if (rcpt_value.length>0) {
	        var rcpts=rcpt_value.split(',').length;
	    }
	    
	    var txt_length=document.getElementById('sms_text').value.length;
	    var cnt=0;
	    if (txt_length>0) {
	        cnt=1;
	    }
	    if (txt_length>160) {
	        cnt=2;
	    }
	    if (txt_length>310) {
	        cnt=3;
	    }
	    
	    var price=7.9*rcpts;
	    document.getElementById("price_info").innerHTML="Preis: "+(price*cnt).toFixed(1)+" ct";
	    document.getElementById("count_info").innerHTML=txt_length+' Zeichen';
	}
	
};