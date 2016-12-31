(function () {
    angular.module('bin.edit', ['notifications'])
        .component('binEdit', new BinEditComponent())
        .component('binEditActions', new BinEditActionsComponent())
        .component('binEditActionsSelector', new BinEditActionsSelectorComponent())
        .component('binEditAction', new BinEditActionComponent());

    function BinEditComponent() {
        this.templateUrl = 'bin-edit.html';
        this.transclude = {
            'actions': 'binEditActions',
            'header': '?binEditHeader',
            'body': 'binEditBody'
        };
        this.controller = ['topicRegistry', BinEditController];
    }

    function BinEditActionsComponent() {
        this.template = '<div ng-show="$ctrl.visible" ng-transclude></div>';
        this.bindings = {
            for: '@',
            buttonI18nCode: '@'
        };
        this.require = {
            editCtrl: '^binEdit'
        };
        this.transclude = true;

        this.controller = function () {
            var $ctrl = this;

            $ctrl.$onInit = function () {
                if (!$ctrl.for) $ctrl.visible = true;
                $ctrl.editCtrl.onShowActionsFor(function (id) {
                    $ctrl.visible = $ctrl.for == id;
                    if ($ctrl.visible) $ctrl.editCtrl.setButtonCode($ctrl.buttonI18nCode);
                });
            };
        };
    }

    function BinEditActionsSelectorComponent() {
        this.templateUrl = 'bin-edit-action.html';
        this.bindings = {
            for: '@',
            danger: '@'
        };
        this.require = {
            editCtrl: '^binEdit'
        };
        this.transclude = true;

        this.controller = function () {
            this.$onInit = function () {
                this.execute = function () {
                    this.editCtrl.showActionsFor(this.for);
                };
            };
        };
    }

    function BinEditActionComponent() {
        this.templateUrl = 'bin-edit-action.html';
        this.bindings = {
            action: '&',
            danger: '@',
            disabled: '<'
        };
        this.require = {
            editCtrl: '^binEdit'
        };
        this.transclude = true;

        this.controller = function () {
            var $ctrl = this;

            $ctrl.$onInit = function () {
                $ctrl.editCtrl.onWorking(function (isWorking) {
                    $ctrl.working = isWorking;
                });

                $ctrl.execute = function () {
                    var result = $ctrl.action();
                    if (result && result.finally) {
                        $ctrl.editCtrl.startWorking();
                        result.finally($ctrl.editCtrl.stopWorking);
                    }
                };
            };
        };
    }

    function BinEditController(topics) {
        var $ctrl = this;
        var workingListeners = [];
        var actionsListeners = [];
        var states = {
            hidden: function () {
                this.name = 'hidden';
                this.close = function () {}
            },
            closed: function (fsm) {
                this.name = 'closed';
                $ctrl.showActionsFor();
                this.toggle = function () {
                    fsm.state = new states.opened(fsm);
                };
                this.close = function () {}
            },
            opened: function (fsm) {
                this.name = 'opened';
                this.toggle = function () {
                    fsm.state = new states.closed(fsm);
                };
                this.close = function () {
                    fsm.state = new states.closed(fsm);
                };
            }
        };

        this.$onInit = function () {
            $ctrl.state = new states.hidden();

            $ctrl.close = function () {
                $ctrl.state.close();
            };

            $ctrl.toggle = function () {
                $ctrl.state.toggle();
            };

            $ctrl.onWorking = function (cb) {
                workingListeners.push(cb);
            };

            $ctrl.startWorking = function () {
                $ctrl.working = true;
                workingListeners.forEach(function (cb) {
                    cb(true);
                });
            };

            $ctrl.stopWorking = function () {
                $ctrl.working = false;
                workingListeners.forEach(function (cb) {
                    cb(false);
                });
            };

            $ctrl.showActionsFor = function (id) {
                actionsListeners.forEach(function (cb) {
                    cb(id);
                });
            };

            $ctrl.onShowActionsFor = function (cb) {
                actionsListeners.push(cb);
            };

            $ctrl.setButtonCode = function (code) {
                $ctrl.buttonCode = code;
            };

            var editModeListener = function (editModeActive) {
                $ctrl.state = editModeActive ? new states.closed($ctrl) : new states.hidden();
            };

            topics.subscribe('edit.mode', editModeListener);

            $ctrl.$onDestroy = function () {
                topics.unsubscribe('edit.mode', editModeListener);
            };
        };
    }
})();