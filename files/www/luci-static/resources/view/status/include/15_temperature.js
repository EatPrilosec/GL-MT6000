'use strict';
'require baseclass';
'require fs';

function parseTemp(val) {
	if (!val) return null;
	var n = parseInt(val);
	return isNaN(n) ? null : (n / 1000).toFixed(1) + ' °C';
}

return baseclass.extend({
	title: _('Temperature'),

	load: function() {
		return Promise.all([
			fs.trimmed('/sys/class/thermal/thermal_zone0/temp').catch(() => null),
			fs.trimmed('/sys/class/hwmon/hwmon3/temp1_input').catch(() => null),
			fs.trimmed('/sys/class/hwmon/hwmon4/temp1_input').catch(() => null),
			fs.trimmed('/sys/class/hwmon/hwmon1/temp1_input').catch(() => null),
			fs.trimmed('/sys/class/hwmon/hwmon2/temp1_input').catch(() => null)
		]);
	},

	render: function(data) {
		var fields = [
			_('CPU (SoC)'), parseTemp(data[0]),
			_('Wi-Fi 2.4 GHz'), parseTemp(data[1]),
			_('Wi-Fi 5 GHz'), parseTemp(data[2]),
			_('WAN (2.5G PHY)'), parseTemp(data[3]),
			_('LAN (2.5G PHY)'), parseTemp(data[4])
		];

		var table = E('table', { 'class': 'table' });
		for (var i = 0; i < fields.length; i += 2) {
			if (fields[i + 1] != null) {
				table.appendChild(E('tr', { 'class': 'tr' }, [
					E('td', { 'class': 'td left', 'width': '33%' }, [fields[i]]),
					E('td', { 'class': 'td left' }, [fields[i + 1]])
				]));
			}
		}

		return table;
	}
});
