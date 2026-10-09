'use strict';
'require baseclass';
'require fs';
'require view.dashboard.lib.charts as charts';
'require view.dashboard.lib.history as history';

function parseTemp(val) {
	if (!val) return null;
	var n = parseInt(val);
	return isNaN(n) ? null : n / 1000;
}

return baseclass.extend({
	widgets: [
		{ id: 'cpu_temp', slot: 'cards', title: _('CPU temp'), order: 25 },
		{ id: 'wifi2_temp', slot: 'cards', title: _('Wi-Fi 2.4G temp'), order: 26, hidden: true },
		{ id: 'wifi5_temp', slot: 'cards', title: _('Wi-Fi 5G temp'), order: 27, hidden: true },
		{ id: 'wan_temp', slot: 'cards', title: _('WAN PHY temp'), order: 28, hidden: true },
		{ id: 'lan_temp', slot: 'cards', title: _('LAN PHY temp'), order: 29, hidden: true },
		{ id: 'temperature', slot: 'charts', title: _('Temperature'), order: 30 },
		{ id: 'temperature', slot: 'tabs', title: _('Temperature'), order: 35 }
	],

	load: function() {
		return Promise.all([
			fs.trimmed('/sys/class/thermal/thermal_zone0/temp').catch(function() { return null; }),
			fs.trimmed('/sys/class/hwmon/hwmon3/temp1_input').catch(function() { return null; }),
			fs.trimmed('/sys/class/hwmon/hwmon4/temp1_input').catch(function() { return null; }),
			fs.trimmed('/sys/class/hwmon/hwmon1/temp1_input').catch(function() { return null; }),
			fs.trimmed('/sys/class/hwmon/hwmon2/temp1_input').catch(function() { return null; }),
			history.load()
		]);
	},

	renderCard: function(icon, title, val, sub) {
		return charts.kpi({
			icon: icon,
			title: title,
			value: [(val != null) ? '%.1f °C'.format(val) : '-'],
			sub: [sub]
		});
	},

	renderChart: function() {
		var TEMP = 5;
		var seriesTemp = function(key) {
			return history.series(function(cur) {
				return (cur && cur[TEMP] && cur[TEMP][key] != null) ? cur[TEMP][key] : null;
			});
		};

		var cpuSeries   = seriesTemp('cpu');
		var wifi5Series = seriesTemp('wifi5');
		var wifi2Series = seriesTemp('wifi2');
		var wanSeries   = seriesTemp('wan');
		var lanSeries   = seriesTemp('lan');

		var last = function(points) {
			return (points && points.length) ? points[points.length - 1].v : null;
		};

		var fmt = function(v) {
			return (v != null) ? '%.1f °C'.format(v) : '-';
		};

		var hasData = cpuSeries.some(function(p) { return p.v != null; });

		var max = 100;
		var ticks = [20, 40, 60, 80, 100].map(function(val) {
			return { value: val, label: '%d°C'.format(val) };
		});

		var desc = [_('CPU'), _('Wi-Fi'), _('2.5G PHY')].join(' · ');

		return charts.card({
			title: _('Temperature'),
			desc: desc,
			body: hasData ? [
				charts.lines({
					span: history.span(),
					max: max,
					ticks: ticks,
					ariaLabel: _('Temperature'),
					series: [
						{ values: cpuSeries, area: true },
						{ values: wifi5Series },
						{ values: wifi2Series },
						{ values: wanSeries },
						{ values: lanSeries }
					]
				}),
				charts.legend([
					{ className: 'dashboard-series-1', label: _('CPU'), value: fmt(last(cpuSeries)) },
					{ className: 'dashboard-series-2', label: _('5 GHz'), value: fmt(last(wifi5Series)) },
					{ className: 'dashboard-series-3', label: _('2.4 GHz'), value: fmt(last(wifi2Series)) },
					{ className: 'dashboard-series-4', label: _('WAN'), value: fmt(last(wanSeries)) },
					{ className: 'dashboard-series-5', label: _('LAN'), value: fmt(last(lanSeries)) }
				])
			] : charts.empty(history.status())
		});
	},

	renderTab: function(cpu, wifi2, wifi5, wan, lan) {
		var rows = [
			[_('CPU (SoC)'), 'MediaTek MT7986A (Quad-Core)', cpu],
			[_('Wi-Fi 2.4 GHz'), 'MediaTek MT7915 PHY0', wifi2],
			[_('Wi-Fi 5 GHz'), 'MediaTek MT7915 PHY1', wifi5],
			[_('WAN (2.5G Port)'), 'Realtek RTL8221B (mdio:01)', wan],
			[_('LAN (2.5G Port)'), 'Realtek RTL8221B (mdio:07)', lan]
		];

		var table = E('table', { 'class': 'table' });
		table.appendChild(E('tr', { 'class': 'tr table-titles' }, [
			E('th', { 'class': 'th', 'width': '25%' }, [_('Sensor')]),
			E('th', { 'class': 'th', 'width': '40%' }, [_('Hardware Component')]),
			E('th', { 'class': 'th', 'width': '20%' }, [_('Temperature')]),
			E('th', { 'class': 'th', 'width': '15%' }, [_('Status')])
		]));

		rows.forEach(function(r, idx) {
			var tempVal = r[2];
			var tempStr = (tempVal != null) ? '%.1f °C'.format(tempVal) : '-';
			var badgeKind = 'success';
			var statusText = _('Normal');
			if (tempVal != null && tempVal >= 85) {
				badgeKind = 'danger';
				statusText = _('Hot');
			} else if (tempVal != null && tempVal >= 70) {
				badgeKind = 'warning';
				statusText = _('Warm');
			}

			table.appendChild(E('tr', { 'class': 'tr ' + (idx % 2 ? 'cbi-rowstyle-2' : 'cbi-rowstyle-1') }, [
				E('td', { 'class': 'td left' }, [r[0]]),
				E('td', { 'class': 'td left' }, [r[1]]),
				E('td', { 'class': 'td left' }, [E('strong', {}, [tempStr])]),
				E('td', { 'class': 'td left' }, [charts.badge(statusText, badgeKind)])
			]));
		});

		return table;
	},

	render: function(data) {
		var cpu = parseTemp(data[0]);
		var wifi2 = parseTemp(data[1]);
		var wifi5 = parseTemp(data[2]);
		var wan = parseTemp(data[3]);
		var lan = parseTemp(data[4]);

		return {
			cards: [
				{ id: 'cpu_temp', node: this.renderCard.bind(this, 'temp', _('CPU temp'), cpu, 'MediaTek MT7986A') },
				{ id: 'wifi2_temp', node: this.renderCard.bind(this, 'wireless', _('Wi-Fi 2.4G temp'), wifi2, 'mt7915_phy0') },
				{ id: 'wifi5_temp', node: this.renderCard.bind(this, 'wireless', _('Wi-Fi 5G temp'), wifi5, 'mt7915_phy1') },
				{ id: 'wan_temp', node: this.renderCard.bind(this, 'internet', _('WAN PHY temp'), wan, 'RTL8221B (2.5G)') },
				{ id: 'lan_temp', node: this.renderCard.bind(this, 'router', _('LAN PHY temp'), lan, 'RTL8221B (2.5G)') }
			],
			charts: [
				{ id: 'temperature', node: this.renderChart.bind(this) }
			],
			tabs: [
				{ id: 'temperature', title: _('Temperature'), content: this.renderTab.bind(this, cpu, wifi2, wifi5, wan, lan) }
			]
		};
	}
});
