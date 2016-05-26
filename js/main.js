;(function ($) {
	var $byRegionMenu = $('.by-region-menu'),
		$byRegionCurrentName = $('.by-region-menu-current-name'),
		$selectedCountriesMenu = $('.selected-countries-menu'),
		$selectedCountriesCurrentName = $('.selected-countries-menu-current-name'),
		regions,
		regionsMap,
		nMinSelected = 2,
		nMaxSelected = 15;

	$.get('/data/continents.json')
		.done(function (res) {
			regions = res;
			// regions['0'] = { 
			// 	name: 'Top Overall',
			// 	countries: regions[1].countries.concat(regions[2].countries)
			// };
			renderByRegionMenuItems(regions, 1);// start with id 1
		})
		.fail(function (err) { console.error(err); });

	function renderByRegionMenuItems (o, active_i) {
		var lis = '';

		for (var id in o) {
			lis += '<li class="'+ (id == active_i ? 'active' : '' ) +'"><a id="'+ id +'" href>'+ o[id].name +'</a></li>';
		};
		$byRegionMenu.html(lis);
		renderSelectedCountriesMenuItems(active_i);
		$byRegionCurrentName.text(o[active_i].name);
	};

	function renderSelectedCountriesMenuItems (id) {
		var o = $.extend(true, {}, regions), lis = '', selected;

			selected = $.extend(true, {}, o[id]);
		// if (id > 0) {
			delete o[id];
		// }
		// else if (id == 0){
		// 	delete o[1];
		// 	delete o[2];
		// }

		// render checked items first
			selected.countries.forEach(function (countryCode, country_i) {
				lis += '<li class="checked">';
					lis += '<a>';
						lis += '<label>';
							lis += '<input id="'+ id + '_' + country_i +'" type="checkbox" checked="checked" data-code="'+ countryCode +'"> '+ getCountryName(countryCode);
						lis += '</label>';
					lis += '</a>';
				lis += '</li>';
			});

		// then render unchecked items
		for (var j in o){
			o[j].countries.forEach(function (countryCode, country_i) {
				lis += '<li>';
					lis += '<a>';
						lis += '<label>';
							lis += '<input id="'+ j + '_' + country_i +'" type="checkbox" data-code="'+ countryCode +'"> '+ getCountryName(countryCode);
						lis += '</label>';
					lis += '</a>';
				lis += '</li>';
			});
		}

		$selectedCountriesMenu.html(lis);
		$selectedCountriesCurrentName
			.text( $selectedCountriesMenu.find('.checked').length + ' Countries Selected');
		initRegionsMap(id);
	};

	$byRegionMenu.on('click', 'a', function (e) {
		e.preventDefault();
		var name = $(this).text(), id = this.id;
		$(this).parent().siblings().removeClass('active')
		.end().addClass('active');
		$byRegionCurrentName.text(name);

		renderSelectedCountriesMenuItems(id);
	});

	$selectedCountriesMenu.on('change', 'input[type=checkbox]', function(e){
		$(this).closest('li').toggleClass('checked');
		var $items = $selectedCountriesMenu.find('li'),
		$checked = $selectedCountriesMenu.find('.checked'), 
		nChecked = $checked.length,
		$unchecked = $items.not('.checked');

		$selectedCountriesCurrentName.text( nChecked + ' Countries Selected');

		// ensure selectable limits 
		if(nChecked <= nMinSelected){
			$checked.find('input[type=checkbox]').prop('disabled', true);
		}
		else if(nChecked >= nMaxSelected){
			$unchecked.find('input[type=checkbox]').prop('disabled', true);
		}
		else {
			$items.find('input[type=checkbox]').prop('disabled', false);
		}

		// detect region based on countries selected
		var region = matchRegion(this.id, $(this).data('code'), this.checked);
		$byRegionCurrentName.text(region);
	});

	// prevent dropdown from closing on click inside
	$(document).on('click', '.selected-countries-menu', function (e) {
		e.stopPropagation();
	});

	function matchRegion(index, code, checked){
		var temp = index.split('_'), 
		regionIndex = temp[0],
		countryIndex = temp[1],
		a = [], b = [];

		regionsMap[ regionIndex ].countries[ countryIndex ] = checked;

		for (var id in regionsMap){
			if (regionsMap.hasOwnProperty(id)) {
				var checkedCountries = regionsMap[id].countries.filter(function (c) {
					return Boolean(c);
				});

				if(checkedCountries.length == regionsMap[id].countries.length) a.push(id);
				if(checkedCountries.length && checkedCountries.length < regionsMap[id].countries.length)
					b.push(id);
			}
		};

		if (a.length == 1 && b.length == 0) {
			return regionsMap[ a[0] ].name;
		}else {
			return 'Custom';
		}
	};

	function initRegionsMap (_id) {
		regionsMap = $.extend(true, {}, regions);
		for (var id in regionsMap){
			if (regionsMap.hasOwnProperty(id)) {
				if(_id != id){
					regionsMap[id].countries = regionsMap[id].countries.map(function (c) {
						return false;
					});
				}
			}
		};
	}

})(jQuery)
