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
            action: '<',
            context: '@'
        };
        this.require = {
            editCtrl: '^binEdit'
        };
        this.transclude = true;

        this.controller = function () {
            this.$onInit = function () {
                this.handler = function () {
                    this.editCtrl.execute(this);
                };
            };
        };
    }

    function BinEditController(topics) {
        var $ctrl = this;
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
            },
            confirm: function (fsm, callback) {
                this.name = 'confirm';
                this.confirm = function () {
                    callback();
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

            $ctrl.execute = function (args) {
                if (args.context == 'danger') $ctrl.state = new states.confirm($ctrl, args.action);
                else {
                    args.action();
                    $ctrl.state = new states.closed($ctrl);
                }
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