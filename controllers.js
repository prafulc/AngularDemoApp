var phoneController = angular.module('phoneController',['ngCookies']);

function taxedPrice(price){
	return ((Number(price) * 12) / 100) + Number(price);
}

/*
*
* Controller here
*
*/
phoneController.controller('phoneList',['$scope','$http',function($scope,$http){
	$http.get('rawdata.json').success(function(data){
		angular.forEach(data,function(phone){
			if(phone.offerprice){
				phone.total = taxedPrice(phone.offerprice);
			} else {
				phone.total = taxedPrice(phone.price);
			}
		});
		$scope.phones = data;
	});
	$scope.sortOrder = 'name';
}]);

phoneController.controller('phoneDetails',['$scope','$routeParams','$http','$sce',function($scope, $routeParams, $http, $sce){
	$http.get('phoneData/' + $routeParams.id + '.json').success(function(data){
		$scope.phone = data;
		if(data.offerprice){
			$scope.phone.tax = (data.offerprice * 12) / 100;
			$scope.phone.total = taxedPrice(data.offerprice);
		} else {
			$scope.phone.tax = (data.price * 12) / 100;
			$scope.phone.total = taxedPrice(data.price);
		}
		$scope.phone.detaildescription = $sce.trustAsHtml(data.detaildescription);
		$scope.phone.mainimage = $scope.phone.img[0]['file'];
	});

	$http.get('commentData/' + $routeParams.id + '.json').success(function(data){
		$scope.comments = data;
	});

	$scope.setDefault = function(img){
		$scope.phone.mainimage = img;
	}

	$scope.notifyme = function(){
		var data = { pid : $scope.phone.id, email: $scope.notify.email };
		$http({ 
			method: 'POST', 
			url: "rawdata.json",
			data: data,
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' } 
		}).success(function(){
			$scope.notificationForm.success=true;
		});
	}
}]);

phoneController.controller('checkOut',['$scope','$http',function($scope,$http){
	
}]);

/* 
*
* Directives here
*
*/
phoneController.factory('cartService', function($cookieStore){
	var cart = {
		items: [ ]
	};

	function updateItemCookie(){
		$cookieStore.put('cart',cart);
	}

	function pushItem(item){
		cart.items.push({
			id: item.id,
			name: item.name,
			price: item.total,
			qty: 1
		});
	}

	return {

		getItems: function(){
			var cookiecart = $cookieStore.get('cart');
			return cookiecart.items;
		},

		addItem: function(item){
			var change = 0;
			if(cart.items.length){
				angular.forEach(cart.items,function(value){
					if(value.id == item.id){
						value.price += (value.price / value.qty);
						value.qty += 1;
						change = 1;
					}
				});
				if(!change){
					pushItem(item);
				}
			} else {
				pushItem(item);
			}
			updateItemCookie();
		},

		removeItem: function(pid){
			angular.forEach(cart.items,function(item, iteration){
				if(item.id == pid){
					cart.items.splice(iteration,1);
				}
			});
			updateItemCookie();
		},

		emptyCart: function(){
			cart = {
				items: [ ]
			};
			updateItemCookie();
		},

		getItemCount: function(){
			var cookiecart = $cookieStore.get('cart');
			var totalItem = 0;
			angular.forEach(cookiecart.items, function(item){
				totalItem += item.qty;
			});
			return totalItem;
		},

		getCartSubtotal: function(){

		},

		getCartTotal: function(){
			var total = 0;
			angular.forEach(cart.items,function(item){
				total += Number(item.price);
			});
			return total;
		},

		checkout: function(){

		},

		init: function(){
			if($cookieStore.get('cart')){
				cart = $cookieStore.get('cart');
			} else {
				updateItemCookie();
			}
		}
	}
});



/* 
*
* Directives here
*
*/

phoneController.directive('phone',function(){
	return {
		restrict: 'E',
		templateUrl: 'phone',
		scope: { phonedata: '@' },
		controller: ['$scope',function($scope){
			//console.log($scope.phonedata);
		}],
		link: function(scope, element, attrs){
			scope.phone = scope.$eval(attrs.phonedata);
		}
	};
});

phoneController.directive('comment', function(){
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'comment',
		scope: { },
		controller: ['$scope', function($scope){

		}],
		link: function(scope, element, attrs){
			scope.comment = scope.$eval(attrs.commentdata);
		}
	}
});

phoneController.directive('commentform',function(){
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'commentform',
		scope: { },
		controller: ['$scope',function($scope){
			$scope.makecomment = function(){
				console.log(JSON.stringify($scope.user));
			}
		}],
		link: function(scope,element,attrs){
			
		}
	}
});

phoneController.directive('addtocartbutton',['cartService',function(cartService){
	return {
		restrict: 'E',
		//scope: {},
		replace: true,
		templateUrl: 'template/addtocartbutton.html',
		controller: ['$scope',function($scope){

		}],
		link: function(scope, element, attrs){
			scope.additem = function(){
				cartService.addItem(scope.phone);
			}
		}
	};
}]);

phoneController.directive('minicart',['cartService','$cookieStore', function(cartService,$cookieStore){

	return {
		restrict: 'E',
		scope: { 
			getItemCount:'=', 
			cartTotal: '=' 
		},
		replace: true,
		templateUrl: 'template/minicart.html',
		controller: ['$scope',function($scope){
			
		}],
		link: function(scope, element, attrs){
			cartService.init();			
			scope.showcart = false;
			scope.getItemCount = cartService.getItemCount();
			scope.cartTotal = cartService.getCartTotal();
			scope.getCartItems = function(){
				scope.getItemCount = cartService.getItemCount();
				scope.cartTotal = cartService.getCartTotal();
				scope.cartItems = cartService.getItems();
				scope.showcart = !scope.showcart;
			};
			scope.removeItem = function(pid){
				cartService.removeItem(pid);
			};
			scope.emptyCart = function(){
				cartService.emptyCart();
			};
			scope.isEmpty = function(){
				if(scope.getItemCount)
					return false;
				else 
					return true;
			};
		}
	}
}]);