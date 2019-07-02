(function () {
    angular.module('bin.edit', ['notifications', 'angularx'])
        .component('binEdit', new BinEditComponent());

    function BinEditComponent() {
        this.templateUrl = 'bin-edit.html';
        this.bindings = {
            isEditable: '<?'
        };
        this.transclude = {
            'actions': 'binActions',
            'header': '?binEditHeader',
            'body': 'binEditBody'
        };
        this.controller = ['$element', '$scope', 'topicRegistry', function ($element, $scope, topics) {
            var $ctrl = this;
            var states = {
                visible: function() {
                    this.name = 'visible';
                },
                hidden: function () {
                    this.name = 'hidden';
                }
            };
            var unsubscribes = [];

            var editModeListener = function (editModeActive) {
                $ctrl.editing = editModeActive;
                if($ctrl.editing)
                    $element.addClass('editing');
                else
                    $element.removeClass('editing');
                initState();
            };

            $ctrl.$onInit = function () {
                $ctrl.state = new states.hidden();
                topics.subscribe('edit.mode', editModeListener);
                unsubscribes.push($scope.$on('bin.actions.opened', function(event) {
                    event.stopPropagation();
                    $element.addClass('open');
                }));
                unsubscribes.push($scope.$on('bin.actions.closed', function(event) {
                    event.stopPropagation();
                    $element.removeClass('open');
                }));
            };

            $ctrl.$onDestroy = function () {
                topics.unsubscribe('edit.mode', editModeListener);
                unsubscribes.forEach(function(unsubscribe) {
                    unsubscribe();
                })
            };

            $ctrl.$onChanges = function () {
                initState();
            };

            function isEditable() {
                return $ctrl.editing && ($ctrl.isEditable === undefined || $ctrl.isEditable);
            }

            function initState() {
                $ctrl.state = isEditable() ? new states.visible() : new states.hidden();
            }
        }];
    }
})();