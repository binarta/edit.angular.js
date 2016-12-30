(function () {
    angular.module('bin.edit', ['notifications'])
        .component('binEdit', new BinEditComponent())
        .component('binEditAction', new BinEditActionComponent());

    function BinEditComponent() {
        this.templateUrl = 'bin-edit.html';
        this.bindings = {
            buttonText: '@'
        };
        this.transclude = {
            'actions': 'binEditActions',
            'header': '?binEditHeader',
            'body': 'binEditBody'
        };
        this.controller = ['topicRegistry', BinEditController];
    }

    function BinEditActionComponent() {
        this.templateUrl = 'bin-edit-action.html';
        this.bindings = {
            action: '&'
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
        var states = {
            hidden: function () {
                this.name = 'hidden';
                this.close = function () {
                }
            },
            closed: function (fsm) {
                this.name = 'closed';
                this.toggle = function () {
                    fsm.state = new states.opened(fsm);
                };
                this.close = function () {
                }
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
            $ctrl.state = new states.hidden($ctrl);

            $ctrl.close = function () {
                $ctrl.state.close();
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

            var editModeListener = function (editModeActive) {
                $ctrl.state = editModeActive ? new states.closed($ctrl) : new states.hidden($ctrl);
            };

            topics.subscribe('edit.mode', editModeListener);

            $ctrl.$onDestroy = function () {
                topics.unsubscribe('edit.mode', editModeListener);
            };
        };
    }
})();