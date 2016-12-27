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
        var self = this;

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

        self.state = new states.hidden(self);

        this.close = function () {
            self.state.close();
        };

        this.execute = function (args) {
            if (args.context == 'danger') self.state = new states.confirm(self, args.action);
            else {
                args.action();
                self.state = new states.closed(self);
            }
        };

        var editModeListener = function (editModeActive) {
            self.state = editModeActive ? new states.closed(self) : new states.hidden(self);
        };

        topics.subscribe('edit.mode', editModeListener);

        this.$onDestroy = function () {
            topics.unsubscribe('edit.mode', editModeListener);
        };
    }
})();