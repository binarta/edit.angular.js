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

                $ctrl.toggle();

                expect($ctrl.state.name).toEqual('closed');
            });

            it('on close', function () {
                $ctrl.toggle();

                expect($ctrl.state.name).toEqual('opened');

                $ctrl.close();

                expect($ctrl.state.name).toEqual('closed');
            });

            describe('when state is opened', function () {
                beforeEach(function () {
                    $ctrl.toggle();
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

                describe('with actions listeners', function () {
                    var actionId;

                    beforeEach(function () {
                        $ctrl.onShowActionsFor(function (id) {
                            actionId = id;
                        });
                    });

                    it('on show actions', function () {
                        $ctrl.showActionsFor('foo');
                        expect(actionId).toEqual('foo');
                    });

                    describe('on close', function () {
                        beforeEach(function () {
                            $ctrl.close();
                        });

                        it('show main actions', function () {
                            expect(actionId).toBeUndefined();
                        });
                    });
                });

                it('on setButtonCode', function () {
                    $ctrl.setButtonCode('code');
                    expect($ctrl.buttonCode).toEqual('code');
                });
            });
        });

        describe('with isEditable set to false', function () {
            beforeEach(function () {
                $ctrl.isEditable = false;
                topics.subscribe.calls.mostRecent().args[1](true);
            });

            it('component is in hidden state', function () {
                expect($ctrl.state.name).toEqual('hidden');
            });

            describe('and when isEditable changes', function () {
                beforeEach(function () {
                    $ctrl.isEditable = true;
                    $ctrl.$onChanges();
                });

                it('component is in hidden state', function () {
                    expect($ctrl.state.name).toEqual('closed');
                });
            });
        });

        describe('with isEditable set to true', function () {
            beforeEach(function () {
                $ctrl.isEditable = true;
                topics.subscribe.calls.mostRecent().args[1](true);
            });

            it('component is in hidden state', function () {
                expect($ctrl.state.name).toEqual('closed');
            });
        });

        it('when no main actions are subscribed', function () {
            expect($ctrl.hasMainActions()).toBeFalsy();
        });

        describe('when main actions are subscribed', function () {
            beforeEach(function () {
                $ctrl.increaseMainActionCount();
            });

            it('has main actions to show', function () {
                expect($ctrl.hasMainActions()).toBeTruthy();
            });

            it('when main action is unregistered', function () {
                $ctrl.decreaseMainActionCount();
                expect($ctrl.hasMainActions()).toBeFalsy();
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

    describe('binEditActions component', function () {
        var $ctrl, editCtrl;

        beforeEach(function () {
            editCtrl = {
                onShowActionsFor: jasmine.createSpy(),
                setButtonCode: jasmine.createSpy(),
                increaseMainActionCount: jasmine.createSpy(),
                decreaseMainActionCount: jasmine.createSpy()
            };
        });

        describe('when for is not defined', function () {
            beforeEach(inject(function ($componentController) {
                $ctrl = $componentController('binEditActions', null, {});
                $ctrl.editCtrl = editCtrl;
                $ctrl.$onInit();
            }));

            it('actions are visible', function () {
                expect($ctrl.visible).toBeTruthy();
            });

            describe('on show other actions', function () {
                beforeEach(function () {
                    editCtrl.onShowActionsFor.calls.mostRecent().args[0]('other');
                });

                it('actions are hidden', function () {
                    expect($ctrl.visible).toBeFalsy();
                });
            });

            describe('on show no specific actions', function () {
                beforeEach(function () {
                    editCtrl.onShowActionsFor.calls.mostRecent().args[0]();
                });

                it('actions are visible', function () {
                    expect($ctrl.visible).toBeTruthy();
                });

                it('set button text', function () {
                    expect(editCtrl.setButtonCode).toHaveBeenCalledWith(undefined);
                });
            });

            it('on increase action count', function () {
                $ctrl.increaseActionCount();
                expect(editCtrl.increaseMainActionCount).toHaveBeenCalled();
            });

            it('on decrease action count', function () {
                $ctrl.decreaseActionCount();
                expect(editCtrl.decreaseMainActionCount).toHaveBeenCalled();
            });
        });

        describe('when for is defined', function () {
            beforeEach(inject(function ($componentController) {
                $ctrl = $componentController('binEditActions', null, {
                    for: 'for'
                });
                $ctrl.editCtrl = editCtrl;
                $ctrl.$onInit();
            }));

            it('actions are hidden', function () {
                expect($ctrl.visible).toBeFalsy();
            });

            describe('on show other actions', function () {
                beforeEach(function () {
                    editCtrl.onShowActionsFor.calls.mostRecent().args[0]('other');
                });

                it('actions are still hidden', function () {
                    expect($ctrl.visible).toBeFalsy();
                });
            });

            describe('on show actions', function () {
                beforeEach(function () {
                    editCtrl.onShowActionsFor.calls.mostRecent().args[0]('for');
                });

                it('actions are visible', function () {
                    expect($ctrl.visible).toBeTruthy();
                });

                it('set button text', function () {
                    expect(editCtrl.setButtonCode).toHaveBeenCalledWith(undefined);
                });
            });

            it('on increase action count', function () {
                $ctrl.increaseActionCount();
                expect(editCtrl.increaseMainActionCount).not.toHaveBeenCalled();
            });

            it('on decrease action count', function () {
                $ctrl.decreaseActionCount();
                expect(editCtrl.decreaseMainActionCount).not.toHaveBeenCalled();
            });
        });

        describe('when buttonI18nCode is defined', function () {
            beforeEach(inject(function ($componentController) {
                $ctrl = $componentController('binEditActions', null, {
                    for: 'for',
                    buttonI18nCode: 'code'
                });
                $ctrl.editCtrl = editCtrl;
                $ctrl.$onInit();
            }));

            describe('on show actions', function () {
                beforeEach(function () {
                    editCtrl.onShowActionsFor.calls.mostRecent().args[0]('for');
                });

                it('set button text', function () {
                    expect(editCtrl.setButtonCode).toHaveBeenCalledWith('code');
                });
            });
        });
    });

    describe('binEditActionsSelector component', function () {
        var $ctrl, editCtrl, actionsCtrl;

        beforeEach(inject(function ($componentController) {
            $ctrl = $componentController('binEditActionsSelector', null, {
                for: 'foo'
            });
            editCtrl = {
                showActionsFor: jasmine.createSpy()
            };
            actionsCtrl = {
                increaseActionCount: jasmine.createSpy(),
                decreaseActionCount: jasmine.createSpy()
            };
            $ctrl.editCtrl = editCtrl;
            $ctrl.actionsCtrl = actionsCtrl;
            $ctrl.$onInit();
        }));

        it('on execute', function () {
            $ctrl.execute();
            expect(editCtrl.showActionsFor).toHaveBeenCalledWith('foo');
        });

        it('action is registered to actionsCtrl', function () {
            expect(actionsCtrl.increaseActionCount).toHaveBeenCalled();
        });

        describe('on destroy', function () {
            beforeEach(function () {
                $ctrl.$destroy();
            });

            it('action is unregistered', function () {
                expect(actionsCtrl.decreaseActionCount).toHaveBeenCalled();
            });
        });
    });

    describe('binEditAction component', function () {
        var $ctrl, actionSpy, editCtrl, actionsCtrl;

        beforeEach(inject(function ($componentController) {
            actionSpy = jasmine.createSpy('action');
            var bindings = {
                action: actionSpy
            };
            $ctrl = $componentController('binEditAction', null, bindings);
            editCtrl = {
                startWorking: jasmine.createSpy(),
                stopWorking: jasmine.createSpy()
            };
            actionsCtrl = {
                increaseActionCount: jasmine.createSpy(),
                decreaseActionCount: jasmine.createSpy()
            };
            $ctrl.editCtrl = editCtrl;
            $ctrl.actionsCtrl = actionsCtrl;
            $ctrl.$onInit();
        }));

        it('action is registered to actionsCtrl', function () {
            expect(actionsCtrl.increaseActionCount).toHaveBeenCalled();
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
                        finally: jasmine.createSpy()
                    };
                    actionSpy.and.returnValue(deferred);
                    $ctrl.execute();
                });

                it('is executed', function () {
                    expect(actionSpy).toHaveBeenCalled();
                });

                it('is working', function () {
                    expect($ctrl.working).toBeTruthy();
                    expect($ctrl.editCtrl.startWorking).toHaveBeenCalled();
                });

                describe('on finally', function () {
                    beforeEach(function () {
                        deferred.finally.calls.mostRecent().args[0]();
                    });

                    it('is not working', function () {
                        expect($ctrl.working).toBeFalsy();
                        expect($ctrl.editCtrl.stopWorking).toHaveBeenCalled();
                    });
                });
            });
        });

        describe('when working', function () {
            beforeEach(function () {
                $ctrl.working = true;
            });

            describe('on execute action', function () {
                beforeEach(function () {
                    $ctrl.execute();
                });

                it('is not executed', function () {
                    expect(actionSpy).not.toHaveBeenCalled();
                });
            });
        });

        describe('when disabled', function () {
            beforeEach(function () {
                $ctrl.disabled = true;
            });

            describe('on execute action', function () {
                beforeEach(function () {
                    $ctrl.execute();
                });

                it('is not executed', function () {
                    expect(actionSpy).not.toHaveBeenCalled();
                });
            });
        });

        describe('on destroy', function () {
            beforeEach(function () {
                $ctrl.$destroy();
            });

            it('action is unregistered', function () {
                expect(actionsCtrl.decreaseActionCount).toHaveBeenCalled();
            });
        });
    });
});