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
        });

        it('on start working', function () {
            $ctrl.startWorking();
            expect($ctrl.working).toBeTruthy();
        });

        it('on stop working', function () {
            $ctrl.startWorking();
            $ctrl.stopWorking();
            expect($ctrl.working).toBeFalsy();
        });

        describe('with working listeners', function () {
            var isWorking;

            beforeEach(function () {
                $ctrl.onWorking(function (w) {
                    isWorking = w;
                });
            });

            it('on start working', function () {
                $ctrl.startWorking();
                expect(isWorking).toBeTruthy();
            });

            it('on stop working', function () {
                $ctrl.startWorking();
                $ctrl.stopWorking();
                expect(isWorking).toBeFalsy();
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
        var $ctrl, $componentController, actionSpy, editCtrl;

        beforeEach(inject(function (_$componentController_) {
            $componentController = _$componentController_;
            actionSpy = jasmine.createSpy('action');
            var bindings = {
                action: actionSpy
            };
            $ctrl = $componentController('binEditAction', null, bindings);
            editCtrl = {
                onWorking: jasmine.createSpy(''),
                startWorking: jasmine.createSpy(''),
                stopWorking: jasmine.createSpy('')
            };
            $ctrl.editCtrl = editCtrl;
            $ctrl.$onInit();
        }));

        describe('listens on working changes on edit ctrl', function () {
            it('is not working by default', function () {
                expect($ctrl.working).toBeFalsy();
            });

            it('when working', function () {
                editCtrl.onWorking.calls.mostRecent().args[0](true);
                expect($ctrl.working).toBeTruthy();
            });
        });

        describe('on execute action', function () {
            beforeEach(function () {
                $ctrl.execute();
            });

            it('is executed', function () {
                expect(actionSpy).toHaveBeenCalled();
            });

            describe('and action returns an object with a finally callback', function () {
                var deferred;

                beforeEach(function () {
                    deferred = {
                        finally: jasmine.createSpy('')
                    };
                    actionSpy.and.returnValue(deferred);
                    $ctrl.execute();
                });

                it('is executed', function () {
                    expect(actionSpy).toHaveBeenCalled();
                });

                it('is working', function () {
                    expect($ctrl.editCtrl.startWorking).toHaveBeenCalled();
                });

                describe('on finally', function () {
                    beforeEach(function () {
                        deferred.finally.calls.mostRecent().args[0]();
                    });

                    it('is not working', function () {
                        expect($ctrl.editCtrl.stopWorking).toHaveBeenCalled();
                    });
                });
            });
        });
    });
});