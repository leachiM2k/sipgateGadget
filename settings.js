		function load()
		{
			var selects = document.getElementsByTagName('select');
			var inputs = document.getElementsByTagName('input');
			for (var i = selects.length - 1; i >= 0; i--){
				var val = System.Gadget.Settings.readString(selects[i].name);
				if(val != '') selects[i].value = val;
			};
			for (var i = inputs.length - 1; i >= 0; i--){
				var val = System.Gadget.Settings.readString(inputs[i].name);
				if (inputs[i].type == 'checkbox') {
					if (val != '') 
						inputs[i].checked = (val=='True');
				}
				else {
					if (val != '') 
						inputs[i].value = val;
				}
			};
		}
		// Delegate for the settings closing event. 
		System.Gadget.onSettingsClosing = SettingsClosing;

		// --------------------------------------------------------------------
		// Handle the Settings dialog closing event.
		// Parameters:
		// event - event arguments.
		// --------------------------------------------------------------------
		function SettingsClosing(event)
		{
		    // Save the settings if the user clicked OK.
		    if (event.closeAction == event.Action.commit)
		    {
		    	save();
		    }
		    // Allow the Settings dialog to close.
		    event.cancel = false;
		}		
		function save()
		{
			var selects = document.getElementsByTagName('select');
			var inputs = document.getElementsByTagName('input');
			for (var i = selects.length - 1; i >= 0; i--){
				System.Gadget.Settings.writeString(selects[i].name, selects[i].value);
			};
			for (var i = inputs.length - 1; i >= 0; i--){
				if (inputs[i].type == 'checkbox') {
					System.Gadget.Settings.writeString(inputs[i].name, inputs[i].checked);
				}
				else {
					System.Gadget.Settings.writeString(inputs[i].name, inputs[i].value);
				}
			};
		}