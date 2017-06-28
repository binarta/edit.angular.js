(function () {
    angular.module('bin.edit', ['notifications'])
        .component('binEdit', new BinEditComponent())
        .component('binEditActions', new BinEditActionsComponent())
        .component('binEditActionsSelector', new BinEditActionsSelectorComponent())
        .component('binEditAction', new BinEditActionComponent());

    function BinEditComponent() {
        this.templateUrl = 'bin-edit.html';
        this.bindings = {
            isEditable: '<?'
        };
        this.transclude = {
            'actions': 'binEditActions',
            'header': '?binEditHeader',
            'body': 'binEditBody'
        };
        this.controller = ['topicRegistry', function (topics) {
            var $ctrl = this;
            var actionsListeners = [];
            var mainActions = 0;
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

            $ctrl.$onInit = function () {
                $ctrl.state = new states.hidden();

                $ctrl.close = function () {
                    $ctrl.state.close();
                };

                $ctrl.toggle = function () {
                    $ctrl.state.toggle();
                };

                $ctrl.startWorking = function () {
                    $ctrl.working = true;
                };

                $ctrl.stopWorking = function () {
                    $ctrl.working = false;
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

                $ctrl.increaseMainActionCount = function () {
                    mainActions += 1;
                };

                $ctrl.decreaseMainActionCount = function () {
                    mainActions -= 1;
                };

                $ctrl.hasMainActions = function () {
                    return mainActions > 0;
                };

                var editModeListener = function (editModeActive) {
                    $ctrl.editing = editModeActive;
                    initState();
                };

                topics.subscribe('edit.mode', editModeListener);

                $ctrl.$onDestroy = function () {
                    topics.unsubscribe('edit.mode', editModeListener);
                };
            };

            $ctrl.$onChanges = function () {
                initState();
            };

            function isEditable() {
                return $ctrl.editing && ($ctrl.isEditable === undefined || $ctrl.isEditable);
            }

            function initState() {
                $ctrl.state = isEditable() ? new states.closed($ctrl) : new states.hidden();
            }
        }];
    }

    function BinEditActionsComponent() {
        this.template = '<div ng-show="$ctrl.visible" ng-transclude></div>';
        this.bindings = {
            for: '@',
            buttonI18nCode: '@'
        };
        this.require = {
            editCtrl: '^^binEdit'
        };
        this.transclude = true;

        this.controller = function () {
            var $ctrl = this;
            var actions = [];

            $ctrl.$onInit = function () {
                if (!$ctrl.for) $ctrl.visible = true;
                $ctrl.editCtrl.onShowActionsFor(function (id) {
                    $ctrl.visible = $ctrl.for === id;
                    if ($ctrl.visible) $ctrl.editCtrl.setButtonCode($ctrl.buttonI18nCode);
                });

                $ctrl.increaseActionCount = function () {
                    if (!$ctrl.for) $ctrl.editCtrl.increaseMainActionCount();
                };

                $ctrl.decreaseActionCount = function () {
                    if (!$ctrl.for) $ctrl.editCtrl.decreaseMainActionCount();
                };
            };
        };
    }

    function BinEditActionsSelectorComponent() {
        this.templateUrl = 'bin-edit-action.html';
        this.bindings = {
            for: '@',
            danger: '@',
            iconClass: '@',
            i18nCode: '@'
        };
        this.require = {
            editCtrl: '^^binEdit',
            actionsCtrl: '^^binEditActions'
        };
        this.transclude = true;

        this.controller = function () {
            var $ctrl = this;
            
            $ctrl.$onInit = function () {
                $ctrl.actionsCtrl.increaseActionCount();
                
                $ctrl.execute = function () {
                    $ctrl.editCtrl.showActionsFor($ctrl.for);
                };

                $ctrl.$destroy = function () {
                    $ctrl.actionsCtrl.decreaseActionCount();
                };
            };
        };
    }

    function BinEditActionComponent() {
        this.templateUrl = 'bin-edit-action.html';
        this.bindings = {
            action: '&',
            danger: '@',
            disabled: '<',
            iconClass: '@',
            i18nCode: '@'
        };
        this.require = {
            editCtrl: '^^binEdit',
            actionsCtrl: '^^binEditActions'
        };
        this.transclude = true;

        this.controller = function () {
            var $ctrl = this;

            $ctrl.$onInit = function () {
                $ctrl.actionsCtrl.increaseActionCount();

                $ctrl.execute = function () {
                    if (!$ctrl.working && !$ctrl.disabled) {
                        var result = $ctrl.action();
                        if (result && result.finally) {
                            startWorking();
                            result.finally(stopWorking);
                        }
                    }
                };

                $ctrl.$destroy = function () {
                    $ctrl.actionsCtrl.decreaseActionCount();
                };
            };

            function startWorking() {
                $ctrl.editCtrl.startWorking();
                $ctrl.working = true;
            }

            function stopWorking() {
                $ctrl.editCtrl.stopWorking();
                $ctrl.working = false;
            }
        };
    }
})();