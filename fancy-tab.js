(function (angular) {
    'use strict';


    // Mix in to our module
    var module;
    try {
        module = angular.module('coUtils');
    } catch (e) {
        module = angular.module('coUtils', []);
    }


    module
        .directive('tabs', function() {
            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    current: '=?',
                    autoSelect: '=?'
                },
                controller: ['$scope', '$element', function($scope, $element) {
                    var panes = $scope.panes = [],
                        selected;

                    $scope.autoSelect = $scope.autoSelect === undefined ? true : $scope.autoSelect;

                    $scope.select = function(pane) {
                        selected = pane;
                        angular.forEach(panes, function(pane) {
                            pane.selected = false;
                        });
                        pane.selected = true;
                        $scope.current = selected.name || selected.title;
                    }

                    this.addPane = function(pane) {
                        if (panes.length == 0 && $scope.autoSelect || 
                            (pane.name || pane.title) === $scope.current)
                            $scope.select(pane);

                        panes.push(pane);
                    }

                    // Allow for programmatic tab selection
                    $scope.$watch('current', function (val) {
                        if (val && (selected === undefined || val !== (selected.name || selected.title))) {
                            angular.forEach(panes, function(pane) {
                                if (val === (selected.name || selected.title)) {
                                    pane.selected = true;
                                } else {
                                    pane.selected = false;
                                }
                            });
                        }
                    });
                }],
                template:
                    '<div>' +
                        '<nav>' +
                            '<div ng-repeat="pane in panes" ng-if="!pane.hide" ng-class="{active: pane.selected}" ng-click="select(pane)">' +
                                '<div class="{{pane.icon}}"></div>' +
                                '<span>{{pane.title}}</span>' +
                            '</div>' +
                        '</nav>' +
                        '<div class="tab-content" ng-transclude></div>' +
                    '</div>'
            };
        })

        .directive('pane', function() {
            return {
                require: '^tabs',
                restrict: 'E',
                transclude: true,
                scope: {
                    title: '@',
                    icon: '@',
                    selected: '=?',
                    name: '=?',
                    hide: '=?'
                },
                link: function(scope, element, attrs, tabsCtrl) {
                    scope.hide = scope.hide || false;

                    tabsCtrl.addPane(scope);

                    scope.$watch('selected', function (val) {
                        if (val) {
                            element.addClass('active');
                        } else {
                            element.removeClass('active');
                        }
                    });
                },
                template:
                    '<div ng-if="selected" ng-transclude></div>'
            };
        });

}(this.angular));
