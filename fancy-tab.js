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
                    autoSelect: '=?',
                    type: '@'
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
                    };

                    $scope.touched = function (type, pane) {
                        if ($scope.type && $scope.type === type || type === ($scope.type || 'click')) {
                            $scope.select(pane);
                        }
                    };

                    this.addPane = function(pane) {
                        if (panes.length == 0 && $scope.autoSelect || 
                            (pane.name || pane.title) === $scope.current)
                            $scope.select(pane);

                        panes.push(pane);
                    };

                    this.removePane = function(pane) {
                        var index = panes.indexOf(pane);
                        if (index !== -1) {
                            panes.splice(index, 1);
                        }
                    };

                    this.deselect = function (pane) {
                        var index = panes.indexOf(pane),
                            i;
                        
                        for (i = 0; i < panes.length; i += 1) {
                            if (i !== index && !panes[i].hide) {
                                $scope.select(panes[i]);
                                break;
                            }
                        }
                    };

                    // Allow for programmatic tab selection
                    $scope.$watch('current', function (val) {
                        if (val && (selected === undefined || val !== (selected.name || selected.title))) {
                            angular.forEach(panes, function(pane) {
                                if (val === (pane.name || pane.title)) {
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
                            '<div ng-repeat="pane in panes" ng-if="!pane.hide" ng-class="{active: pane.selected}" ng-click="touched(' + "'click'" + ', pane)" ng-touch="touched(' + "'touch'" + ', pane)">' +
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

                    scope.$watch('hide', function (hidden) {
                        if (scope.selected && hidden) {
                            tabsCtrl.deselect(scope);
                        }
                    });

                    scope.$on('$destroy', function () {
                        tabsCtrl.removePane(scope);
                    });
                },
                template:
                    '<div ng-if="selected && !hide" ng-transclude></div>'
            };
        });

}(this.angular));
