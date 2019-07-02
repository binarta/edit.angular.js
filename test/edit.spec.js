describe('bin.edit module', function () {
    beforeEach(module('bin.edit'));

    describe('binEdit component', function () {
        var $ctrl, topics;

        beforeEach(inject(function ($componentController, $rootScope, topicRegistry) {
            topics = topicRegistry;
            this.$element = angular.element('<div></div>');
            this.$scope = $rootScope.$new();
            this.$child = this.$scope.$new();
            $ctrl = $componentController('binEdit', {$element: this.$element, $scope: this.$scope});
            $ctrl.$onInit();
        }));

        it('component starts out in hidden state', function () {
            expect($ctrl.state.name).toEqual('hidden');
        });

        it('component does not expose editing class on element', function () {
            expect(this.$element.hasClass('editing')).toBeFalsy();
        });

        it('register on edit mode event', function () {
            expect(topics.subscribe).toHaveBeenCalledWith('edit.mode', jasmine.any(Function));
        });

        describe('when in edit mode', function () {
            beforeEach(function () {
                topics.subscribe.calls.mostRecent().args[1](true);
            });

            it('component is in visible state', function () {
                expect($ctrl.state.name).toEqual('visible');
            });

            it('component exposes editing class on element', function () {
                expect(this.$element.hasClass('editing')).toBeTruthy();
            });

            describe('when leaving edit mode', function() {
                beforeEach(function() {
                    topics.subscribe.calls.mostRecent().args[1](false);
                });

                it('component is in hidden state', function () {
                    expect($ctrl.state.name).toEqual('hidden');
                });

                it('component does not expose editing class on element', function () {
                    expect(this.$element.hasClass('editing')).toBeFalsy();
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

                it('component is in visible state', function () {
                    expect($ctrl.state.name).toEqual('visible');
                });
            });
        });

        describe('with isEditable set to true', function () {
            beforeEach(function () {
                $ctrl.isEditable = true;
                topics.subscribe.calls.mostRecent().args[1](true);
            });

            it('component is in visible state', function () {
                expect($ctrl.state.name).toEqual('visible');
            });
        });

        describe('on bin.actionsevents', function() {
            beforeEach(inject(function($rootScope) {
                ensureEventsAreNotPropagated($rootScope);
            }));

            function ensureEventsAreNotPropagated($rootScope) {
                ['bin.actions.opened', 'bin.actions.closed'].forEach(function(event) {
                    $rootScope.$on(event, function() {
                        fail();
                    })
                });
            }

            it('adds an open class to the component element when the opened event is received', function() {
                this.$child.$emit('bin.actions.opened');

                expect(this.$element.hasClass('open')).toBe(true);
            });

            it('removes the open class again when the closed event is received', function() {
                this.$child.$emit('bin.actions.opened');
                this.$child.$emit('bin.actions.closed');

                expect(this.$element.hasClass('open')).toBe(false);
            })
        });

        describe('on destroy', function () {
            beforeEach(function () {
                $ctrl.$onDestroy();
            });

            it('edit mode listener is unsubscribed', function () {
                var listener = topics.subscribe.calls.mostRecent().args[1];
                expect(topics.unsubscribe).toHaveBeenCalledWith('edit.mode', listener);
            });

            it('removes the listener for bin.actions.opened', function() {
                this.$child.$emit('bin.actions.opened');

                expect(this.$element.hasClass('open')).toBe(false);
            });

            it('removes the listener for bin.actions.closed', function() {
                this.$element.addClass('open');

                this.$child.$emit('bin.actions.closed');

                expect(this.$element.hasClass('open')).toBe(true);
            })
        });
    });
});