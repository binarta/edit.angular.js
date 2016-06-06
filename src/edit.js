(function () {
    angular.module('bin.edit', ['notifications'])
        .controller('binEditController', ['$scope', 'ngRegisterTopicHandler', BinEditController])
        .controller('binEditActionController', [BinEditActionController])
        .component('binEdit', {
            bindings: {
                buttonText: '@'
            },
            transclude: {
                'actions': 'binEditActions',
                'header': '?binEditHeader',
                'body': 'binEditBody'
            },
            controller: 'binEditController',
            template: ['$templateCache', function (cache) {
                return cache.get('bin-edit.html');
            }]
        })
        .component('binEditAction', {
            bindings: {
                action: '<',
                context: '@'
            },
            require: {
                editCtrl: '^binEdit'
            },
            transclude: true,
            controller: 'binEditActionController',
            template: ['$templateCache', function (cache) {
                return cache.get('bin-edit-action.html');
            }]
        });

    function BinEditController($scope, topics) {
        var self = this;

        var states = {
            hidden: function () {
                this.name = 'hidden';
            },
            closed: function (fsm) {
                this.name = 'closed';
                this.toggle = function () {
                    fsm.state = new states.opened(fsm);
                };
            },
            opened: function (fsm) {
                this.name = 'opened';
                this.toggle = function () {
                    fsm.state = new states.closed(fsm);
                };
            },
            confirm: function (fsm, callback) {
                this.name = 'confirm';
                this.confirm = function () {
                    callback();
                    fsm.state = new states.closed(fsm);
                };
            }
        };

        topics($scope, 'edit.mode', function (editModeActive) {
            self.state = editModeActive ? new states.closed(self) : new states.hidden(self);
        });

        this.close = function () {
            self.state = new states.closed(self);
        };

        this.execute = function (args) {
            if (args.context == 'danger') self.state = new states.confirm(self, args.action);
            else {
                args.action();
                self.close();
            }
        };
    }

    function BinEditActionController() {
        this.$onInit = function () {
            this.handler = function () {
                this.editCtrl.execute(this);
            };
        };
    }
})();