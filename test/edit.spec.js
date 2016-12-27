describe('bin.edit module', function () {
    beforeEach(module('bin.edit'));

    describe('binEdit component', function () {
        var $ctrl, topics;

        beforeEach(inject(function ($componentController, topicRegistry) {
            topics = topicRegistry;
            $ctrl = $componentController('binEdit');
            $ctrl.$onInit();
        }));

        it('component is in hidden state', function () {
            expect($ctrl.state.name).toEqual('hidden');
        });

        it('register on edit mode event', function () {
            expect(topics.subscribe).toHaveBeenCalledWith('edit.mode', jasmine.any(Function));
        });

        describe('when not in edit mode', function () {
            beforeEach(function () {
                topics.subscribe.calls.mostRecent().args[1](false);
            });

            it('component is in hidden state', function () {
                expect($ctrl.state.name).toEqual('hidden');
            });

            it('on close', function () {
                $ctrl.close();

                expect($ctrl.state.name).toEqual('hidden');
            });
        });

        describe('when in edit mode', function () {
            beforeEach(function () {
                topics.subscribe.calls.mostRecent().args[1](true);
            });

            it('component is in closed state', function () {
                expect($ctrl.state.name).toEqual('closed');
            });

            it('on toggle menu', function () {
                $ctrl.state.toggle();

                expect($ctrl.state.name).toEqual('opened');

                $ctrl.state.toggle();

                expect($ctrl.state.name).toEqual('closed');
            });

            it('on close', function () {
                $ctrl.state.toggle();

                expect($ctrl.state.name).toEqual('opened');

                $ctrl.close();

                expect($ctrl.state.name).toEqual('closed');
            });

            describe('on execute', function () {
                var callback;

                describe('and no need for confirmation', function () {
                    beforeEach(function () {
                        callback = jasmine.createSpy();
                        $ctrl.execute({
                            action: callback
                        });
                    });

                    it('callback is executed', function () {
                        expect(callback).toHaveBeenCalled();
                    });

                    it('component is in closed state', function () {
                        expect($ctrl.state.name).toEqual('closed');
                    });
                });

                describe('and needs confirmation', function () {
                    beforeEach(function () {
                        callback = jasmine.createSpy();
                        $ctrl.execute({
                            action: callback,
                            context: 'danger'
                        });
                    });

                    it('component is in confirm state', function () {
                        expect($ctrl.state.name).toEqual('confirm');
                    });

                    describe('when confirmed', function () {
                        beforeEach(function () {
                            $ctrl.state.confirm();
                        });

                        it('callback is executed', function () {
                            expect(callback).toHaveBeenCalled();
                        });

                        it('component is in closed state', function () {
                            expect($ctrl.state.name).toEqual('closed');
                        });
                    });

                    it('on close', function () {
                        $ctrl.close();

                        expect($ctrl.state.name).toEqual('closed');
                    });
                });
            });
        });

        describe('on destroy', function () {
            beforeEach(function () {
                $ctrl.$onDestroy();
            });

            it('edit mode listener is unsubscribed', function () {
                var listener = topics.subscribe.calls.mostRecent().args[1];
                expect(topics.unsubscribe).toHaveBeenCalledWith('edit.mode', listener);
            });
        });
    });

    describe('binEditAction component', function () {
        var $ctrl, bindings, $componentController, editCtrl;

        beforeEach(inject(function (_$componentController_) {
            $componentController = _$componentController_;

            editCtrl = {
                execute: jasmine.createSpy('execute')
            }
        }));

        it('on execute handler', function () {
            bindings = {
                action: jasmine.createSpy('action')
            };
            $ctrl = $componentController('binEditAction', null, bindings);
            $ctrl.editCtrl = editCtrl;
            $ctrl.$onInit();

            $ctrl.handler();

            expect(editCtrl.execute).toHaveBeenCalledWith($ctrl);
        });
    });
});