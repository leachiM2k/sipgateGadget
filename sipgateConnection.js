/*
Copyright (c) 2009, Stefan Lange-Hegermann
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of source.bricks nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY STEFAN LANGE-HEGERMANN ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL STEFAN LANGE-HEGERMANN BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var Sipgate = new Class({
    'initialize':function(systemarea) {
        this.username="";
        this.password="";
        this.logged_in=false;
        if(systemarea) {
        	this.url='https://samurai.sipgate.net/RPC2';
        } else {
        	this.url='https://api.sipgate.net/RPC2';
        }
        this.request=null;
        return this;
    },
    
    'login':function(user, pass) {
        this.username=user;
        this.password=pass;
        this.logged_in=false;
        
        var result = this.call('samurai.ClientIdentify', {
            ClientName:'sipgateGadget', 
            ClientVersion:'1.0.0.0',
            ClientVendor:'michael.rotmanov'
        });
        
        if (result && result['StatusCode']==200) {
            this.logged_in=true;
            return true;
        }
        return false;
    },
    
    'call':function(method, data) {
        var url=(this.url.replace("://","://"+this.username.replace('@','%40')+":"+this.password.replace('@','%40')+"@"));
        var request = new XmlRpcRequest(url, method);  
        if (typeof data==="undefined") data={};
        
        request.addParam(data);
        
        var response = request.send();
        
        if (response.xmlData==null) {
            return null;
        } else {
            return response.parseXML();
        }
        
        return null;
    },
    
    'requestError': function() {
    },
    
    'parseResult': function(text, xml) {
        response=new XmlRpcResponse(xml);
    }
});
