var app = angular.module('UsersApp', ['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/addUser.html',
            controller: 'userController',
            activetab: "home"
        })
        .when('/userslist', {
            templateUrl: 'views/listing.html',
            controller: 'listingController',
            activetab: "listing"
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

app.controller('mainController', function ($scope, $route, commonService) {
    $scope.$route = $route;
    var users = [];
    if (typeof(Storage) !== "undefined") {
        users = localStorage.getItem("users");
        //localStorage.clear();
        if (angular.isUndefined(users) || users === null || users === "") {
            users = [];
        } else {
            users = JSON.parse(users);
            //console.log(users);
        }
    } else {
        commonService.setIsLocalStorageSupported(false);
    }
    commonService.setUsers(users);
});

app.service('commonService', function () {
    var isLocalStorageSupported = true;
    var users = [];
    this.setUsers = function (usersArr) {
        users = usersArr;
    };
    this.getUsers = function () {
        return angular.copy(users);
    };
    this.setIsLocalStorageSupported = function (flag) {
        isLocalStorageSupported = flag;
    };
    this.getIsLocalStorageSupported = function () {
        return angular.copy(isLocalStorageSupported);
    };
});

app.controller('userController', function ($scope, $timeout, commonService) {
    var users = commonService.getUsers();
    $scope.showError = false;
    $scope.user = {};
    $scope.submitSuccess = false;

    var today = new Date();
    var date = today.getDate();
    var month = today.getMonth() + 1;

    var year = today.getFullYear();
    date = date < 10 ? '0' + date : date;
    month = month < 10 ? '0' + month : month;
    $scope.today = year + '-' + month + '-' + date;
    $scope.maxDOB = (year - 100) + '-' + month + '-' + date;

    $scope.submitForm = function () {
        if (!isAgeCorrect()) {
            $scope.userForm.age.$invalid = true;
        } else {
            users.push($scope.user);
            if (commonService.getIsLocalStorageSupported()) {
                localStorage.setItem("users", JSON.stringify(users));
            }
            commonService.setUsers(users);
            $scope.submitSuccess = true;
            $timeout(function () {
                $scope.submitSuccess = false;
            }, 5000);
            resetForm();
        }
    };

    var resetForm = function () {
        $scope.showError = false;
        $scope.user = {};
        $scope.userForm.$setPristine();
    };

    var isAgeCorrect = function () {
        var birthDate = new Date($scope.user.dob);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && date < birthDate.getDate())) {
            age--;
        }
        return age === $scope.user.age;
    };
});

app.controller('listingController', function ($scope, $route, commonService) {
    $scope.$route = $route;
    $scope.users = commonService.getUsers();
    $scope.searchText = '';
});
