var phoneApp = angular.module('phoneApp',['ngRoute','phoneController']);

phoneApp.config(['$routeProvider',function($routeProvider){
	$routeProvider
		.when('/',{
			templateUrl:'phonelist.html',
			controller:'phoneList'
		})
		.when('/checkout',{
			templateUrl:'checkout.html',
			controller:'checkOut'
		})
		.when('/:id',{
			templateUrl:'phonedetails.html',
			controller:'phoneDetails'
		})
		.otherwise({
			redirectTo:'/'
		});
}]);