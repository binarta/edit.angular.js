describe('bin.edit module', function () {
    beforeEach(module('bin.edit'));

    describe('binEdit component', function () {
        var component, topics;

        beforeEach(inject(function ($componentController, ngRegisterTopicHandler) {
            topics = ngRegisterTopicHandler;
            component = $componentController('binEdit');
        }));

        it('component is in hidden state', function () {
            expect(component.state.name).toEqual('hidden');
        });

        it('register on edit mode event', function () {
            expect(topics.calls.mostRecent().args[1]).toEqual('edit.mode');
        });

        describe('when not in edit mode', function () {
            beforeEach(function () {
                topics.calls.mostRecent().args[2](false);
            });

            it('component is in hidden state', function () {
                expect(component.state.name).toEqual('hidden');
            });

            it('on close', function () {
                component.close();

                expect(component.state.name).toEqual('hidden');
            });
        });

        describe('when in edit mode', function () {
            beforeEach(function () {
                topics.calls.mostRecent().args[2](true);
            });

            it('component is in closed state', function () {
                expect(component.state.name).toEqual('closed');
            });

            it('on toggle menu', function () {
                component.state.toggle();

                expect(component.state.name).toEqual('opened');

                component.state.toggle();

                expect(component.state.name).toEqual('closed');
            });

            it('on close', function () {
                component.state.toggle();

                expect(component.state.name).toEqual('opened');

                component.close();

                expect(component.state.name).toEqual('closed');
            });

            describe('on execute', function () {
                var callback;

                describe('and no need for confirmation', function () {
                    beforeEach(function () {
                        callback = jasmine.createSpy();
                        component.execute({
                            action: callback
                        });
                    });

                    it('callback is executed', function () {
                        expect(callback).toHaveBeenCalled();
                    });

                    it('component is in closed state', function () {
                        expect(component.state.name).toEqual('closed');
                    });
                });

                describe('and needs confirmation', function () {
                    beforeEach(function () {
                        callback = jasmine.createSpy();
                        component.execute({
                            action: callback,
                            context: 'danger'
                        });
                    });

                    it('component is in confirm state', function () {
                        expect(component.state.name).toEqual('confirm');
                    });

                    describe('when confirmed', function () {
                        beforeEach(function () {
                            component.state.confirm();
                        });

                        it('callback is executed', function () {
                            expect(callback).toHaveBeenCalled();
                        });

                        it('component is in closed state', function () {
                            expect(component.state.name).toEqual('closed');
                        });
                    });

                    it('on close', function () {
                        component.close();

                        expect(component.state.name).toEqual('closed');
                    });
                });
            });
        });
    });

    describe('binEditAction component', function () {
        var component, bindings, $componentController, editCtrl;

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
            component = $componentController('binEditAction', null, bindings);
            component.editCtrl = editCtrl;
            component.$onInit();

            component.handler();

            expect(editCtrl.execute).toHaveBeenCalledWith(component);
        });
    });
});